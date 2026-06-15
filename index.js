require('dotenv').config({ quiet: true });
const Logger = require("./src/Logger.js");
const { downloadXrayCore } = require("./src/XRayInstaller.js");
const ConfigManager = require("./src/ConfigManager.js");

Logger.info("Starting hopper-node...");


async function bootstrap() {
    // [ Step 1: Download XRay core ]
    // First course of action is to download XRay-core.
    const xray_info = await downloadXrayCore();

    // [ Step 2: Prepare configuration ]
    ConfigManager.setInstance(xray_info);
    // ... with an empty configuration by default...
    const startupConfig = ConfigManager.buildConfig([], []);
    // ... and start the core with it.
    ConfigManager.updateConfig(startupConfig);

    // [ Step 3: Start the API server ]
}


bootstrap().catch(e => {
    Logger.error("Caught an error while starting hopper-node.", e);
});