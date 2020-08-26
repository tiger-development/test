
let logistics = {

    currentSection: '',

    headerLinks: '',
    pageTitleNode: '',

    // Object for switching between sections
    siteSections: {
        dashboard: {node: '', object: dashboard},
        comparison: {node: '', object: comparison},
        hourly: {node: '', object: hourly},
        taker: {node: '', object: taker},
        stacks: {node: '', object: stacksGraphics},
        faq: {node: '', object: false},

    },

    siteSetup: async function() {
        // Get nodes
        this.getLogisticsNodes();
        this.getSectionNodes();

        // Set listeners
        this.addHeaderLinksListener();
        this.addPageTitleListener();

        // Switch to preferred starting page
        this.switchSection('dashboard');

        // Set up each section
        this.sectionsSetup();

        // Open and set up database
        await this.databaseSetup();

        // Run starting tasks
        this.runTasks();

    },

    // Open database
    databaseSetup: async function() {
        await database.openAndUpdateDb('Analysis');
    },

    // Open database
    sectionsSetup: function() {
        for (let siteSection in logistics.siteSections) {
            let section = logistics.siteSections[siteSection];
            if (section.object !== false) {
                section.object.setup();
            }
        }
    },

    // Open database
    runTasks: async function() {
          ////dashboard.updateCharts('LRC', 'BTC');
          ////database.clearObjectStore('ADABTC1h');

        //let objectStore = data.objectStoreName('1h', 'BAL', 'BTC');
        //database.clearObjectStore(objectStore);

        //await data.fetchAllDataForPairsOf('BTC', '1m', 0, 1000);



        //dashboard.updateCharts('TOMO', 'BTC');
        //await dashboard.minuteAnalysis('BTC', 'USDT', 3, false)
        await dashboard.setCurrentPair('BTC', 'USDT');

        comparison.updateMainChart('USDT');
        hourly.updateMainChart('USDT');

        //await taker.takerStudy('BTC', 'USDT');

        // /*
        await data.fetchAllDataForPairsOf('BTC', '1h', 0, 1000);
        await data.fetchAllDataForPairsOf('BTC', '1m', 0, 1000);
        stacksGraphics.studyToRun();
        // */

        //await data.tidyAllMinuteDataForPairsOf('BTC', '1m');







    },

    // Nodes for orienting around site
    getLogisticsNodes: function() {
        this.headerLinks = document.getElementById('headerLinks');
        this.pageTitleNode = document.getElementById('pageTitle');
    },

    // Nodes for each section - id in html must match section object
    getSectionNodes: function() {
        for (let section in logistics.siteSections) {
            this.siteSections[section].node = document.getElementById(section);
        }
    },

    // Add listener for header links to allow section switch
    addHeaderLinksListener: function() {
        // Event listener for header links
        this.headerLinks.addEventListener("click", function(e) {
            for (let siteSection in logistics.siteSections) {
                if (siteSection === e.target.dataset.section) {
                    logistics.switchSection(siteSection);
                }
            }
        });
    },

    // Hide / reveal different "pages"
    switchSection: function(sectionName) {
        for (let siteSection in logistics.siteSections) {
            let section = logistics.siteSections[siteSection];
            if (siteSection == sectionName) {
                section.node.style.display = "block";
                logistics.currentSection = siteSection;
            } else {
                section.node.style.display = "none";
            }
        }
    },

    // Listener for title
    addPageTitleListener: function() {
        this.pageTitleNode.addEventListener("click", function(e) {
            if (logistics.currentSection === 'dashboard') {
                dashboard.updateCharts('ETH', 'BTC');
            }
        });
    },

}
