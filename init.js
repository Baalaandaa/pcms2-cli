var inquirer = require('inquirer');
var chalk = require('chalk');
var figlet = require('figlet');
const fs = require('fs');
const Spinner = require('./spinner.js');
const pcms = require('./pcms.js');


var init = async (CLIlogger, Browserlogger, headless) => {
    CLIlogger.info("Initializing");
    console.log(chalk.blue.bold(figlet.textSync("PCMS2 CLI")));
    CLIlogger.info("Reading hosts from file");
    var hosts = JSON.parse(fs.readFileSync(require('os').homedir() + "/.pcms/hosts.json"));
    var titles = [];
    hosts.forEach((e) => {
        titles.push(e.title);
    });
    var questions = [
        {
            type: "list",
            name: "host",
            message: "Выберите хост pcms2",
            choices: titles
        }
    ];
    var loginq = [
        {
            type: "text",
            name: "name",
            message: "Введите ваш логин: "
        },
        {
            type: "password",
            name: "password",
            message: "Введите ваш пароль: "
        }
    ]
    var sp = new Spinner(200, " Загружаем страницу, пожалуйста подождите");
    var logined = false;
    var answers = await inquirer.prompt(questions);
    answers = answers.host;
    var url = "";
    hosts.forEach(e => {
        if(e.title == answers) url = e.url;
    });
    sp.start();
    var client = new pcms(url, Browserlogger, headless);
    await client.init();
    sp.stop();
    var data = {};
    while(!logined){
        data = await inquirer.prompt(loginq);
        logined = await client.login(data.name, data.password);
        if(!logined){
            console.log(chalk.red.bold("Invalid login/password"));
        }
    }
    await fs.writeFile(require('os').homedir() + "/.pcms/.settings.json", JSON.stringify({
        hostUrl: url,
        host: answers,
        login: data.name,
        password: data.password,
        contest: null
    }, 4), (e) => {console.error(e)});

    console.log(chalk.bold.italic.green("You successfully logined. \nAvailable commands: "));
    console.log(chalk.bold.grey("`pcms contest` - Opens menu with contest"));
    await client.stop();
}

module.exports = init;