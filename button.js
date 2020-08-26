class Button {
    // Initialisation
    constructor(spec, parentWidthPix, parentHeightPix) {
        console.log(spec)
        this.id = spec.id;
        this.type = spec.type;
        this.className = spec.className;
        this.text = spec.text;
        this.target = spec.target;
        // Size
        this.widthPerc = spec.widthPerc;
        this.heightPerc = spec.heightPerc;
        this.widthPix = parentWidthPix * this.widthPerc/100;
        this.heightPix = parentHeightPix * this.heightPerc/100;
        // Node creation
        this.node = this.createNode();
        // Button handler
        this.clickOn(spec.buttonHandler, spec.subHandler);
        //this.hoverListenerOn();
    }

    createNode() {
        let divButton = document.createElement("div");
        divButton.setAttribute('id', this.id);
        divButton.setAttribute('class', this.className);
        //divButton.style.width = (this.widthPix * 0.88).toFixed(2) + 'px';
        divButton.style.width = (this.widthPix * 0.90).toFixed(2) + 'px';
        divButton.style.height = (this.heightPix * 0.98).toFixed(2) + 'px';
        divButton.style.paddingLeft = (this.widthPix * 0.05).toFixed(2) + 'px';
        divButton.style.paddingRight = (this.widthPix * 0.05).toFixed(2) + 'px';
        //divButton.style.margin = (this.widthPix * 0.01).toFixed(2) + 'px';
        //divButton.style.marginTop = '0px';
        divButton.style.marginBottom = (this.widthPix * 0.01).toFixed(2) + 'px';

        //if (this.type === 'menu') {
          //  if (this.open === false) {
            //    divButton.innerHTML = this.text + ' &#8681';
      //      } else if (this.open === true) {
        //        divButton.innerHTML = this.text + ' &#8679';
          //  }
        //} else {
            divButton.innerHTML = this.text;
        //}
        return divButton;
    }

    clickOn(buttonHandler, subHandler) {

        console.log("clickOn")
        console.log(buttonHandler)
        console.log(subHandler)
        console.log(this.target)
        if (subHandler !== false) {
            console.log(this.target.subHandler)
            this.target.subHandler = subHandler;
        }
        this.node.addEventListener("click", this.clickRef = buttonHandler.bind(this.target));
    }





}
