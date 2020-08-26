// GENERICS
// ---------

// Automated page constructor
class Page {
    // Initialisation
    constructor(sectionSpec, panelSpecs, boxSpecs) {
        // Set up section
        this.section = new Section(sectionSpec, '');

        // Set up panels
        this.panels = {};
        for (let panelSpec of panelSpecs) {
            panelSpec.topPerc = 0;
            this.panels[panelSpec.id] = new Panel(panelSpec, this.section);
            this.section.node.appendChild(this.panels[panelSpec.id].node);
        }

        // Set up boxes
        this.boxes = {};
        let parentId = '';
        let parentOffset = 0;
        for (let [i, boxSpec] of boxSpecs.entries()) {
            let parent = this.panels[boxSpec.parent];
            if (parent.id !== parentId) {
                parentId = parent.id;
                parentOffset = i;
            }
            boxSpec.topPerc = (i - parentOffset) * 2;

            this.boxes[boxSpec.id] = this.createBox(boxSpec, parent);
            parent.node.appendChild(this.boxes[boxSpec.id].node);
        }

        this.subHandler;
    }

    // Set up buttons
    setupButtons(buttonSpecs) {
        console.log(buttonSpecs)
        this.buttons = {};
        for (let buttonSpec of buttonSpecs) {
            let parent = this.boxes[buttonSpec.box];
            parent.addButton(buttonSpec);
        }
    }

    createBox(boxSpec, parent) {
        return new Box(boxSpec, parent)
    }

    chartClickHandler(e) {
        console.log(this)
        console.log('button clicked')
        console.log(e)
        console.log(this.boxes)

        for (const boxName in this.boxes) {
            let box = this.boxes[boxName];
            if (box.hasOwnProperty('chart')) {
                if (box.chart instanceof Chart) {
                    console.log('instance of chart')
                    console.log(this.subHandler)
                    const boundSubHandler = this.subHandler.bind(box.chart.handlersCollection);
                    boundSubHandler();
                }
            }
        }

    }
}

// Div containers for sections / panels / boxes
class Display {
    // Initialisation
    constructor(spec, parent) {
        this.parent = parent;
        this.id = spec.id;
        this.widthPerc = spec.widthPerc;
        this.heightPerc = spec.heightPerc;
        this.colourScheme = spec.colourScheme;
        this.content;
        this.chart;
        this.buttons = [];
    }

    createNode(divId, className, width, height, top) {
        let divNode = document.createElement("div");
        divNode.setAttribute('id', divId);
        divNode.setAttribute('class', className);
        divNode.style.width = width.toFixed(2) + 'px';
        divNode.style.height = height.toFixed(2) + 'px';
        divNode.style.top = top.toFixed(2) + 'px';
        //divNode.style.backgroundColor = colour;
        return divNode;
    }

    addLineChart() {
        this.content = 'lineChart';
        this.chart = new LineChart(this.widthPix, this.heightPix);
        this.node.appendChild(this.chart.node);
    }

    addCandleChart() {
        this.content = 'candleChart';
        this.chart = new CandleChart(this.widthPix, this.heightPix);
        this.node.appendChild(this.chart.node);
    }

    addBarChart() {
        this.content = 'barChart';
        this.chart = new BarChart(this.widthPix, this.heightPix);
        this.node.appendChild(this.chart.node);
    }

    addButton(spec) {
        let newButton = new Button(spec, this.widthPix, this.heightPix)
        this.buttons.push(newButton);
        this.node.appendChild(newButton.node);
    }

    clearChart() {
        this.deleteChart();
    }

    deleteChart() {
        // Clear chart node
        this.clearNode();
        // Clear chart info
        this.chart = '';
    }

    clearNode() {
        while (this.node.firstChild) {
            this.node.removeChild(this.node.lastChild);
        }
    }
}

class Section extends Display {
    // Initialisation
    constructor(spec, parent) {
        super(spec, parent);
        this.widthPix = window.innerWidth * spec.widthPerc/100;
        this.heightPix = window.innerWidth * spec.heightPerc/100;
        this.topPix = 0;
        this.node = document.getElementById(spec.id);
        this.node.style.width = spec.widthPix + 'px';
        this.node.style.height = spec.heightPix + 'px';
    }
}

class Panel extends Display {
    // Initialisation
    constructor(spec, parent) {
        super(spec, parent);
        this.widthPix = this.parent.widthPix * this.widthPerc/100;
        this.heightPix = this.parent.heightPix * this.heightPerc/100;
        this.topPix = this.parent.heightPix * spec.topPerc/100;
        this.node = this.createNode(this.id, 'panel ' + this.colourScheme, this.widthPix, this.heightPix, this.topPix);
    }
}

class Box extends Display {
    // Initialisation
    constructor(spec, parent) {
        super(spec, parent);
        this.widthPix = this.parent.widthPix * this.widthPerc/100;
        this.heightPix = this.parent.heightPix * this.heightPerc/100;
        this.topPix = this.parent.heightPix * spec.topPerc/100;
        this.node = this.createNode(this.id, 'box ' + this.colourScheme, this.widthPix, this.heightPix, this.topPix);
    }
}

// SPECIFICS
// ---------

class HeyPage extends Page {
    createBox(boxSpec, parent) {
        return new HeyBox(boxSpec, parent)
    }
}

class HeyBox extends Box {

    addLineChart(chartData) {
        // Clear box and add chart
        this.clearChart();
        // Add line chart (this.chart)
        super.addLineChart();

        // Add data and draw chart
        this.chart.addDataRanges(chartData);
        this.chart.drawChart();
        this.chart.hoverListenerOn();
    }

}
