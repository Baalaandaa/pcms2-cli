const puppeteer = require('puppeteer');

class PCMS{

    constructor(url, logger) {
        this.url = url;
        this.logger = logger;
    }

    async init() {
        this.logger.info("puppeteer run");
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
        this.logger.info("Go to page");
        await this.page.goto(this.url);
        await this.page.goto(this.url);
    }

    async stop() {
        await this.browser.close();
    }

    async login(username, password) {
        if(!this.page){
            this.logger.error("Browser is not started yet. Call init() first");
        }
        var curUrl = this.page.url().toString();
        if(!curUrl.includes("login.xhtml")){
            this.logger.error("Wrong URI. Check");
        }
        await this.page.evaluate(`document.getElementById("login:name").value= '${username}'`);
        await this.page.evaluate(`document.getElementById("login:password").value='${password}'`);
        await this.page.click('.action');
        await this.page.screenshot({path: 'debug0.png'});
    }

}

module.exports = PCMS;