var inquirer = require('inquirer');
var chalk = require('chalk');
var figlet = require('figlet');
const fs = require('fs');
const Spinner = require('./spinner.js');
const pcms = require('./pcms.js');


var infoScreen = async (CLIlogger, Browserlogger, headless) => {
    CLIlogger.info("Initializing");
    CLIlogger.info("Reading hosts from file");
    CLIlogger.info("Reading settings from file");
    var hosts = JSON.parse(fs.readFileSync(require('os').homedir() + "/.pcms/hosts.json"));
    var settings = JSON.parse(fs.readFileSync(require('os').homedir() + "/.pcms/.settings.json"));
    if(!settings.login) {
        console.log("Run `pcms init` at first");
        return ;
    }
    console.log(chalk.bold.italic.blue(`Входим под аккаунтом ${settings.login} на ${settings.host}`));
    var sp = new Spinner(200, " Входим в аккаунт");
    var logined = false;
    sp.start();
    var client = new pcms(settings.hostUrl, Browserlogger, headless);
    await client.init();
    logined = await client.login(settings.login, settings.password);
    
    if(!logined){
        console.log("Run `pcms init` at first");
        return ;
    }
    sp.stop();
    sp = new Spinner(200, " Входим в аккаунт");
    sp.start();
    await client.contests();
    if(settings.contest){
        if(!await client.selectContest(settings.contest)){
            console.log("Run `pcms contest` at first");
            return;    
        }
    } else {
        console.log("Run `pcms contest` at first");
        return ;
    }
    sp.stop();
    var contestInfo = await client.contestInfo(settings.contest);
    console.clear();
    console.log(chalk.blue(`Вы вошли под ${settings.login} в ${settings.host}\nВыбран контест: `) + chalk.red(settings.contest) + chalk.bold.gray(`\nСостояние контеста:`) + chalk.bold.green(contestInfo));
    console.log(await client.table());
    setInterval(async () => {
        var contestInfo = await client.contestInfo(settings.contest);
        var table = await client.table()
        console.clear();
        console.log(chalk.blue(`Вы вошли под ${settings.login} в ${settings.host}\nВыбран контест: `) + chalk.red(settings.contest) + chalk.bold.gray(`\nСостояние контеста:`) + chalk.bold.green(contestInfo));
        console.log(table);
    }, 1000 * 30);
}

module.exports = infoScreen;