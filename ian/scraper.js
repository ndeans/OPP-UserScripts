class Scraper {
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

  buildMessageBox() {
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

    const pageCounterEl = document.createElement('div');
    pageCounterEl.style.backgroundColor = '#FFF';
    pageCounterEl.style.color = '#000';
    pageCounterEl.style.height = '40px';
    pageCounterEl.style.width = '40px';
    pageCounterEl.textContent = '0';
    pageCounterEl.style.display = 'flex';
    pageCounterEl.style.justifyContent = 'center';
    pageCounterEl.style.alignItems = 'center';



    mBox.appendChild(pageCounterEl)

    this.messageBox = mBox;
    document.body.appendChild(this.messageBox)
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
    this.toggleLight();
    this.saveState();
  }

  toggleLight() {
    if (this.state.active) {
      this.onLight.style.backgroundColor = 'green';
    } else {
      this.onLight.style.backgroundColor = 'red';
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
      if (event.key === "2" && event.altKey) {
        console.info('KeyControl: Toggle Script');
        this.toggleScript();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "3" && event.altKey) {
        console.info('KeyControl: Clear Data');
        this.clearSavedPostData();
      }
    });
    
    document.addEventListener('keyup', event => {
      if (event.key === '1' && event.altKey ) {
        console.info('KeyControl: Toggle Message Box');
        this.toggleMessageBox();
      }
    })
  
  
  };
}

const scraper = new Scraper();
