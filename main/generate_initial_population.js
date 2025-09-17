import fs from "fs";
import initialize_gene from "./plot_timetables.js";
import config from "./config.js";
import { fitness_func_generation } from "./fitness_func.js";
import check_merge_error from "../utils/practical_merge_possible.js";
// practical merger changes are done here ig (tested)

const generate_initialize_population = (alltimetable_sent, room_sent) => {
  let population = [];
  let counter = 0;
  for (let i = 0; i < config.population_size; i++) {
    counter += 1;
    // console.log("counter: ", counter + " i: ", i);
    let alltimetable = JSON.parse(JSON.stringify(alltimetable_sent)); //  timetable data with subjects and teachers already assigned
    let room = JSON.parse(JSON.stringify((room_sent))); //  (capacity is not implemented in this code right now)
    let timetable = initialize_gene(alltimetable, room);
    if (timetable == null) {
      i--;
      continue;
    } else if (timetable.fitness < config.min_global_fitness) {
      i--;
      continue;
    } else {
      let flag = 0;
      for (let j = 0; j < timetable.data.length; j++) {
        if (timetable.data[j].local_fitness < config.min_local_fitness) {
          flag = 1;
          break;
        }
      }
      if (flag == 1) {
        i--;
        continue;
      }
      let check = check_merge_error(timetable);
      if (!check) {
        i--;
        continue;
      }
      console.log(
        "Iteration no : ",
        counter + "\tTimetable accepted : ",
        i + 1,
        (check ? " ✔ " : " ✘ ")
      );
      population.push(timetable);
    }
    // population.push(timetable);
  }
  console.table(population);
  return population;
};

export default generate_initialize_population;

// Example usage:
// let population = generate_initialize_population();
// fs.writeFileSync('./JSON/population_selected.json', JSON.stringify(population, null, 4), 'utf8');

