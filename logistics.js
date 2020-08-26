let logistics = {

    currentSection: '',

    headerLinks: '',
    titleNode: '',

    // Object for switching between sections
    siteSections: {
        wallets: {node: '', object: false},
        charts: {node: '', object: false},
        imports: {node: '', object: imports},
        stacks: {node: '', object: stacks},
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
        this.switchSection('imports');

        // Set up each section
        this.sectionsSetup();

        // Open and set up database
        await this.databaseSetup();

        // Run starting tasks
        this.runTasks();

    },

    // Open database
    databaseSetup: async function() {
        //await database.openAndUpdateDb('Analysis');
        // Delete old 'HiveJourney' database
        await database.deleteDb('HiveJourney', false);

        // Create new 'HeyStack' database
        let openDBStatus = await database.openDb('HeyStack', database.latestVersion);
        console.log(openDBStatus);
        console.log(database.oldVersion)
        console.log(database.heystackDB)
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

          // Prepare STACKS page
          stacksFigures.update();




    },

    // Nodes for orienting around site
    getLogisticsNodes: function() {
        this.headerLinks = document.getElementById('headerLinks');
        this.titleNode = document.getElementById('title');
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
                console.log(siteSection, e.target.dataset.section)
                if (siteSection === e.target.dataset.section) {
                    logistics.switchSection(siteSection);
                }
            }
        });
    },

    // Hide / reveal different "pages"
    switchSection: function(sectionName) {
        console.log(sectionName)
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
        this.titleNode.addEventListener("click", function(e) {
            if (logistics.currentSection === 'stacks') {
                console.log('title clicked')
            }
        });
    },

}
