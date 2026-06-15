const express = require('express');
const Logger = require('./Logger.js');
const ConfigManager = require('./ConfigManager.js');

class ApiServer {
    constructor() {
        this.app = express();
        
        this.authToken = process.env.NODE_TOKEN;
        if (!this.authToken) {
            throw new Error("NODE_TOKEN is not set");
        }

        this.app.use(express.json());

        this.app.use((req, res, next) => {
            const token = req.headers['authorization'];
            
            const providedToken = token?.startsWith('Bearer ') ? token.slice(7) : token;
            
            if (providedToken !== this.authToken) {
                return res.status(200).send();
            }
            
            next();
        });

        // Routes
        this.app.post('/api/config', (req, res) => {
            try {
                const { inbounds, clients } = req.body;
                
                if (!Array.isArray(inbounds) || !Array.isArray(clients)) {
                    return res.status(400).send();
                }
                
                const newConfig = ConfigManager.buildConfig(inbounds, clients);
                const changed = ConfigManager.updateConfig(newConfig);

                if(changed){
                    Logger.info(`Updated config: ${inbounds.length} inbounds, ${clients.length} clients.`);
                }

                res.status(200).json({ success: true, updated: changed });
            } catch (err) {
                Logger.error("Failed to process config push:", err);
                res.status(500).send();
            }
        });
        
        // Catch-all to respond silently
        this.app.use((req, res) => {
            res.status(200).send();
        });
    }

    start(port = process.env.API_PORT || 8080) {
        return new Promise((resolve) => {
            this.server = this.app.listen(port, () => {
                Logger.info(`Started Management API on port ${port}`);
                resolve(true);
            });
        });
    }

    stop() {
        if (this.server) {
            this.server.close();
            Logger.info("Stopped Management API");
        }
    }
}

module.exports = new ApiServer();
