import fs from 'fs';
import initialize_chromosome from "./plot_timetables.js";
import tournamentSelection from './selection.js';
import config from './config.js';

const generate_initialize_population = (showstats = false) => {
    let population = []
    let counter = 0;
    for (let i = 0; i < config.max_generation; i++) {
        counter += 1;
        // console.log("counter: ", counter + " i: ", i);
        let alltimetable = JSON.parse(fs.readFileSync('data.json', 'utf8'));    //  timetable data with subjects and teachers already assigned
        let room = JSON.parse(fs.readFileSync('room.json', 'utf8'));            //  (capacity is not implemented in this code right now)
        let timetable = initialize_chromosome(alltimetable, room, showstats);
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
let population = generate_initialize_population(false);
// population = tournamentSelection(population, 3, 0.3);
console.log(population.length);
// fs.writeFileSync('population_selected.json', JSON.stringify(population, null, 4), 'utf8');