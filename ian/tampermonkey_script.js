// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2024-08-17
// @description  try to take over the world!
// @author       You
// @match        https://www.onepoliticalplaza.com/t-*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=onepoliticalplaza.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  class Scraper {
      constructor() {
          this.state = {};
          this.onLight = null;
          this.overlay = null;
          this.fetchURL = "http://vortex.lan:8080/Raven-Jakarta/opp/upload";

          this.init();
      }

      init() {
          this.loadState();
          this.buildOnLight();
          this.buildOverlay();
          this.addKeyControls();

          if (this.state.active) {
              this.scrapePosts();
          }
      }

      buildOnLight() {
          const onLight = document.createElement("div");
          onLight.style.position = "fixed";
          onLight.style.top = "0px";
          onLight.style.right = "0px";
          onLight.style.width = "50px";
          onLight.style.height = "50px";
          onLight.style.backgroundColor = this.state.active ? "green" : "red";
          this.onLight = onLight;
          document.body.appendChild(this.onLight);
      }

      buildOverlay() {
          const mBox = document.createElement("div");
          mBox.style.top = "0";
          mBox.style.left = "0";
          mBox.style.width = "80vw";
          mBox.style.height = "60vh";
          mBox.style.zIndex = "5000";
          mBox.style.position = "fixed";
          mBox.style.backgroundColor = "rgba(1, 11, 20, .85)";
          mBox.style.color = "#000";
          mBox.style.display = "none";
          mBox.style.marginTop = "10%";
          mBox.style.marginLeft = "auto";
          mBox.style.marginRight = "auto";

          const pageCounterEl = document.createElement("div");
          pageCounterEl.style.backgroundColor = "#FFF";
          pageCounterEl.style.color = "#000";
          pageCounterEl.style.height = "40px";
          pageCounterEl.style.width = "40px";
          pageCounterEl.textContent = "0";
          pageCounterEl.style.display = "flex";
          pageCounterEl.style.justifyContent = "center";
          pageCounterEl.style.alignItems = "center";

          mBox.appendChild(pageCounterEl);

          this.overlay = mBox;
          document.body.appendChild(this.overlay);
      }

      toggleOverlay() {
          if (this.overlay.style.display === "none") {
              this.overlay.style.display = "block";
          } else {
              this.overlay.style.display = "none";
          }
      }

      toggleScript() {
          this.state.active = !this.state.active;
          this.toggleLight();
          this.saveState();
      }

      toggleLight() {
          if (this.state.active) {
              this.onLight.style.backgroundColor = "green";
          } else {
              this.onLight.style.backgroundColor = "red";
          }
      }

      saveState() {
          localStorage.setItem("scraper_state", JSON.stringify(this.state));
      }

      loadState() {
          let state = localStorage.getItem("scraper_state");

          if (state) {
              this.state = JSON.parse(state);
              return;
          }

          this.state = this.newState();
      }

      resetState() {
          this.state = this.newState();
          this.saveState();
      }

      newState() {
          return {
              active: false,
              topic: "",
              totalPages: 0,
              currentPage: 0,
              posts: [],
          };
      }

      savePosts(posts) {
          this.state.posts = this.state.posts.concat(posts);
          this.saveState();
      }

      scrapePosts() {
          if (!this.state.active) {
              console.info("Scraper Script Inactive");
              return;
          }
          console.info("Scraper Script Active: scraping posts...");
          const posts = document.querySelectorAll(".contentlook");
          const postsData = [];

          for (let post of posts) {
              let postData = JSON.stringify(post.innerHTML);
              console.log(postData);
              postsData.push(postData);
          }
          this.savePosts(postsData);

          let nextBtn = null;
          let buttons = document.querySelectorAll(".btnlink");
          for (let btn of buttons) {
              if (btn.innerHTML === "next&gt;") {
                  nextBtn = btn;
              }
          }

          if (nextBtn) {
              nextBtn.click();
          } else {
              this.toggleScript();
              this.submitSelection();
          }
      }

      // will eventually submit the selected posts to webservice
      async submitSelection() {
          let headers = new Headers({
              "Content-Type": "application/json",
              Accept: "application/json",
              "Access-Control-Allow-Origin": "*",
          });

          let options = {
              method: "POST",
              headers: headers,
              mode: "cors",
              body: JSON.stringify({ stuff: "Things" }),
          };

          let response = undefined;

          try {
              response = await fetch(this.fetchURL, options);
              console.info("Fetch Successful");
          } catch (error) {
              console.error("Fetch Failed");
              console.error(error);
              return
          }

          try {
              console.info("Parsing response data...");
              let data = response.text();
              console.info("Parsing succeeded");
              console.log(data);
          } catch (error) {
              console.error("Parsing failed");
              console.error(error);
          }
      }

      addKeyControls = () => {
          document.addEventListener("keyup", (event) => {
              if (event.key === "1" && event.altKey) {
                  console.info("KeyControl: Toggle Overlay");
                  this.toggleOverlay();
              } else if (event.key === "2" && event.altKey) {
                  console.info("KeyControl: Toggle Script");
                  this.toggleScript();
              } else if (event.key === "3" && event.altKey) {
                  console.info("KeyControl: Start Scrape");
                  this.scrapePosts();
              } else if (event.key === "5" && event.altKey) {
                  console.info("KeyControl: Clear Data");
                  this.resetState();
              }
          });
      };
  }

  const scraper = new Scraper();


})();
