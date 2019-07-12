var inquirer = require('inquirer');
var chalk = require('chalk');
var figlet = require('figlet');
const log4js = require('log4js');
const fs = require('fs');
const Spinner = require('./spinner.js');
const pcms = require('./pcms.js');

const initScreen = require('./init.js');

const optionDefinitions = [
    { name: 'debug', alias: 'd', type: String},
    { name: 'headless', alias: 'h', type: Boolean},
    { name: 'screen', alias: 's', type: String, defaultOption: true}
]

const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions);

const defaults = [
    {name: "debug", value: "info"},
    {name: "screen", value: "init"},
    {name: "headless", value: false}
]

defaults.forEach((element) => {
    if(!options[element.name])
        options[element.name] = element.value;
})

options.headless = !options.headless;
const level = options.debug;

log4js.configure({
    appenders: { 
        cli: { type: 'file', filename: require('os').homedir() + "/.pcms/cli.log" },
        out: { type: 'stdout' }
    },
    categories: { 
        default: { appenders: ['cli'], level: level },
    }
});
const CLIlogger = log4js.getLogger('cli');
const Browserlogger = log4js.getLogger('browser');
CLIlogger.info("CLI args are: " + JSON.stringify(options, 4));

if(options.screen == "init"){
    initScreen(CLIlogger, Browserlogger, options.headless).then(() => CLIlogger.info("Initialized"));
}