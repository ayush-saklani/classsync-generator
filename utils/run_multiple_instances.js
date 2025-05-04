import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const art = await fs.promises.readFile('./assets/art.txt', 'utf-8');

const INSTANCES = 4;
const SCRIPT = './main/algorithm.js';
const RESULT_DIR = './results';
const SOLUTION_FILE = (id) => path.join(RESULT_DIR, `solution_${id}.json`);
const LOG_FILE = (id) => path.join(RESULT_DIR, `log_${id}.txt`);

if (!fs.existsSync(RESULT_DIR)) fs.mkdirSync(RESULT_DIR);

const runInstance = (id) => {
  return new Promise((resolve, reject) => {
    const logStream = fs.createWriteStream(LOG_FILE(id));
    const child = spawn('node', [SCRIPT, id]);

    child.stdout.pipe(logStream);
    child.stderr.pipe(logStream);

    child.on('close', async (code) => {
      if (code !== 0) {
        return reject(`Instance ${id} exited with code ${code}`);
      }

      // Read and parse the solution file after the run
      try {
        const data = fs.readFileSync(SOLUTION_FILE(id), 'utf8');
        const genome = JSON.parse(data);
        const bestFitness = genome[0]?.fitness || 0;
        resolve({ id, bestFitness });
      } catch (err) {
        reject({ id, message: `Error reading solution_${id}.json: ${err.message}` });
      }
    });
  });
};

console.log(art);

(async () => {
  try {
    const results = await Promise.allSettled(Array.from({ length: INSTANCES }, (_, i) => runInstance(i + 1)));

    const successes = results.filter((res) => res.status === 'fulfilled').map((res) => res.value);
    const failures = results.filter((res) => res.status === 'rejected').map((res) => res.reason);

    if (successes.length === 0) {
      console.log('❌ No successful runs.');
      return;
    }

    successes.sort((a, b) => b.bestFitness - a.bestFitness);

    console.log('\n🏆 Best results:');
    successes.forEach(({ id, bestFitness }) => console.log(`Run ${id}: Fitness = ${bestFitness}`));
    console.log('\n Failed Runs:');
    failures.forEach(({ id }) => console.log(`Run ${id}: ❌❌❌❌❌❌❌❌`));
  } catch (err) {
    console.error('Error running processes:', err);
  }
})();
