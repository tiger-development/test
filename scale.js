class YScale {
    // Initialisation
    constructor(data, keys, minOverride, maxOverride) {
        //this.min;
        //this.max;
        //this.verticalScaleArray;
        this.calculateAxisMinMax(data, keys, minOverride, maxOverride);
        this.calculateIntervals();
    }

    get verticalSpan() {
        return this.max - this.min;
    }

    calculateAxisMinMax(data, keys, minOverride, maxOverride) {
        console.log(data, keys, minOverride, maxOverride)
        // Generate vertical axis range and set the scale
        let minAll = Infinity;
        if (minOverride !== false) {
            minAll = minOverride;
        }
        let maxAll = -Infinity;
        if (maxOverride !== false) {
            maxAll = maxOverride;
        }

        for (let label in data) {
            for (let key of keys) {
                let dateValues = data[label].dateValues.filter(x => x[key] !== '');
                try {
                    let minRange = Math.min(...dateValues.map(x => x[key]));
                    let maxRange = Math.max(...dateValues.map(x => x[key]));
                    minAll = Math.min(minAll, minRange)
                    maxAll = Math.max(maxAll, maxRange)
                    console.log(label, minAll, maxAll)
                } catch(e) {
                    console.log(e)
                }
            }
        }
        this.min = minAll;
        this.max = maxAll;
    }

    // Generate axis values and labels
    calculateIntervals() {
        // Calculate number of graduation line intervals
        // - scale to have at least 4
        let verticalInterval = Math.pow(10, Math.floor(Math.log10(this.verticalSpan)));
        if (this.verticalSpan / verticalInterval < 2) {
              verticalInterval /= 5;
        } else if (this.verticalSpan / verticalInterval < 5) {
              verticalInterval /= 2;
        };

        // Calculate the vertical scale interval numbers
        this.verticalScaleArray = [];
        let magnitudeSize = this.magnitude(this.max);
        let nextInterval = Math.ceil(this.min / verticalInterval) * verticalInterval;
        let whileCheck=0;
        while (nextInterval < this.max && whileCheck < 20) {
            this.verticalScaleArray.push({value: nextInterval, label: this.magnitudeDisplay(nextInterval, magnitudeSize)});
            nextInterval += verticalInterval;
            whileCheck+=1;
        }
    }

    magnitude(value) {
        return Math.floor(Math.log10(value));
    }

    magnitudeDisplay(value, magnitude) {
        if (Math.abs(magnitude) >= 6) {
            return (value / Math.pow(10, 6)).toFixed(2) + 'm';
        } else if (Math.abs(magnitude) >= 3) {
            return (value / Math.pow(10, 3)).toFixed(2) + 'k';
        } else {
            return value.toFixed(2);
        }
    }
}

class XScale {
    // Initialisation
    constructor(data, timePeriod) {
        //this.min;
        //this.max;
        //this.count;
        //this.horizontalScaleArray;
        this.timePeriod = new TimePeriod(timePeriod);
        this.calculateAxisMinMax(data);
        this.fullDates = this.generateFullDates();
        this.calculateIntervals();
    }

    calculateAxisMinMax(data) {
        // Generate vertical axis range and set the scale
        let minAll = Infinity;
        let maxAll = -Infinity;
        let maxCount = 0;
        for (let label in data) {
            let chartDataRange = data[label];
            try {
                let minRange = Math.min(...chartDataRange.dateValues.map(x => Number(x.date)));
                let maxRange = Math.max(...chartDataRange.dateValues.map(x => Number(x.date)));
                minAll = Math.min(minAll, minRange);
                maxAll = Math.max(maxAll, maxRange);
                maxCount = Math.max(maxCount, chartDataRange.dateValues.length);
            } catch(e) {
                console.log(e)
            }
        }
        this.min = new Date(minAll);
        this.max = new Date(maxAll);
        this.count = maxCount;
    }

    generateFullDates() {
        let currentDate = new DateHelper(this.min);
        let fullDates = [];
        while (currentDate.time <= Number(this.max)) {
            fullDates.push(currentDate.date);
            currentDate = new DateHelper(currentDate.addXMinutesToDate(this.timePeriod.minutes));
        }
        return fullDates;
    }

    // Generate axis values and labels
    calculateIntervals() {
        let horizontalIntervalEstimateYears = (this.max - this.min) / (365*24*60*60*1000);
        let horizontalIntervalEstimateMonths = horizontalIntervalEstimateYears * 12;
        let horizontalIntervalEstimateDays = horizontalIntervalEstimateYears * 365;

        let monthGap = 0;
        let dayGap = 0;
        let hourGap = 0;
        if (horizontalIntervalEstimateYears >= 4) {
            // Use years
            monthGap = 12;
        } else if (horizontalIntervalEstimateYears >= 2) {
            // Use 6 monthly (Jan 2019, July 2019)
            monthGap = 6;
        } else if (horizontalIntervalEstimateYears >= 1) {
            // Use 3 monthly (Jan 2019, Apr 2019)
            monthGap = 3;
        } else if (horizontalIntervalEstimateMonths > 3) {
            // Use monthly
            monthGap = 1;
        } else if (horizontalIntervalEstimateDays > 10) {
            dayGap = 3;
        } else if (horizontalIntervalEstimateDays > 2) {
            dayGap = 1;
        } else {
            hourGap = 3;
        }

        let dateOptions = { timeZone: 'UTC', month: 'short' };

        this.horizontalScaleArray = [];
        for (let [index, date] of this.fullDates.entries()) {
            if (monthGap > 0) {
                if (date.getUTCHours() === 0 && date.getUTCDate() === 1 && date.getUTCMonth() % monthGap === 0) {
                    let month = date.toLocaleString('default', dateOptions);
                    this.horizontalScaleArray.push({index: index, offset: 1.25, label: month + ' ' + String(date.getUTCFullYear()).slice(-2)});
                }
            } else if (dayGap > 0) {
                if (date.getUTCHours()===0 && date.getUTCMinutes()===0 && date.getUTCSeconds()===0 && date.getUTCDate() % dayGap === 0) {
                    this.horizontalScaleArray.push({index: index, offset: 1.25, label: date.getUTCDate() + '/' + (Number(date.getUTCMonth())+1)});
                }
            } else {
                if (date.getUTCMinutes()===0 && date.getUTCSeconds()===0 && date.getUTCHours() % hourGap === 0) {
                    this.horizontalScaleArray.push({index: index, offset: 1.25, label: date.getUTCHours() + ':00'});
                }
            }
        }
    }
}

class XScaleView {
    // Initialisation
    constructor(xScale, dimensions) {
        this.dimensions = dimensions;
        this.xScale = xScale;
    }

    get horizontalAxis() {
        let path = this.createHorizontalAxisPath()
        return this.drawPath(path);
    }

    get horizontalAxisGraduationLines() {
        let path = this.createHorizontalAxisGraduationLines()
        return this.drawPath(path);
    }

    get horizontalLabels() {
        return this.createHorizontalLabels();
    }

    // Create x-axis path
    createHorizontalAxisPath() {
        let path =
            'M ' + (this.dimensions.borderSpace + this.dimensions.verticalScale) +
            ' ' + (this.dimensions.height - this.dimensions.borderSpace - this.dimensions.horizontalScale) +
            ' L ' + (this.dimensions.width - this.dimensions.borderSpace) +
            ' ' + (this.dimensions.height - this.dimensions.borderSpace - this.dimensions.horizontalScale);
        return path;
    }

    // Create the x-axis graduation lines
    // - which go vertically!
    createHorizontalAxisGraduationLines() {
        let path = '';
        for (let i=0; i < this.xScale.horizontalScaleArray.length; i+=1) {
            path +=
                //' M ' + (chartDimensions.graphWidth - chartDimensions.borderSpace - (chartDimensions.verticalScale*0)) +
                ' M' + (this.dimensions.borderSpace + this.dimensions.verticalScale + this.xScale.horizontalScaleArray[i].index * this.dimensions.horizontalUnit) +
                ' ' + (this.dimensions.height - this.dimensions.borderSpace - this.dimensions.horizontalScale) +
                ' L ' + (this.dimensions.borderSpace + this.dimensions.verticalScale + this.xScale.horizontalScaleArray[i].index * this.dimensions.horizontalUnit) +
                ' ' + (this.dimensions.borderSpace + this.dimensions.titleSpace);
        }
        return path;
    }

    // Create the x-axis labels
    createHorizontalLabels() {
        let fontSize = 10;
        if (this.dimensions.size === 'small') {
            fontSize = 8;
        }

        let labels = [];
        for (let i=0; i < this.xScale.horizontalScaleArray.length; i+=1) {
            let element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            let text = document.createTextNode(this.xScale.horizontalScaleArray[i].label);
            element.appendChild(text);
            element.setAttribute('font-size', fontSize);
            element.setAttribute('fill', 'rgba(120, 120, 120, 1)');
            element.setAttribute('x', this.dimensions.borderSpace + this.dimensions.verticalScale + this.xScale.horizontalScaleArray[i].index * this.dimensions.horizontalUnit);
            element.setAttribute('y', this.dimensions.height - this.dimensions.borderSpace - this.dimensions.horizontalScale + fontSize * (this.xScale.horizontalScaleArray[i].offset));
            element.setAttribute('text-anchor', 'middle');
            element.setAttribute('alignment-baseline', 'middle');
            element.setAttribute('font-weight', 'normal');
            labels.push(element);
        }
        return labels;
    }

    // Draw SVG plotLine
    drawPath(path) {
        // Draw svg path
        let element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        element.setAttribute('d', path);
        element.setAttribute('stroke','rgba(220, 220, 220, 0.75)');
        element.setAttribute('stroke-linecap', 'round');
        element.style.strokeWidth = '1px';
        return element;
    }

}

class YScaleView {
    // Initialisation
    constructor(yScale, dimensions) {
        this.yScale = yScale;
        this.dimensions = dimensions;
    }

    get verticalAxis() {
        let path = this.createVerticalAxisPath()
        return this.drawPath(path);
    }

    get verticalAxisGraduationLines() {
        let path = this.createVerticalAxisGraduationLines()
        return this.drawPath(path);
    }

    get verticalLabels() {
        return this.createVerticalLabels();
    }

    // Create y-axis path
    createVerticalAxisPath() {
        let path =
            'M ' + (this.dimensions.borderSpace + this.dimensions.verticalScale) +
            ' ' + (this.dimensions.height - this.dimensions.borderSpace - this.dimensions.horizontalScale) +
            ' L ' + (this.dimensions.borderSpace + this.dimensions.verticalScale) +
            ' ' + (this.dimensions.borderSpace + this.dimensions.titleSpace);
        return path;
    }

    // Create the y-axis graduation lines
    // - which go horizontally!
    createVerticalAxisGraduationLines() {
        // Create graduation line paths
        let path = '';
        for (let i=0; i < this.yScale.verticalScaleArray.length; i+=1) {
            path +=
                ' M ' + (this.dimensions.width - this.dimensions.borderSpace - (this.dimensions.verticalScale*0)) +
                ' ' + (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (this.yScale.verticalScaleArray[i].value - this.yScale.min) * this.dimensions.verticalUnit) +
                ' L ' + (this.dimensions.borderSpace + this.dimensions.verticalScale) +
                ' ' + (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (this.yScale.verticalScaleArray[i].value - this.yScale.min) * this.dimensions.verticalUnit);
        }
        return path;
    }

    // Create the y-axis labels
    createVerticalLabels() {
        let fontSize = 10;
        if (this.dimensions.size === 'small') {
            fontSize = 8;
        }
        let labels = [];
        for (let i=0; i < this.yScale.verticalScaleArray.length; i+=1) {
            let element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            let text = document.createTextNode(this.yScale.verticalScaleArray[i].label);
            element.appendChild(text);
            element.setAttribute('font-size', fontSize);
            element.setAttribute('fill', 'rgba(120, 120, 120, 1)');
            element.setAttribute('x', this.dimensions.borderSpace + this.dimensions.verticalScale * 0.85);
            element.setAttribute('y', (this.dimensions.height - (this.dimensions.borderSpace + this.dimensions.horizontalScale) - (this.yScale.verticalScaleArray[i].value - this.yScale.min) * this.dimensions.verticalUnit));
            element.setAttribute('text-anchor', 'end');
            element.setAttribute('alignment-baseline', 'middle');
            element.setAttribute('font-weight', 'normal');
            labels.push(element);
        }
        return labels;
    }

    // Draw SVG plotLine
    drawPath(path) {
        // Draw svg path
        let element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        element.setAttribute('d', path);
        element.setAttribute('stroke','rgba(220, 220, 220, 0.75)');
        element.setAttribute('stroke-linecap', 'round');
        element.style.strokeWidth = '1px';
        return element;
    }

}
