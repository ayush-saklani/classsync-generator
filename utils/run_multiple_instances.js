import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const art = await fs.promises.readFile("./assets/art.txt", "utf-8");

const INSTANCES = 4;
const SCRIPT = "./main/algorithm.js";
const RESULT_DIR = "./results";
const SOLUTION_FILE = (runId) => path.join(RESULT_DIR, `solution_${runId}.json`);
const LOG_FILE = (runId) => path.join(RESULT_DIR, `log_${runId}.txt`);

if (!fs.existsSync(RESULT_DIR)) fs.mkdirSync(RESULT_DIR);

let runCounter = 1;

const runInstance = (runId) => {
  return new Promise((resolve, reject) => {
    console.log(`Running instance ${runId}`);
    const logStream = fs.createWriteStream(LOG_FILE(runId));
    const child = spawn("node", [SCRIPT, runId, runCounter]);

    child.stdout.pipe(logStream);
    child.stderr.pipe(logStream);

    child.on("close", async (code) => {
      if (code !== 0) {
        return reject(`Instance ${runId} exited with code ${code}`);
      }

      // Read and parse the solution file after the run
      try {
        const data = fs.readFileSync(SOLUTION_FILE(runId), "utf8");
        const genome = JSON.parse(data);
        const bestFitness = genome[0]?.fitness || 0;
        resolve({ runId, bestFitness });
      } catch (err) {
        reject({ runId, message: `Error reading solution_${runId}.json: ${err.message}` });
      }
    });
  });
};

console.log(art);

const runBatch = async () => {
  try {
    console.log("Current Run:", runCounter);
    const results = await Promise.allSettled(Array.from({ length: INSTANCES }, (_, i) => runInstance(i + 1)));
    console.log(results);
    const successes = results.filter((res) => res.status === "fulfilled").map((res) => res.value);
    const failures = results.filter((res) => res.status === "rejected").map((res) => res.reason);

    if (successes.length === 0) {
      console.log("❌ No successful runs.");
      return;
    }

    successes.sort((a, b) => b.bestFitness - a.bestFitness);

    const bestRunId = successes[0].runId;
    const bestRunFitness = successes[0].bestFitness;
    const bestRunSolution = JSON.parse(fs.readFileSync(SOLUTION_FILE(bestRunId), "utf8"));
    console.log(`Best Run ID: ${bestRunId} Fitness Score: ${bestRunFitness}`);

    fs.writeFileSync("./JSON/best_instance_result_featuring_kanye_west.json", JSON.stringify(bestRunSolution, null, 4), "utf8");

    console.log("\n Results:");
    successes.forEach(({ runId, bestFitness }) => console.log(`Run ${runId}: Fitness = ${bestFitness}`));
    console.log("\n Failed Runs:");
    failures.forEach(({ runId }) => console.log(`Run ${runId}: ❌❌❌❌❌❌❌❌`));
  } catch (err) {
    console.error("Error running processes:", err);
  }
};

await runBatch();

// while (runCounter <= 50) {
//   await runBatch();
//   runCounter++;
// }
