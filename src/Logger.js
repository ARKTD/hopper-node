const chalk = require('chalk');

class Logger {
    /**
     * @param {String} message 
     * @param {*} extra 
     */
    debug(message, extra = null){
        console.log(chalk.inverse(` DEBUG `), message);
        if(extra){
            console.log(extra);
        }
    }

    /**
     * @param {String} message 
     * @param {*} extra 
     */
    info(message, extra = null){
        console.log(chalk.bgBlueBright(` INFO `), chalk.blueBright(message));
        if(extra){
            console.log(extra);
        }
    }

    /**
     * @param {String} message 
     * @param {*} extra 
     */
    warn(message, extra = null){
        console.log(chalk.bgYellowBright(` WARN `), chalk.yellowBright(message));
        if(extra){
            console.log(extra);
        }
    }

    /**
     * @param {String} message 
     * @param {*} extra 
     */
    error(message, extra = null){
        console.log(chalk.bgRedBright(` ERROR `), chalk.redBright(message));
        if(extra){
            console.log(extra);
        }
    }
}

module.exports = new Logger();