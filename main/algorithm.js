import fs from "fs";
import config from "./config.js";
import generate_initialize_population from "./generate_initial_population.js";
import { fitness_func_generation } from "./fitness_func.js";
import crossoverGeneration from "./crossover.js";
import mutate_Population from "./mutation.js";
import check_merge_error from "../utils/practical_merge_possible.js";

const art = await fs.promises.readFile("./assets/art.txt", "utf-8");
console.log(art);

const check_acceptability = (population) => {
  let flag = true;
  for (let i = 0; i < population.length; i++) {
    flag = true;
    if (population[i].fitness >= config.acceptable_Global_Fitness_Score) {
      let count = 0;
      for (let j = 0; j < population[i].data.length; j++) {
        if (population[i].data[j].local_fitness < config.acceptable_Local_Fitness_Score_bareminimum) {
          flag = false;
        } else {
          if (population[i].data[j].local_fitness >= config.acceptable_Local_Fitness_Score_min) {
            count++;
          }
        }
      }
      flag = count >= config.acceptable_Local_Fitness_Score_percentage * population[i].data.length ? true : false;
    } else {
      flag = false;
    }
    if (flag == true) {
      fs.writeFileSync("./JSON/classsync.Win.perfect.tables.json", JSON.stringify(population, null, 4), "utf8");
      return true;
    }
  }
  return false;
};
const real_checkpoint_save = (population) => {    // Checkpoint: write population to file if current population is better than previous population
  let previous_population = [];
  if (fs.existsSync("./JSON/classsync.win.chechpoint.tables.json")) {
    previous_population = JSON.parse(fs.readFileSync("./JSON/classsync.win.chechpoint.tables.json", "utf8"));
  }
  if (previous_population.length >= 1 && population[0].fitness > previous_population[0].fitness) {
    console.log("Ka-Chow! New checkpoint saved." + population[0].fitness + " > " + previous_population[0].fitness);
    fs.writeFileSync("./JSON/classsync.win.chechpoint.tables.json", JSON.stringify(population, null, 4), "utf8");
  } else if (previous_population.length == 0) {
    fs.writeFileSync("./JSON/classsync.win.chechpoint.tables.json", JSON.stringify(population, null, 4), "utf8");
  }
};

const initial_population = false;                 // start from scratch

const algorithm = () => {                                                                   // timetable data with subjects and teachers already assigned
  let room = JSON.parse(fs.readFileSync("./JSON/classsync.converted.rooms.json", "utf8"));  // (capacity is not implemented in this code right now)
  let population = [];                                                                      // population array to store the generated timetables
  if (initial_population) {                                                                 // step 1: generate initial population
    let alltimetable = JSON.parse(fs.readFileSync("./JSON/classsync.converted.tables.json", "utf8"));
    population = generate_initialize_population(alltimetable, room);
    fs.writeFileSync("./JSON/classsync.win.selected.tables.json", JSON.stringify(population, null, 4), "utf8"); // Checkpoint: write population to file
  } else {                                                                                  // step 1: generate initial population
    population = JSON.parse(fs.readFileSync("./JSON/classsync.win.chechpoint.tables.json", "utf8"));
  }
  for (let i = 0; i < config.max_generation; i++) {
    population = crossoverGeneration(population, room);                                     // step 2: crossover population
    population = mutate_Population(population, room);                                       // step 3: mutate population
    if (i % 10 == 0) {                                                                      // Checkpoint: write population to file every 10 generations to avoid redoing the same work
      console.log("Checkpoint: writing population to file : " + i + " " + check_merge_error(population[0]));
      fs.writeFileSync("./JSON/classsync.win.selected.tables.json", JSON.stringify(population, null, 4), "utf8");
    }
    real_checkpoint_save(population);                                                       // 2nd Checkpoint: write population to file if current population is best then save it to file
    population = fitness_func_generation(population, room);                                 // step 4: calculate fitness score
    if (check_acceptability(population)) {                                                  // step 5: Check for acceptability or Stop criteria
      console.log("Acceptable solution found");
      fs.writeFileSync("./JSON/classsync.win.selected.tables.json", JSON.stringify(population, null, 4), "utf8");
      return;
    }                                                                                       // Now Repeat step 2 to 5 until stop criteria
  }
  console.log("No acceptable solution found.");
  console.log("Try again with a larger generation limit.");
  return;
};

console.time("Execution Time");
algorithm();
console.timeEnd("Execution Time");