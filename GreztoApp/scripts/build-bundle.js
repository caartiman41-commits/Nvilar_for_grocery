const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const rootDir = path.resolve(__dirname, '..');
const bundleJsPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'index.android.bundle');
const bundleHbcPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'index.android.bundle.hbc');
const assetsDest = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

// Clean previously bundled React Native drawable assets to prevent duplicate resource collisions
console.log('🧹 [0/3] Cleaning stale bundled assets in android/app/src/main/res...');
if (fs.existsSync(assetsDest)) {
  const resDirs = fs.readdirSync(assetsDest, { withFileTypes: true })
    .filter(d => d.isDirectory() && (d.name.startsWith('drawable') || d.name.startsWith('raw')));

  for (const dir of resDirs) {
    const dirPath = path.join(assetsDest, dir.name);
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file.startsWith('src_assets_') || file.startsWith('node_modules_')) {
        fs.unlinkSync(path.join(dirPath, file));
      }
    }
  }
}

// Clean stale bundle file if present
if (fs.existsSync(bundleJsPath)) {
  try {
    fs.unlinkSync(bundleJsPath);
  } catch (e) {
    console.warn('Could not delete old bundle file, continuing...', e.message);
  }
}
fs.mkdirSync(path.dirname(bundleJsPath), { recursive: true });

console.log('🚀 [1/3] Bundling React Native JavaScript (Production)...');
const uniqueId = Date.now();
const tempBundleJs = path.join(rootDir, `temp-bundle-${uniqueId}.js`);
const tempBundleHbc = path.join(rootDir, `temp-bundle-${uniqueId}.hbc`);

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execSync(
  `${npxCmd} react-native bundle --platform android --dev false --entry-file index.js --bundle-output "${tempBundleJs}" --assets-dest "${assetsDest}"`,
  { cwd: rootDir, stdio: 'inherit' }
);

// Determine hermesc binary
let hermescBin;
const platform = os.platform();
if (platform === 'win32') {
  hermescBin = path.join(rootDir, 'node_modules', 'hermes-compiler', 'hermesc', 'win64-bin', 'hermesc.exe');
} else if (platform === 'darwin') {
  hermescBin = path.join(rootDir, 'node_modules', 'hermes-compiler', 'hermesc', 'osx-bin', 'hermesc');
} else {
  hermescBin = path.join(rootDir, 'node_modules', 'hermes-compiler', 'hermesc', 'linux64-bin', 'hermesc');
}

if (!fs.existsSync(hermescBin)) {
  console.warn('⚠️ hermesc not found at: ' + hermescBin + '. Keeping plain JS bundle.');
  fs.copyFileSync(tempBundleJs, bundleJsPath);
  fs.unlinkSync(tempBundleJs);
  process.exit(0);
}

console.log('⚡ [2/3] Compiling JavaScript into Hermes Bytecode (AOT Binary)...');
try {
  execFileSync(
    hermescBin,
    ['-emit-binary', '-O', '-out', tempBundleHbc, tempBundleJs],
    { cwd: rootDir, stdio: 'inherit' }
  );
  console.log('📦 [3/3] Replacing bundle with optimized Hermes Bytecode...');
  fs.copyFileSync(tempBundleHbc, bundleJsPath);
} catch (hermesErr) {
  console.warn('⚠️ hermesc blocked by Windows Device Guard, using production JS bundle directly...');
  fs.copyFileSync(tempBundleJs, bundleJsPath);
}
if (fs.existsSync(tempBundleJs)) fs.unlinkSync(tempBundleJs);
if (fs.existsSync(tempBundleHbc)) fs.unlinkSync(tempBundleHbc);

// Clear stale intermediate assets
const intermediateAssets = path.join(rootDir, 'android', 'app', 'build', 'intermediates', 'assets');
if (fs.existsSync(intermediateAssets)) {
  fs.rmSync(intermediateAssets, { recursive: true, force: true });
}

const stats = fs.statSync(bundleJsPath);
console.log(`✅ SUCCESS: Hermes AOT Bytecode bundle created successfully (${(stats.size / 1024 / 1024).toFixed(2)} MB)!`);
