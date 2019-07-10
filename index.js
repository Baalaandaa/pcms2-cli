var inquirer = require('inquirer');
var chalk = require('chalk');
var figlet = require('figlet');
const log4js = require('log4js');
const fs = require('fs');
const Spinner = require('./spinner.js');
const pcms = require('./pcms.js');

const optionDefinitions = [
    { name: 'debug', alias: 'd', type: String}
]

const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions);

const defaults = [
    {name: "debug", value: "error"}
]

defaults.forEach((element) => {
    if(!options[element.name])
        options[element.name] = element.value;
})

const level = options.debug;

log4js.configure({
    appenders: { 
        cli: { type: 'file', filename: 'cli.log' },
        out: { type: 'stdout' }
    },
    categories: { 
        default: { appenders: ['cli'], level: level },
    }
});
const CLIlogger = log4js.getLogger('cli');
const Browserlogger = log4js.getLogger('browser');


CLIlogger.info("CLI args are: " + JSON.stringify(options, 4));
CLIlogger.info("Initializing");
console.log(chalk.blue.bold(figlet.textSync("PCMS2 CLI")));

CLIlogger.info("Reading hosts from file");

var hosts = JSON.parse(fs.readFileSync("hosts.json"));
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

inquirer.prompt(questions).then(async (answers) => {
    answers = answers.host;
    var url = "";
    hosts.forEach(e => {
        if(e.title == answers) url = e.url;
    });
    sp.start();
    // CLIlogger.info("URL is: " + url);
    var client = new pcms(url, Browserlogger);
    await client.init();
    sp.stop();
    var data = await inquirer.prompt(loginq);
    console.log(data);
    await client.login(data.name, data.password);
    client.stop();
});
