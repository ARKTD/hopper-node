const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const Logger = require("./Logger.js");

class ConfigManager {
    /**
     * @type {string?}
     */
    XRayPath = null;
    /**
     * @type {Object?}
     */
    config = null;
    /**
     * @type {import('node:child_process').ChildProcess?}
     */
    xrayProcess = null;

    /**
     * @typedef {Object} XRayInfo
     * @property {string} binaryPath
     * @property {*} version
     * 
     * @param {XRayInfo} info 
     */
    setInstance(info){
        this.XRayPath = info.binaryPath;
    }

    /**
     * Build the definitive JSON for XRay startup.
     * Clients are expected to be embedded directly within the individual inbound settings.
     * @param {Array<Object>} inbounds 
     */
    buildConfig(inbounds){
        let config = {
            log: {
                loglevel: "warning"
            },
            inbounds: inbounds || [],
            outbounds: [
                {
                    protocol: "freedom"
                }
            ]
        };

        return config;
    }

    /**
     * @param {Object} config 
     */
    updateConfig(config){
        if(JSON.stringify(this.config) === JSON.stringify(config)){
            if(this.xrayProcess){
                // Config is already up-to-date and the core is running.
                return false;
            }
        }

        this.config = config;
        try{
            this.restartXRayCore();
        }
        catch(e){
            Logger.error("Failed to restart XRay core with the config.", e);
            return false;
        }
        return true;
    }

    startXRayCore(){
        if(this.xrayProcess){
            Logger.warn("XRay core is already running");
            return;
        }

        if(!this.XRayPath || !this.config){
            throw new Error("Cannot start XRay: path or config is missing.");
        }

        const configPath = path.join(__dirname, '..', 'xray', 'config.json');
        fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));

        this.xrayProcess = spawn(this.XRayPath, ['run', '-c', configPath], {
            stdio: ['ignore', 'pipe', 'pipe'] 
        });

        this.xrayProcess.stdout?.on('data', (data) => {
            if(data.toString().includes("accepted")) return;
            Logger.debug(`[XRay] ${data.toString().trim()}`);
        });
        this.xrayProcess.stderr?.on('data', (data) => {
            Logger.error(`[XRay] ${data.toString().trim()}`);
        });

        this.xrayProcess.on('close', (code) => {
            Logger.info(`XRay core exited with code ${code}`);
            this.xrayProcess = null;
        });

        this.xrayProcess.on('error', (err) => {
            Logger.error(`Failed to start XRay core:`, err);
        });
    }

    stopXRayCore(){
        if(!this.xrayProcess){
            return;
        }
        Logger.info("Stopping XRay core...");
        this.xrayProcess.kill('SIGTERM');
        this.xrayProcess = null;
    }

    restartXRayCore(){
        this.stopXRayCore();
        setTimeout(() => this.startXRayCore(), 500);
    }
}

module.exports = new ConfigManager();
