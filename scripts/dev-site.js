const { spawn } = require('child_process');

process.env.PORT = '3000';
process.env.NEXT_DIST_DIR = '.next';

console.log('\x1b[32m%s\x1b[0m', '🌐 Starting Namma Matrimony Website on http://localhost:3000 ...');

const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

const child = spawn(npxCmd, ['next', 'dev', '--webpack', '-p', '3000'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

child.on('close', (code) => {
  process.exit(code || 0);
});

