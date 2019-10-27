const puppeteer = require('puppeteer');
const fs = require('fs');
var Table = require('cli-table');
const chalk = require('chalk');


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
        await this.page.click('a[title="Contests"], a[title="Соревнования"]');
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
                link = "pcms2client/party/contests.xhtml";
            }
            contests.push({link: this.url + '/' + link, title: e.text});
        })
        this.contests = contests;
        return contests;
    }

    async selectContest(name) {
        var lnk = "";
        this.contests.forEach(e => {
            if(e.title == name){
                lnk = e.link;
            }
        });
        if(lnk == "") return false;
        await this.page.goto(lnk);
        await this.page.goto("https://neerc.ifmo.ru/pcms2client/party/information.xhtml");
        var settings = JSON.parse(fs.readFileSync(require('os').homedir() + "/.pcms/.settings.json"));
        settings.contest = name;
        await fs.writeFile(require('os').homedir() + "/.pcms/.settings.json", JSON.stringify(settings, 4), (error) => {if(error) console.error(error)});
        return true;
    }

    async contestInfo(name){
        await this.selectContest(name);
        var res = await this.page.evaluate(`document.querySelector("#running-clock").innerHTML`);
        return res;
    }

    async table(){
        await this.page.goto("https://neerc.ifmo.ru/pcms2client/party/monitor.xhtml");
        var taskSize = await this.page.evaluate(`document.querySelector("table.standings>thead>tr").childNodes.length`) - 4;
        var contestantsLength = await this.page.evaluate(`document.querySelector("table.standings>tbody").childNodes.length`);
        var header = [
            "#",
            "Название"
        ];
        for(var i = 0; i < taskSize; i++){
            header.push(String.fromCharCode('A'.charCodeAt(0) + i));
        }
        header.push('=');
        header.push("Штраф");
        var table = new Table({
            head: header
        });
        for(var id = 0; id < contestantsLength; id++){
            var rank = await this.page.evaluate(`document.querySelector("table.standings>tbody").childNodes[${id}].childNodes[0].innerHTML`);
            var name = await this.page.evaluate(`document.querySelector("table.standings>tbody").childNodes[${id}].childNodes[1].innerHTML`);
            var me = (await this.page.evaluate(`document.querySelector("table.standings>tbody").childNodes[${id}].className`)) == "current";
            var row = [];
            if(me){
                row = [chalk.bold.green(rank), chalk.bold.green(name)];
            } else if(id % 2){
                row = [chalk.gray(rank), chalk.gray(name)];
            } else row = [chalk.blue(rank), chalk.blue(name)];
            for(var i = 0; i < taskSize + 2; i++){
                var status = await this.page.evaluate(`document.querySelector("table.standings>tbody").childNodes[${id}].childNodes[${i + 2}].innerHTML`);
                var classname = await this.page.evaluate(`document.querySelector("table.standings>tbody").childNodes[${id}].childNodes[${i + 2}].className`);
                if(classname.indexOf('first') != -1) status = chalk.bold.green(status);
                if(classname.indexOf('ok') == -1) status = chalk.bold.red(status);
                if(status.indexOf('<') != -1){
                    status = status.substr(0, status.indexOf('<'));
                }
                row.push(status);
            }
            table.push(row);
        }
        return table.toString();
    }

}

module.exports = PCMS;