class Chart {
    // Initialisation
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.node = this.createLayer('chart');
        this.dimensions = new ChartDimensions(this.width, this.height);
        this.dataRanges = {};
        this.timePeriod = '';
        //this.yScale; // created once data added
        //this.xScale; // created once data added
    }

    get dataRangesLength() {
        return Object.keys(this.dataRanges).length;
    }

    // Create chart SVG layer element
    createLayer(className) {
        let layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        layer.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        layer.setAttribute('width', this.width);
        layer.setAttribute('height', this.height);
        layer.setAttribute('viewBox', '0, 0, ' + this.width +  ', ' + this.height);
        layer.setAttribute('class', className);
        return(layer);
    }

    addDataRanges(chartDataRanges) {
        console.log(chartDataRanges)
        for (let chartDataRange of chartDataRanges) {
            console.log(chartDataRange.label)
            if (this.timePeriod === '') {
                this.timePeriod = chartDataRange.timePeriod;
                chartDataRange.valid = true;
            } else {
                chartDataRange.valid = false;
            }
            this.dataRanges[chartDataRange.label] = chartDataRange;
        }
        console.log(this.dataRanges)
    }

    drawChart() {
        this.calculateScales();
        this.assignPathColours();
        this.drawYScale()
        this.drawXScale()
        this.drawPaths()
    }

    calculateScales() {
        this.yScale = new YScale(this.dataRanges, ['value'], false, false);
        this.xScale = new XScale(this.dataRanges, this.timePeriod);
        this.dimensions.addVerticalUnit(this.yScale);
        this.dimensions.addhorizontalUnit(this.xScale);
    }

    assignPathColours() {
        let i=0;
        for (let dataRangeName in this.dataRanges) {
            let dataRange = this.dataRanges[dataRangeName];
            if (dataRange.colour === false) {
                dataRange.colour = this.gradedColour(i, this.dataRangesLength);
            }
            i+=1;
        }
    }

    gradedColour(i, totalColours) {
        var colourString = "hsl(" + 360*i/totalColours + ",90%,40%)";
        return colourString;
    }

    drawYScale() {
        let yScaleView = new YScaleView(this.yScale, this.dimensions);
        this.node.appendChild(yScaleView.verticalAxis);
        this.node.appendChild(yScaleView.verticalAxisGraduationLines);
        yScaleView.verticalLabels.forEach(x => this.node.appendChild(x));
    }

    drawXScale() {
        let xScaleView = new XScaleView(this.xScale, this.dimensions);
        this.node.appendChild(xScaleView.horizontalAxis);
        this.node.appendChild(xScaleView.horizontalAxisGraduationLines);
        xScaleView.horizontalLabels.forEach(x => this.node.appendChild(x));
    }

    createGroup(id, className) {
        // Add group
        let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', id);
        group.setAttribute('class', className);
        return(group);
    }


    hoverListenerOn() {
        this.node.addEventListener("mouseover", this.hoverRef = this.hoverHandler.bind(this));
    }

    hoverListenerOff() {
        this.node.removeEventListener("mouseover", this.hoverRef);
    }

    hoverEndOn() {
        this.node.addEventListener("mousemove", this.hoverEndRef = this.hoverEndHandler.bind(this));
    }

    hoverEndOff() {
        this.node.removeEventListener("mousemove", this.hoverEndRef);
    }


    hideAllPathsExcept(id) {
        // Loop through all nodes of the chart layer
        for (let child of this.node.childNodes) {
            // Check for path groups
            if (child.tagName === "g" && child.className.baseVal === "pathGroup") {
                // Show children of path group wwhich matches id
                if (child.id === id) {
                    for (let grandChild of child.childNodes) {
                        grandChild.setAttribute('display', 'block');
                    }
                // Hide children of path group wwhich do not match id
                } else {
                    for (let grandChild of child.childNodes) {
                        grandChild.setAttribute('display', 'none');
                    }
                }
            }
        }
    }

    showAllPaths() {
        // Loop through all nodes of the chart layer
        for (let child of this.node.childNodes) {
            // Check for path groups
            if (child.tagName === "g" && child.className.baseVal === "pathGroup") {
                for (let grandChild of child.childNodes) {
                    // Show path children of path groups
                    if (grandChild.tagName == "path") {
                        grandChild.setAttribute('display', 'block');
                    // Hide text children of path groups
                    } else if (grandChild.tagName == "text") {
                        grandChild.setAttribute('display', 'none');
                    }
                }
            }
        }
    }

    hoverHandler(e) {
        if (e.target.tagName == "path" && e.target.className.baseVal == "return") {
            this.hoverListenerOff()
            this.hideAllPathsExcept(e.target.id)
            setTimeout(this.hoverEndOn.bind(this), 500);
        }
    }

    hoverEndHandler(e) {
        this.hoverEndOff()
        this.showAllPaths()
        this.hoverListenerOn()
    }

}


class LineChart extends Chart {
    drawPaths() {
        for (let dataRangeName in this.dataRanges) {
            console.log("-----" + dataRangeName + "-----")
            let dataRange = this.dataRanges[dataRangeName];
            let group = this.createGroup(dataRange.label, "pathGroup");
            let chartPath = new LineChartPath(dataRange, this.dimensions, this.yScale, this.xScale);
            group.appendChild(chartPath.path);
            let pathText = new PathText(dataRange.label, this.dimensions);
            group.appendChild(pathText.hoverLabel);
            this.node.appendChild(group);
        }
    }
}

class CandleChart extends Chart {
    calculateScales() {
        this.yScale = new YScale(this.dataRanges, ['open', 'close'], false, false);
        this.xScale = new XScale(this.dataRanges, this.timePeriod);
        this.dimensions.addVerticalUnit(this.yScale);
        this.dimensions.addhorizontalUnit(this.xScale);
    }

    drawPaths() {
        for (let dataRangeName in this.dataRanges) {
            let dataRange = this.dataRanges[dataRangeName];
            let group = this.createGroup(dataRange.label, "pathGroup");
            let chartPaths = new CandleChartPath(dataRange, this.dimensions, this.yScale, this.xScale);
            for (let path of chartPaths.paths) {
                group.appendChild(path);
            }
            this.node.appendChild(group);
        }
    }
}

class BarChart extends Chart {
    calculateScales() {
        this.yScale = new YScale(this.dataRanges, ['value'], 0, 0);
        this.xScale = new XScale(this.dataRanges, this.timePeriod);
        this.dimensions.addVerticalUnit(this.yScale);
        this.dimensions.addhorizontalUnit(this.xScale);
    }

    drawPaths() {
        for (let dataRangeName in this.dataRanges) {
            let dataRange = this.dataRanges[dataRangeName];
            let group = this.createGroup(dataRange.label, "pathGroup");
            let chartPath = new BarChartPath(dataRange, this.dimensions, this.yScale, this.xScale);
            group.appendChild(chartPath.path);
            this.node.appendChild(group);
        }
    }

}


class PathText {
    // Initialisation
    constructor(label, dimensions) {
        this.label = label;
        this.dimensions = dimensions;
    }

    get hoverLabel() {
        let element = this.textLabel;
        element.setAttribute('display', 'none');
        return element;
    }

    get textLabel() {
        let element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        let text = document.createTextNode(this.label);
        element.appendChild(text);
        element.setAttribute('font-size', 14);
        element.setAttribute('fill', 'rgba(120, 120, 120, 1)');
        element.setAttribute('x', this.dimensions.width / 2);
        element.setAttribute('y', 14*1.5);
        element.setAttribute('text-anchor', 'middle');
        element.setAttribute('alignment-baseline', 'middle');
        element.setAttribute('font-weight', 'bold');
        return element;
    }
}



class ChartPath {
    // Initialisation
    constructor(dataRange, dimensions, yScale, xScale) {
        this.dataRange = dataRange;
        this.dimensions = dimensions;
        this.yScale = yScale;
        this.xScale = xScale;
        //console.log(this)
        //this.path;
        //this.colour = this.dataRange.colour;
    }

    // Draw SVG plotLine
    drawPath(path, lineColour, fillColour) {
        let plotLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        plotLine.setAttribute('d', path);
        plotLine.setAttribute('stroke', lineColour);
        plotLine.setAttribute('stroke-opacity', '0.75');
        plotLine.setAttribute('fill', fillColour);
        plotLine.setAttribute('stroke-linecap', 'round');
        plotLine.setAttribute('class', 'return');
        plotLine.setAttribute('id', this.dataRange.label);
        plotLine.style.strokeWidth = this.dataRange.strokeWidth;
        return plotLine;
    }
}

class ChartPathSingle extends ChartPath {
    // Initialisation
    constructor(dataRange, dimensions, yScale, xScale) {
        super(dataRange, dimensions, yScale, xScale);
        this.colour = this.dataRange.colour;
        //this.path;
    }
}

class ChartPathMultiple extends ChartPath {
    // Initialisation
    constructor(dataRange, dimensions, yScale, xScale) {
        super(dataRange, dimensions, yScale, xScale);
        //console.log(this)
        this.colours = this.dataRange.colours;
        //this.paths;
        //console.log(this)
    }
}

class LineChartPath extends ChartPathSingle {
    get path() {
        return this.drawPath(this.createPath(), this.colour, 'none')
    }

    createPath() {
        console.log(this.dataRange)
        let dataToPlot = this.dataRange.dateValues;
        // Create plot line
        let plotLinePath = '';
        let plotLetter = ' M ';
        let j = 0;

        for (let [i, date] of this.xScale.fullDates.entries()) {

            if (Number(dataToPlot[j].date) < Number(date) && j <= dataToPlot.length - 1) {
                while (Number(dataToPlot[j].date) <= Number(date) && j <= dataToPlot.length - 1) {
                    j+=1;
                }
            }

            if (Number(dataToPlot[j].date) === Number(date)) {
                if (this.dataRange.label === 'ADA') {
                    console.log(i, date)
                    console.log(Number(dataToPlot[j].date), Number(date))
                }

                if (dataToPlot[j].value !== '') {
                    plotLinePath +=
                        plotLetter + (this.dimensions.borderSpace + this.dimensions.verticalScale + (i * this.dimensions.horizontalUnit)) +
                        ' ' + (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (dataToPlot[j].value - this.yScale.min) * this.dimensions.verticalUnit);
                    plotLetter = ' L ';
                } else {
                    plotLetter = ' M ';
                }
                j = Math.min(j+1, dataToPlot.length-1);
            } else {
                plotLetter = ' M ';
            }
        }
        return plotLinePath;
    }
}

class BarChartPath extends ChartPathSingle {
    get path() {
        return this.drawPath(this.createPath(), this.colour, this.colour)
    }

    //// STILL NEED TO ALLOW FOR MISSING DATA!
    createPath() {
        let dataToPlot = this.dataRange.dateValues;
        console.log(this.dataRange.dateValues)
        // Create plot line
        let plotLinePath = '';
        for (let i=0; i<dataToPlot.length; i+=1) {
            // No bar if at minimum value
            //if (!(dataToPlot[i].value === chartLayer.yScale.min)) {
            if (!(dataToPlot[i].value === 0)) {
                plotLinePath = plotLinePath +
                ' M ' + (this.dimensions.borderSpace + this.dimensions.verticalScale + ((i-0.25) * this.dimensions.horizontalUnit)) + ' ' + (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (dataToPlot[i].value - this.yScale.min) * this.dimensions.verticalUnit) +
                ' L ' + (this.dimensions.borderSpace + this.dimensions.verticalScale + ((i+0.25) * this.dimensions.horizontalUnit)) + ' ' + (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (dataToPlot[i].value - this.yScale.min) * this.dimensions.verticalUnit) +
                ' L ' + (this.dimensions.borderSpace + this.dimensions.verticalScale + ((i+0.25) * this.dimensions.horizontalUnit)) + ' ' + (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (0 - this.yScale.min) * this.dimensions.verticalUnit) +
                ' L ' + (this.dimensions.borderSpace + this.dimensions.verticalScale + ((i-0.25) * this.dimensions.horizontalUnit)) + ' ' + (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (0 - this.yScale.min) * this.dimensions.verticalUnit)
            //console.log(this.dimensions.borderSpace, this.dimensions.verticalScale, i-0.25, this.dimensions.horizontalUnit, this.dimensions.height, this.dimensions.borderSpace, this.dimensions.horizontalScale, dataToPlot[i].value, this.yScale.min, this.dimensions.verticalUnit)
            }

        }
        return plotLinePath;
    }
}


class CandleChartPath extends ChartPathMultiple {

    get paths() {
        let createdPaths = this.createPaths();
        let upPath = this.drawPath(createdPaths.upPath, this.colours[0], this.colours[0]);
        let downPath = this.drawPath(createdPaths.downPath, this.colours[1], this.colours[1]);
        return([upPath, downPath]);
    }

    createPaths() {
        let dataToPlot = this.dataRange.dateValues;
        let upPath = '';
        let downPath = '';

        let j = 0;
        for (let [i, date] of this.xScale.fullDates.entries()) {
            if (Number(dataToPlot[j].date) < Number(date) && j <= dataToPlot.length - 1) {
                while (Number(dataToPlot[j].date) <= Number(date) && j <= dataToPlot.length - 1) {
                    console.log("skip", j)
                    j+=1;
                }
            }

            if (Number(dataToPlot[j].date) === Number(date)) {

                let open = dataToPlot[j].open;
                let close = dataToPlot[j].close;
                let candleWidth = 0.5;

                let candle =
                ' M ' + (this.dimensions.borderSpace + this.dimensions.verticalScale + ((i-candleWidth/2) * this.dimensions.horizontalUnit)) + ' ' + (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (close - this.yScale.min) * this.dimensions.verticalUnit) +
                ' L ' + (this.dimensions.borderSpace + this.dimensions.verticalScale + ((i+candleWidth/2) * this.dimensions.horizontalUnit)) + ' ' + (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (close - this.yScale.min) * this.dimensions.verticalUnit) +
                ' L ' + (this.dimensions.borderSpace + this.dimensions.verticalScale + ((i+candleWidth/2) * this.dimensions.horizontalUnit)) + ' ' + (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (open - this.yScale.min) * this.dimensions.verticalUnit) +
                ' L ' + (this.dimensions.borderSpace + this.dimensions.verticalScale + ((i-candleWidth/2) * this.dimensions.horizontalUnit)) + ' ' + (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (open - this.yScale.min) * this.dimensions.verticalUnit) +
                ' L ' + (this.dimensions.borderSpace + this.dimensions.verticalScale + ((i-candleWidth/2) * this.dimensions.horizontalUnit)) + ' ' + (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (close - this.yScale.min) * this.dimensions.verticalUnit)

                if (dataToPlot[j].close > dataToPlot[j].open) {
                    upPath += candle;
                } else {
                    downPath += candle;
                }
                j = Math.min(j+1, dataToPlot.length-1);
            }
        }
        return({upPath: upPath, downPath: downPath});
    }

}

class ChartDimensions {
    // Initialisation
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.size = 'large';
        if (this.width / window.innerWidth < 0.3) {
        //if (this.width / window.innerWidth < 0.3 || this.height / window.innerWidth < 0.15) {
            this.size = 'small';
        } else if (this.width / window.innerWidth < 0.2) {
        //} else if (this.width / window.innerWidth < 0.2 || this.height / window.innerWidth < 0.1) {
            this.size = 'tiny';
        }

        switch(this.size) {
            case 'large':
                this.verticalScale = 20;
                this.horizontalScale = 10;
                this.borderSpace = 15;
                this.titleSpace = 0;
                break;
            case 'small':
                this.verticalScale = 15;
                this.horizontalScale = 5;
                this.borderSpace = 10;
                this.titleSpace = 0;
                break;
            case 'tiny':
                this.verticalScale = 0;
                this.horizontalScale = 0;
                this.borderSpace = 2;
                this.titleSpace = 0;
                break;
            default:
                console.log('size not appropriate');
        }
    }

    addVerticalUnit(yScale) {
        this.verticalUnit = (this.height - (this.borderSpace * 2) - this.horizontalScale - this.titleSpace) / (yScale.max - yScale.min);
    }

    addhorizontalUnit(xScale) {
        this.horizontalUnit = (this.width - (this.borderSpace * 2) - this.verticalScale) / xScale.fullDates.length;
    }
}
