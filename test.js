import fs from 'fs';
import initialize_population from "./plot_timetables.js";
import tournamentSelection from './selection.js';

const initialize_population_population = (showstats = false) => {
    let min = 0;
    let max = 50;
    let population = []
    let counter = 0;
    for (let i = 0; i < 100; i++) {
        counter += 1;
        console.log("counter: ", counter + " i: ", i);
        let alltimetable = JSON.parse(fs.readFileSync('data.json', 'utf8'));    //  timetable data with subjects and teachers already assigned
        let room = JSON.parse(fs.readFileSync('room.json', 'utf8'));            //  (capacity is not implemented in this code right now)
        let timetable = initialize_population(alltimetable, room, min, max, showstats);
        if(timetable.fitness < 150){
            i--;
            continue;
        }else{
            population.push(timetable);
        }
        // population.push(timetable);
    }
    return population;
}
let population = initialize_population_population(false);
population = tournamentSelection(population, 3, 0.3);
console.log(population.length);
fs.writeFileSync('population_selected.json', JSON.stringify(population, null, 4), 'utf8');