var inquirer = require('inquirer');
var chalk = require('chalk');
var figlet = require('figlet');
const log4js = require('log4js');
const Spinner = require('./spinner');

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
        default: { appenders: ['cli', 'out'], level: level },
    }
});
const CLIlogger = log4js.getLogger('cli');
const Browserlogger = log4js.getLogger('browser');
CLIlogger.info("CLI args are: " + JSON.stringify(options, 4));
CLIlogger.info("Initializing");
console.log(chalk.blue.bold(figlet.textSync("PCMS2 CLI")));

var questions = [
    {
        type: "list",
        name: "host",
        message: "Выберите хост pcms2",
        choices: ["neerc.ifmo.ru", "pcms.university.innopolis.ru"]
    }
];

var sp = new Spinner(200, " Загружаем страницу, пожалуйста подождите");

inquirer.prompt(questions).then(answers => {
    answers = answers.host;
    CLIlogger.info("User selected: " + JSON.stringify(answers, 4));
    sp.start();
    setTimeout(() => {sp.stop()}, 20000);
});
