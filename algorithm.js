import fs from 'fs';
import crossoverGeneration from './crossover.js';
import generate_initialize_population from './generate_initial_population.js';
import config from './config.js';
import mutate_Population from './mutation.js';

let population;
let room = JSON.parse(fs.readFileSync('room.json', 'utf8'));

population = generate_initialize_population();
// population= JSON.parse(fs.readFileSync('population_selected.json', 'utf8'));

fs.writeFileSync('population_selected.json', JSON.stringify(population, null, 4), 'utf8');
// for (let i = 0; i < config.max_generation; i++) {
//     population = crossoverGeneration(population, room);
//     population = mutate_Population(population, room);
//     fs.writeFileSync('population_selected.json', JSON.stringify(population, null, 4), 'utf8');
//     console.log(population.length + " : " + i);
// }

// fs.writeFileSync('population_selected.json', JSON.stringify(population, null, 4), 'utf8');

console.log(population.length);