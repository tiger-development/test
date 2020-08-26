class Button {
    // Initialisation
    constructor(spec, parentWidthPix, parentHeightPix) {
        this.id = spec.id;
        this.className = spec.className;
        this.text = spec.text;
        this.type = spec.type;
        this.open = spec.open;
        this.selected = spec.selected;
        this.widthPerc = spec.widthPerc;
        this.heightPerc = spec.heightPerc;
        this.widthPix = parentWidthPix * this.widthPerc/100;
        this.heightPix = parentHeightPix * this.heightPerc/100;
        this.node = this.createNode();
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


}
