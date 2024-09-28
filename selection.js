import fs from 'fs';

const tournamentSelection = (population, tournamentSize = 3, selectionRate = 0.5) => {
    const selectedIndividuals = [];
    const numToSelect = Math.floor(population.length * selectionRate); // Calculate how many individuals to select

    while (selectedIndividuals.length < numToSelect) {
        // Randomly select individuals for the tournament
        const tournament = [];
        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * population.length);
            tournament.push(population[randomIndex]);
            population.splice(randomIndex, 1);  // Remove the selected individual from the population to avaoid repetition (No replacement)
        }
        // Select the best individual from the tournament 
        const bestIndividual = tournament.reduce((best, individual) => 
            (individual.fitness > best.fitness ? individual : best), tournament[0]);

        selectedIndividuals.push(bestIndividual);
    }
    return selectedIndividuals;
};

// Example usage:
let population = JSON.parse(fs.readFileSync('population.json', 'utf8'));
const selectionRate = 0.3; // Select 30% of the population
const selectedPopulation = tournamentSelection(population, 3, selectionRate); // Apply tournament selection
fs.writeFileSync('population_selected.json', JSON.stringify(selectedPopulation, null, 2));

console.log("Selected Individuals:", selectedPopulation.length);
