const puppeteer = require('puppeteer');

class PCMS{

    constructor(url, logger, headless = true) {
        this.headless = headless;
        this.url = url;
        this.logger = logger;
    }

    async init() {
        this.logger.info("puppeteer run");
        this.browser = await puppeteer.launch({headless: this.headless});
        this.page = await this.browser.newPage();
        this.logger.info("Go to page");
        await this.page.goto(this.url + "/pcms2client/login.xhtml");
        await this.page.goto(this.url + "/pcms2client/login.xhtml");
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
        curUrl = this.page.url().toString();
        return !curUrl.includes("login.xhtml");
    }

    async contests() {
        if(!this.page){
            this.logger.error("Browser is not started yet. Call init() first");
        }
        var curUrl = this.page.url().toString();
        await this.page.click("a[title=Contests]");
        curUrl = this.page.url().toString();
        if(!curUrl.includes("party/contests.xhtml")){
            console.error("Something happened. :/");
            return ;
        }
        await this.page.waitFor('p');
        var raw = await this.page.evaluate(() => {
            var contest = document.querySelectorAll("p");
            var result = [];
            contest.forEach((e) => {
                result.push({text: e.innerText, html: e.innerHTML});
            });
            return result;
        });
        var contests = [];
        raw.forEach(e => {
            var link = "";
            if(e.html.includes("href")){
                var index = e.html.indexOf("href=");
                var end = e.html.indexOf("\"", index + 8);
                link = e.html.substr(index + 7, end - index - 7);
            } else{
                link = this.url + "/pcms2client/party/contests.xhtml";
            }
            contests.push({link: this.url + link, title: e.text});
        })
        this.contests = contests;
        return contests;
    }

    async selectContest(name) {
        var lnk = "";
        this.contests.forEach(e => {
            if(e.title == name){
                if(link.length){
                    lnk = this.page.goto(e.link);
                    break;
                }
            }
        });
        if(lnk == "") return false;
        await this.page.goto(lnk);
        return true;
    }

}

module.exports = PCMS;