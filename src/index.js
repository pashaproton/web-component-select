class WebComponentSelect extends HTMLElement {
  #options = [];
  #valueInput;
  #searchInput;
  #optionsWrapp;
  #notFoundOption;
  #optionStyleDisplay;

  constructor() {
    super()
  }

  #resetOptions() {
    this.#options.forEach(option => {
      option.style.display = this.#optionStyleDisplay;
    });
  }

  #showOptions() {
    this.classList.add("active");
  }

  #filterOptions(e) {
    const value = e.target.value.toLowerCase();

    this.#options.forEach(option => {
      if (option.innerHTML.toLowerCase().includes(value)) {
        option.style.display = this.#optionStyleDisplay;
      } else {
        option.style.display = "none";
      }
    });

    if (
      value.length > 0
      && this.#options
        .filter(option => !option.hasAttribute('data-not-found'))
        .every(option => option.style.display === "none")
    ) {
      this.#notFoundOption.style.display = this.#optionStyleDisplay;
    } else {
      this.#notFoundOption.style.display = "none";
    }
  }

  #createValueInput() {
    this.#valueInput = document.createElement("input");
    this.#valueInput.setAttribute("type", "hidden");
    this.#valueInput.setAttribute("name", this.getAttribute("name"));
    this.#valueInput.setAttribute("value", this.getAttribute("value"));
    this.appendChild(this.#valueInput);
    this.removeAttribute("value");
  }

  #createSearchInput() {
    const ignoreAttributes = ["placeholder"];
    this.#searchInput = document.createElement("input");

    this.getAttributeNames().forEach(attrName => {
      if (!ignoreAttributes.includes(attrName)) {
        this.#searchInput.setAttribute(attrName, this.getAttribute(attrName));
        this.removeAttribute(attrName);
      }
    });

    this.#searchInput.setAttribute("type", "text");
    this.#searchInput.setAttribute("placeholder", this.getAttribute("placeholder") || "Search...");
    this.removeAttribute("placeholder");

    this.#searchInput.addEventListener("click", this.#showOptions.bind(this));
    this.#searchInput.addEventListener("focus", this.#showOptions.bind(this));
    this.#searchInput.addEventListener("input", this.#filterOptions.bind(this));
    this.appendChild(this.#searchInput);
  }

  #createOptions() {
    this.#optionsWrapp = document.createElement("div");

    for (let i = 0; i < this.childNodes.length; i++) {
      if (this.childNodes[i].tagName === "OPTION") {
        const option = document.createElement("div");
        option.innerHTML = this.childNodes[i].innerHTML;
        option.setAttribute("data-value", this.childNodes[i].getAttribute("value"));

        if (this.childNodes[i].hasAttribute("data-not-found")) {
          // option.click = this.childNodes[i].click;
          option.setAttribute("data-not-found", "");

          if (this.childNodes[i].hasAttribute("click")) {
            option.setAttribute("click", this.childNodes[i].getAttribute("click"));

            option.addEventListener("click", e => {
              const click = new Function(e.target.getAttribute("click"));
              click();
            });
          }
        } else {
          option.addEventListener("click", e => {
            this.#valueInput.value = e.target.dataset.value;
            this.#searchInput.value = e.target.innerHTML.trim();

            const changeEvent = new CustomEvent("onchange", {
              detail: {
                value: e.target.dataset.value
              }
            });
            this.dispatchEvent(changeEvent);

            window.setTimeout(() => {
              this.#resetOptions();
            }, 200);
          });
        }

        this.#optionsWrapp.appendChild(option);
        this.#options.push(option);
        this.#optionStyleDisplay = option.style.display;

        if (this.childNodes[i].getAttribute("value") === this.#valueInput.value) {
          this.#searchInput.value = this.childNodes[i].innerHTML;
        }

        this.childNodes[i].remove();
      }
    }

    this.appendChild(this.#optionsWrapp);
  }

  #createNotFoundOption() {
    this.#notFoundOption = this.#optionsWrapp.querySelector("[data-not-found]");

    if (!this.#notFoundOption) {
      this.#notFoundOption = document.createElement("div");
      this.#notFoundOption.innerHTML = "Not found";
      this.#notFoundOption.setAttribute("data-not-found", "");
    }

    this.#notFoundOption.style.display = "none";
    this.#optionsWrapp.appendChild(this.#notFoundOption);
  }

  connectedCallback() {
    this.#createValueInput();
    this.#createSearchInput();
    this.#createOptions();
    this.#createNotFoundOption();

    document.addEventListener("click", (e) => {
      if (e.target !== this.#searchInput) {
        this.classList.remove("active");
      }
    });
  }

  disconnectedCallback() {
    this.#searchInput.removeEventListener("click", this.#showOptions.bind(this));
    this.#searchInput.removeEventListener("focus", this.#showOptions.bind(this));
    this.#searchInput.removeEventListener("input", this.#filterOptions.bind(this));
  }
}

window.customElements.define("web-component-select", WebComponentSelect);
