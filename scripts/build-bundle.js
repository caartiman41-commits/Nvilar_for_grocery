const { execSync } = require('child_process');
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

console.log('🚀 [1/3] Bundling React Native JavaScript (Production)...');
execSync(
  `npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output "${bundleJsPath}" --assets-dest "${assetsDest}"`,
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
  process.exit(0);
}

console.log('⚡ [2/3] Compiling JavaScript into Hermes Bytecode (AOT Binary)...');
execSync(
  `"${hermescBin}" -emit-binary -O -out "${bundleHbcPath}" "${bundleJsPath}"`,
  { cwd: rootDir, stdio: 'inherit' }
);

console.log('📦 [3/3] Replacing bundle with optimized Hermes Bytecode...');
// Windows file handles: unlink before copy
for (let attempt = 0; attempt < 5; attempt++) {
  try {
    if (fs.existsSync(bundleJsPath)) {
      fs.unlinkSync(bundleJsPath);
    }
    fs.copyFileSync(bundleHbcPath, bundleJsPath);
    fs.unlinkSync(bundleHbcPath);
    break;
  } catch (err) {
    if (attempt === 4) throw err;
    const end = Date.now() + 500;
    while (Date.now() < end) {}
  }
}

// Clear stale intermediate assets
const intermediateAssets = path.join(rootDir, 'android', 'app', 'build', 'intermediates', 'assets');
if (fs.existsSync(intermediateAssets)) {
  fs.rmSync(intermediateAssets, { recursive: true, force: true });
}

const stats = fs.statSync(bundleJsPath);
console.log(`✅ SUCCESS: Hermes AOT Bytecode bundle created successfully (${(stats.size / 1024 / 1024).toFixed(2)} MB)!`);
