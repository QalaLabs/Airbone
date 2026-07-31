import { execSync } from 'child_process';

console.log('--- Pre-dev Port 3000 Check ---');
try {
  if (process.platform === 'win32') {
    const output = execSync('netstat -ano').toString();
    const lines = output.split('\n');
    const pids = new Set();
    for (const line of lines) {
      if (line.includes(':3000') && line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== process.pid.toString()) {
          pids.add(pid);
        }
      }
    }
    for (const pid of pids) {
      console.log(`Found stale process ${pid} using port 3000. Terminating...`);
      try {
        execSync(`taskkill /F /PID ${pid}`);
      } catch (err) {
        console.error(`Failed to terminate process ${pid}:`, err.message);
      }
    }
  } else {
    try {
      const pid = execSync('lsof -t -i:3000').toString().trim();
      if (pid && pid !== process.pid.toString()) {
        console.log(`Found stale process ${pid} using port 3000. Terminating...`);
        execSync(`kill -9 ${pid}`);
      }
    } catch (e) {
      // lsof returns non-zero code if no process is bound
    }
  }
  console.log('Port 3000 is clear.');
} catch (e) {
  console.warn('Pre-dev port check skipped or failed:', e.message);
}
console.log('--------------------------------\n');
