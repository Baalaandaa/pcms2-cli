var inquirer = require('inquirer');
var chalk = require('chalk');
var figlet = require('figlet');
const fs = require('fs');
const Spinner = require('./spinner.js');
const pcms = require('./pcms.js');


var contests = async (CLIlogger, Browserlogger, headless) => {
    CLIlogger.info("Initializing");
    CLIlogger.info("Reading hosts from file");
    CLIlogger.info("Reading settings from file");
    var hosts = JSON.parse(fs.readFileSync(require('os').homedir() + "/.pcms/hosts.json"));
    var settings = JSON.parse(fs.readFileSync(require('os').homedir() + "/.pcms/.settings.json"));
    console.l
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
    var contests = await client.contests();
    var titles = [];
    contests.forEach(e => {
        titles.push(e.title);
    })
    var questions = [
        {
            type: "list",
            name: "contest",
            message: "Выберите контест",
            choices: titles
        }
    ];
    var ans = (await inquirer.prompt(questions)).contest;
    var res = await client.selectContest(ans);
    CLIlogger.info(res);
    if(!res){
        console.log(chalk.bold.italic.red("Что-то пошло не так. Попробуйте еще раз"));
    } else console.log(chalk.bold.italic.green("Контест выбран успешно"));
    await client.stop();
}

module.exports = contests;