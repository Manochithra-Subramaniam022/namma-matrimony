const { spawn } = require('child_process');

process.env.PORT = '3001';
process.env.NEXT_DIST_DIR = '.next-admin';

console.log('\x1b[33m%s\x1b[0m', '🛡️  Starting Namma Matrimony Admin Console on http://localhost:3001 ...');

const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

const child = spawn(npxCmd, ['next', 'dev', '--webpack', '-p', '3001'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('close', (code) => {
  process.exit(code || 0);
});

