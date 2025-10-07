// This script ensures proper shell configuration for Node.js child processes
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set the correct shell path for Windows
const powershellPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';

// Update npm configuration
console.log('Updating npm configuration...');
try {
  execSync(`npm config set script-shell "${powershellPath.replace(/\\/g, '\\\\')}"`, { stdio: 'inherit' });
  console.log('npm configuration updated successfully!');
} catch (error) {
  console.error('Failed to update npm config:', error.message);
}

// Create a .npmrc file if it doesn't exist
const npmrcPath = path.join(process.cwd(), '.npmrc');
if (!fs.existsSync(npmrcPath)) {
  console.log('Creating .npmrc file...');
  fs.writeFileSync(npmrcPath, `script-shell=${powershellPath.replace(/\\/g, '\\\\')}\n`);
  console.log('.npmrc file created successfully!');
} else {
  console.log('.npmrc file already exists');
}

console.log('\nPlease restart your terminal and try running the application again.');
console.log('If the issue persists, you may need to run this script as an administrator.');
