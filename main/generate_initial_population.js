import fs from "fs";
import initialize_gene from "./plot_timetables.js";
import config from "./config.js";
import { fitness_func_generation } from "./fitness_func.js";

const generate_initialize_population = () => {
  let population = [];
  let counter = 0;
  for (let i = 0; i < config.population_size; i++) {
    counter += 1;
    // console.log("counter: ", counter + " i: ", i);
    let alltimetable = JSON.parse(
      fs.readFileSync(
        "../classsync_utils/classsync.converted.tables.json",
        "utf8",
      ),
    ); //  timetable data with subjects and teachers already assigned
    let room = JSON.parse(
      fs.readFileSync(
        "../classsync_utils/classsync.converted.rooms.json",
        "utf8",
      ),
    ); //  (capacity is not implemented in this code right now)
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
      console.log(
        "Iteration no : ",
        counter + "\tTimetable accepted : ",
        i + 1,
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
// fs.writeFileSync('population_selected.json', JSON.stringify(population, null, 4), 'utf8');

