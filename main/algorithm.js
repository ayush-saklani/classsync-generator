import fs from "fs";
import config from "./config.js";
import generate_initialize_population from "./generate_initial_population.js";
import { fitness_func_generation } from "./fitness_func.js";
// import crossoverGeneration from './crossover.js';
// import mutate_Population from './mutation.js';

const check_acceptability = (population) => {
  let flag = true;
  for (let i = 0; i < population.length; i++) {
    flag = true;
    if (population[i].fitness >= config.acceptable_Global_Fitness_Score) {
      console.log(population[i].data[j].local_fitness);
      for (let j = 0; j < population[i].data.length; j++) {
        if (
          population[i].data[j].local_fitness <
          config.acceptable_Local_Fitness_Score
        ) {
          flag = false;
        }
      }
    } else flag = false;
    if (flag == true) {
      fs.writeFileSync("./JSON/classsync.Win.perfect.tables.json", JSON.stringify(population, null, 4), "utf8",);
      fs.writeFileSync("./JSON/accepetedsol.json", JSON.stringify([population[i]], null, 4), "utf8",);
      return true;
    }
  }
  return false;
};
const algorithm = (room) => {
  // step 1: generate initial population
  let alltimetable = JSON.parse(fs.readFileSync("./JSON/classsync.converted.tables.json", "utf8")); //  timetable data with subjects and teachers already assigned
  let population = generate_initialize_population(alltimetable, room);

  // step 1: read population from file (if exists) (alternate)
  // let population = JSON.parse(fs.readFileSync('./JSON/classsync.win.selected.tables.json', 'utf8'));

  // Checkpoint: write population to file
  fs.writeFileSync("./JSON/classsync.win.selected.tables.json", JSON.stringify(population, null, 4), "utf8",);

  // The loop is Technically infinite, and it will break when acceptable solution is found
  // but we have set a max_generation limit to avoid infinite computation of poor offsprings
  for (let i = 0; i < config.max_generation; i++) {
    // step 2: crossover population
    // population = crossoverGeneration(population, room);

    // step 3: mutate population
    // population = mutate_Population(population, room);

    // checkpoint: write population to file per 10 iterations
    if (i % 10 == 0)
      fs.writeFileSync("./JSON/classsync.win.selected.tables.json", JSON.stringify(population, null, 4), "utf8",);

    // step 4: calculate fitness score
    population = fitness_func_generation(population, room);

    // step 5: Check for acceptability or Stop criteria
    if (check_acceptability(population)) {
      console.log("Acceptable solution found");
      return population;
    }
    // Now Repeat step 2 to 5 until stop criteria
  }
  return null;
};
let room = JSON.parse(fs.readFileSync("./JSON/classsync.converted.rooms.json", "utf8")); //  (capacity is not implemented in this code right now)
let population = algorithm(room);

if (population == null) console.log("No acceptable solution found");
else fs.writeFileSync("./JSON/classsync.win.selected.tables.json", JSON.stringify(population, null, 4), "utf8",);

