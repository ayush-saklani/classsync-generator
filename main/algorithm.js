import fs from "fs";
import config from "./config.js";
import generate_initialize_population from "./generate_initial_population.js";
import { fitness_func_generation } from "./fitness_func.js";
import crossoverGeneration from "./crossover.js";
import mutate_Population from "./mutation.js";
const art = await fs.promises.readFile("./assets/art.txt", "utf-8");
const runId = process.argv[2] || "default";
const runCounter = process.argv[3] || 1;

const check_acceptability = (population) => {
  let flag = true;
  for (let i = 0; i < population.length; i++) {
    flag = true;
    if (population[i].fitness >= config.acceptable_Global_Fitness_Score) {
      let count = 0;
      for (let j = 0; j < population[i].data.length; j++) {
        // console.log(population[i].data[j].local_fitness);
        if (population[i].data[j].local_fitness < config.acceptable_Local_Fitness_Score_bareminimum) {
          flag = false;
        } else {
          if (population[i].data[j].local_fitness >= config.acceptable_Local_Fitness_Score_min) {
            count++;
          }
        }
      }
      if (count >= config.acceptable_Local_Fitness_Score_percentage * population[i].data.length) {
        flag = true;
      } else {
        flag = false;
      }
    } else {
      flag = false;
    }
    if (flag == true) {
      fs.writeFileSync("./JSON/classsync.Win.perfect.tables.json", JSON.stringify(population, null, 4), "utf8");
      fs.writeFileSync("./JSON/accepetedsol.json", JSON.stringify([population[i]], null, 4), "utf8");
      return true;
    }
  }
  return false;
};

const real_checkpoint_save = (population) => {
  // Checkpoint: write population to file if current population is better than previous population
  let previous_population = [];
  if (fs.existsSync("./JSON/classsync.win.chechpoint.tables.json")) {
    previous_population = JSON.parse(fs.readFileSync("./JSON/classsync.win.chechpoint.tables.json", "utf8"));
  }
  if (previous_population.length >= 1 && population[0].fitness > previous_population[0].fitness) {
    console.log("Ka-Chow! New checkpoint saved.");

    fs.writeFileSync("./JSON/classsync.win.chechpoint.tables.json", JSON.stringify(population, null, 4), "utf8");
  } else if (previous_population.length == 0) {
    fs.writeFileSync("./JSON/classsync.win.chechpoint.tables.json", JSON.stringify(population, null, 4), "utf8");
  }

  const solutionPath = `./results/solution_${runId}.json`;
  if (fs.existsSync(solutionPath)) {
    let previous_current_instance_population = JSON.parse(fs.readFileSync(solutionPath, "utf8"));
    if (previous_current_instance_population[0].fitness < population[0].fitness) {
      fs.writeFileSync(solutionPath, JSON.stringify(population, null, 4), "utf8");
    }
  } else {
    fs.writeFileSync(solutionPath, JSON.stringify(population, null, 4), "utf8");
  }
};

const algorithm = (room) => {
  console.log("Run ID of current run instance: ", runId, "Current Run Number: ", runCounter);
  //  timetable data with subjects and teachers already assigned
  let alltimetable = JSON.parse(fs.readFileSync("./JSON/classsync.converted.tables.json", "utf8")); // step 1: generate initial population
  let population;

  // if (runCounter == 1) {
  //   population = generate_initialize_population(alltimetable, room);
  //   fs.writeFileSync("./JSON/classsync.win.selected.tables.json", JSON.stringify(population, null, 4), "utf8"); // Checkpoint: write population to file
  // } else {
  //   population = JSON.parse(fs.readFileSync("./JSON/best_instance_result_featuring_kanye_west.json", "utf8"));
  // }
  population = JSON.parse(fs.readFileSync("./JSON/classsync.win.selected.tables.json", "utf8")); // step 1: read population from file (if exists) (alternate)

  // The loop is Technically infinite, and it will break when acceptable solution is found
  // but we have set a max_generation limit to avoid infinite computation of poor offsprings
  for (let i = 0; i < config.max_generation; i++) {
    population = crossoverGeneration(population, room); // step 2: crossover population
    population = mutate_Population(population, room); // step 3: mutate population

    if (i % 10 == 0) {
      // Checkpoint: write population to file every 10 generations
      console.log("Checkpoint: writing population to file...");
      fs.writeFileSync("./JSON/classsync.win.selected.tables.json", JSON.stringify(population, null, 4), "utf8");
    }
    real_checkpoint_save(population); // Checkpoint: write population to file if current population is better than previous population

    population = fitness_func_generation(population, room); // step 4: calculate fitness score

    if (check_acceptability(population)) {
      console.log("Acceptable solution found"); // step 5: Check for acceptability or Stop criteria
      return population;
    }
    // Now Repeat step 2 to 5 until stop criteria
  }
  return null;
};

//console.log(art);
console.time("Execution Time");

let room = JSON.parse(fs.readFileSync("./JSON/classsync.converted.rooms.json", "utf8")); //  (capacity is not implemented in this code right now)
let population = algorithm(room);

if (population == null) {
  console.log("No acceptable solution found. Try again with a larger generation limit.");
  console.log("Population data is saved in classsync.win.selected.tables.json file.\n");
} else fs.writeFileSync("./JSON/classsync.win.selected.tables.json", JSON.stringify(population, null, 4), "utf8");
console.timeEnd("Execution Time");
