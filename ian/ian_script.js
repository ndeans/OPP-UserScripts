class Scraper2 {
  constructor() {
      this.state = {};
      this.onLight = null;
      this.messageBox = null;

      this.init();
  }

  init() {
      this.loadState();
      this.buildOnLight();
      this.buildMessageBox();
      this.addKeyControls();
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

  updateOnLight() {
      if (this.state.active) {
          this.onLight.style.backgroundColor = 'green';
      } else {
          this.onLight.style.backgroundColor = 'red';
      }

  }

  buildMessageBox() {
      const mBox = document.createElement("div");
      mBox.style = {
          width: "600px",
          height: "200px",
          position: "fixed",
          backgroundColor: "black",
          display: "none",
      };
      this.messageBox = mBox;
  }

  toggleMessageBox() {
      if (this.messageBox.style.display === "none") {
          this.messageBox.style.display = "block";
      } else {
          this.messageBox.style.display = "none";
      }
  }

  toggleScript() {
      this.state.active = !this.state.active;
      this.saveState();
      this.updateOnLight();
  }

  clearState() {
      localStorage.removeItem('scraper_state');
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

      this.state = {
          active: false,
          topic: "",
          totalPages: 0,
          currentPage: 0,
          posts: [],
      };
  }

  addKeyControls = () => {
      document.addEventListener("keydown", (event) => {
          if (event.key === "4" && event.altKey) {
              this.toggleScript();
          }
      });

      document.addEventListener("keydown", (event) => {
          if (event.key === "3" && event.altKey) {
              this.clearState();
          }
      });

      document.addEventListener('keyup', event => {
          if (event.key === '1' && event.altKey ) {
              this.toggleMessageBox();
          }
      })


  };
}