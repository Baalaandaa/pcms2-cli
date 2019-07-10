const chalk = require('chalk');
class Spinner{

    constructor(speed, text){
        this.spinnerCount = 0;
        this.speed = speed;
        this.text = text;
        this.spinner = "▁▂▃▄▅▆▇█▇▆▅▄▃▁";
        this.spinnerTimeout = null;
    }

    start() {
        this.spinnerTimeout = setInterval(() => {
            this.spinnerCount++;
            if(this.spinnerCount > 1){
                process.stdout.clearLine();
                process.stdout.cursorTo(0); 
            }
            process.stdout.write(chalk.bold.green(this.spinner[  (this.spinnerCount+1)% this.spinner.length ]) + this.text);
        }, this.speed);
    }

    pause() {
        clearInterval(this.spinnerTimeout);
    }

    stop() {
        clearInterval(this.spinnerTimeout);
        process.stdout.clearLine();
        process.stdout.cursorTo(0); 
    }

}

module.exports = Spinner;
