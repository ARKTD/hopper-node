require('dotenv').config({ quiet: true });
const Logger = require("./src/Logger.js");
const { downloadXrayCore } = require("./src/XRayInstaller.js");
const ConfigManager = require("./src/ConfigManager.js");
const ApiServer = require("./src/ApiServer.js");

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
    if (!ConfigManager.xrayProcess) {
        ConfigManager.startXRayCore();
    }

    // [ Step 3: Start the API server ]
    // Start listening for master node configurations
    await ApiServer.start(process.env.API_PORT || 8080);
}

bootstrap().catch(e => {
    Logger.error("Caught an error while starting hopper-node.", e);
    process.exit(1);
});
