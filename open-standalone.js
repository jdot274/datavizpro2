const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Get the current directory
const currentDir = process.cwd();
const htmlFilePath = path.join(currentDir, 'standalone-browser.html');

// Ensure the file exists
if (!fs.existsSync(htmlFilePath)) {
  console.error('Error: standalone-browser.html does not exist in the current directory.');
  process.exit(1);
}

// Convert file path to URL format
const fileUrl = `file://${htmlFilePath}`;

// Determine the platform-specific command to open Chrome with WebGL flags
function getChromeCommand() {
  const chromeFlags = [
    '--disable-web-security',
    '--allow-file-access-from-files',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--enable-gpu-rasterization',
    '--enable-zero-copy',
    '--disable-gpu-sandbox',
    '--enable-hardware-overlays',
    '--enable-webgl-draft-extensions'
  ].join(' ');

  switch (os.platform()) {
    case 'darwin': // macOS
      return `open -a "Google Chrome" ${chromeFlags} "${fileUrl}"`;
    case 'win32': // Windows
      const windowsChromePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
      ];
      
      for (const chromePath of windowsChromePaths) {
        if (fs.existsSync(chromePath)) {
          return `"${chromePath}" ${chromeFlags} "${fileUrl}"`;
        }
      }
      return `start chrome ${chromeFlags} "${fileUrl}"`;
    case 'linux': // Linux
      return `google-chrome ${chromeFlags} "${fileUrl}"`;
    default:
      console.error('Unsupported platform');
      process.exit(1);
  }
}

// Get and execute the appropriate command
const command = getChromeCommand();
console.log(`Executing: ${command}`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

console.log('\nOpening standalone browser with WebGL forcibly enabled...');
console.log('If Chrome doesn\'t open automatically, please open standalone-browser.html manually in Chrome.');