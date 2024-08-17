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

  const scraperOn = localStorage.getItem("scraperOn");

  const onLight = document.createElement('div');
  onLight.style.position = 'fixed';
  onLight.style.top = '0px';
  onLight.style.right = '0px';
  onLight.style.width = '50px';
  onLight.style.height = '50px';
  onLight.style.backgroundColor = scraperOn === 'on' ? 'green' : 'red';

  document.body.appendChild( onLight );

  if (scraperOn === "on") {
    scrapePosts();
  }

  function scrapePosts() {
    const postElements = document.getElementsByClassName("contentlook");
    const posts = Array.from(postElements);

    const savedPostData = getSavedPostData();

    posts.forEach((post) => {
      const post_header = post.previousElementSibling;

      const postData = {
        authorName: "",
        timestamp: "",
        link: "",
        contentHTML: "",
      };

      if (post.querySelector("form")) {
        return;
      }

      postData.timestamp = post_header.querySelector("span").innerHTML;
      postData.link = post_header.querySelector("a").href;

      postData.authorName = post.querySelector("div span a").text;
      postData.contentHTML = post.querySelector("div:last-of-type").outerHTML;
      savedPostData.push(postData);
    });

    console.log(savedPostData);

    storeSavedPostData(savedPostData);
  }

  function getSavedPostData() {
    let savedPostData = localStorage.getItem("savedPostData");
    if (!savedPostData) {
      return [];
    }

    return JSON.parse(savedPostData);
  }

  function storeSavedPostData(savedPostData) {
    const stringedData = JSON.stringify(savedPostData);
    localStorage.setItem("savedPostData", stringedData);
  }

  function clearSavedPostData() {
    localStorage.removeItem("savedPostData");
  }

  function toggleScript() {
    let current = localStorage.getItem("scraperOn");

    console.log('getting "current" value');
    console.log(current);

    if (current === "off") {
      localStorage.setItem("scraperOn", "on");
      onLight.style.backgroundColor = 'green';
    } else {
      localStorage.setItem("scraperOn", "off");
      onLight.style.backgroundColor = 'red';
    }
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "4" && event.altKey) {
      console.log("toggle");
      toggleScript();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "3" && event.altKey) {
      clearSavedPostData();
    }
  });
})();
