import fs from 'fs';
import initialize_gene from "./plot_timetables.js";
import config from './config.js';
import {fitness_func_generation} from './fitness_func.js';

const generate_initialize_population = () => {
    let population = []
    let counter = 0;
    for (let i = 0; i < config.population_size; i++) {
        counter += 1;
        // console.log("counter: ", counter + " i: ", i);
        let alltimetable = JSON.parse(fs.readFileSync('data.json', 'utf8'));    //  timetable data with subjects and teachers already assigned
        let room = JSON.parse(fs.readFileSync('room.json', 'utf8'));            //  (capacity is not implemented in this code right now)
        let timetable = initialize_gene(alltimetable, room);
        if (timetable == null) {
            i--;
            continue;
        } else if (timetable.fitness < config.min_global_fitness) {
            i--;
            continue;
        } else {
            console.log("counter: ", counter + " i: ", i);
            population.push(timetable);
        }
        // population.push(timetable);
    }
    return population;
}

export default generate_initialize_population;

// Example usage:
// let population = generate_initialize_population();
// fs.writeFileSync('population_selected.json', JSON.stringify(population, null, 4), 'utf8');