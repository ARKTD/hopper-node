require('dotenv').config({ quiet: true });
const Logger = require("./src/Logger.js");
const { downloadXrayCore } = require("./src/XRayInstaller.js");

Logger.info("Starting hopper-node...");


async function bootstrap() {
    // First course of action is to download XRay-core.
    // If it errors out, we are good, just restart the application.
    // We cannot continue without the core.
    const xray_info = await downloadXrayCore();
}


bootstrap().catch(e => {
    Logger.error("Caught an error while starting hopper-node.", e);
});