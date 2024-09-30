import fs from 'fs';
import initialize_population from "./plot_timetables.js";

const initialize_population_population = (showstats = false) => {
    let min = 0;
    let max = 50;
    let population = []
    let counter = 0;
    for (let i = 0; i < 200; i++) {
        counter += 1;
        console.log("counter: ", counter + " i: ", i);
        let alltimetable = JSON.parse(fs.readFileSync('data.json', 'utf8'));    //  timetable data with subjects and teachers already assigned
        let room = JSON.parse(fs.readFileSync('room.json', 'utf8'));            //  (capacity is not implemented in this code right now)
        let timetable = initialize_population(alltimetable, room, min, max, showstats);
        if(timetable.fitness < -1000){
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
console.log(population.length);
population.sort((a, b) => b.fitness - a.fitness);
fs.writeFileSync('population.json', JSON.stringify(population, null, 4), 'utf8');