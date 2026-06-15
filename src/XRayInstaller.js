const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const Logger = require('./Logger.js');
const { execSync } = require('node:child_process');

const DEST_DIR = path.join(__dirname, '..', 'bin', 'xray');

async function getLatestRelease() {
    const res = await fetch(`https://api.github.com/repos/XTLS/Xray-core/releases/latest`, {
        headers: { 'User-Agent': 'Hopper-Node' }
    });
    
    if (!res.ok) {
        throw new Error(`Failed to fetch XRay release info: ${res.status} ${res.statusText}`);
    }
    
    return await res.json();
}

/**
 * 
 * @param {String} zipPath 
 * @param {String} destDir 
 */
function extractZip(zipPath, destDir) {
    if (os.platform() === 'win32') {
        const psCommand = `Expand-Archive -Force -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}'`;
        execSync(`powershell -command "${psCommand}"`, { stdio: 'inherit' });
    } else {
        execSync(`unzip -o "${zipPath}" -d "${destDir}"`, { stdio: 'inherit' });
    }
}

async function downloadXrayCore() {
    const platform = os.platform() === 'win32' ? 'windows' : 'linux';
    const arch = os.arch() === 'arm64' ? 'arm64-v8a' : '64';

    const assetName = `Xray-${platform}-${arch}.zip`;

    const release = await getLatestRelease();
    const version = release.tag_name; 
    const versionFile = path.join(DEST_DIR, '.version');
    
    if (fs.existsSync(versionFile)) {
        const currentVersion = fs.readFileSync(versionFile, 'utf8').trim();
        if (currentVersion === version) {
            Logger.info(`Xray-core is already up to date (version ${version}).`);
            return { version, binaryPath: path.join(DEST_DIR, platform === 'windows' ? 'xray.exe' : 'xray') };
        }
    }

    Logger.info(`Installing Xray-core ${version}...`);

    const asset = release.assets.find((/** @type {*} */ a) => a.name === assetName);
    if (!asset) {
        throw new Error(`Failed to find XRay version for ${platform}-${arch}`);
    }

    if (!fs.existsSync(DEST_DIR)) {
        fs.mkdirSync(DEST_DIR, { recursive: true });
    }

    const tmpZipPath = path.join(DEST_DIR, assetName);

    const res = await fetch(asset.browser_download_url);
    if (!res.ok) {
        throw new Error(`Download failed: ${res.status} ${res.statusText}`);
    }
    
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(tmpZipPath, buffer);

    extractZip(tmpZipPath, DEST_DIR);
    
    fs.unlinkSync(tmpZipPath);
    fs.writeFileSync(versionFile, version);
    
    Logger.info(`Successfully installed Xray-core ${version}!`);

    return { version, binaryPath: path.join(DEST_DIR, platform === 'windows' ? 'xray.exe' : 'xray') };
}

module.exports = { downloadXrayCore };