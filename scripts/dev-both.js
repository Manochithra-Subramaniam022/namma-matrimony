require('dotenv').config();
const { spawn } = require('child_process');

const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

console.log('\x1b[35m%s\x1b[0m', '==============================================================');
console.log('\x1b[36m%s\x1b[0m', '🚀 NAMMA MATRIMONY DUAL-LOCALHOST ENVIRONMENT');
console.log('\x1b[32m%s\x1b[0m', '🌐 Website (Public Matrimony):    http://localhost:3000');
console.log('\x1b[33m%s\x1b[0m', '🛡️  Admin Console (Verification):  http://localhost:3001');
console.log('\x1b[35m%s\x1b[0m', '==============================================================\n');

// 1. Site Server (Port 3000, distDir .next)
const siteEnv = { ...process.env, PORT: '3000', NEXT_DIST_DIR: '.next' };
const siteProcess = spawn(npxCmd, ['next', 'dev', '--webpack', '-p', '3000'], {
  stdio: 'inherit',
  shell: true,
  env: siteEnv,
});

// 2. Admin Server (Port 3001, distDir .next-admin)
const adminEnv = { ...process.env, PORT: '3001', NEXT_DIST_DIR: '.next-admin' };
const adminProcess = spawn(npxCmd, ['next', 'dev', '--webpack', '-p', '3001'], {
  stdio: 'inherit',
  shell: true,
  env: adminEnv,
});

function cleanup() {
  console.log('\n\x1b[31m%s\x1b[0m', 'Shutting down both dev servers...');
  try { siteProcess.kill(); } catch (e) {}
  try { adminProcess.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

