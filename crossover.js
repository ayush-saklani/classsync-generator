// import { cloneDeep } from 'lodash'; // For deep copying the timetables
import fs from 'fs'
import fitness_func from './fitness_func.js';
import validate_timetable from './validate_timetable.js';
import { sort } from 'mathjs';

// Function to reassign a class when there's a conflict
const reassignClass = (timetable, day, slot, teacherid, room) => {
    // Randomly find a new empty slot that doesn't have a teacher conflict
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 10; j++) {
            if (timetable[i][j].teacherid === "" && timetable[i][j].classid === "") {
                timetable[i][j].teacherid = teacherid;
                timetable[day][slot] = { teacherid: "", classid: "" }; // Clear the conflicting slot
                return;
            }
        }
    }
};

// Function to reassign a room when there's a conflict
const reassignRoom = (timetable, day, slot, classid, room) => {
    // Randomly find a new room that doesn't have a conflict
    for (let i = 0; i < room['room'].length; i++) {
        const newRoomId = room['room'][i].roomid;
        if (!isRoomOccupied(timetable, newRoomId, day, slot)) {
            timetable[day][slot].classid = newRoomId;
            return;
        }
    }
};

// Helper function to check if a room is already occupied at a given day and slot
const isRoomOccupied = (timetable, roomid, day, slot) => {
    for (let i = 0; i < timetable.length; i++) {
        if (timetable[day][slot].classid === roomid) {
            return true;
        }
    }
    return false;
};

// Function to resolve conflicts (teacher/room clashes) in a timetable
const resolveConflicts = (offspring, room) => {
    const teacherMap = {};
    const roomMap = {};

    for (let i = 0; i < offspring['data'].length; i++) {
        for (let day = 0; day < 7; day++) {
            for (let slot = 0; slot < 10; slot++) {
                const { teacherid, classid } = offspring['data'][i].timetable[day][slot];

                // Check for teacher conflicts
                if (teacherid) {
                    const teacherKey = `teacher-${teacherid}-${day}-${slot}`;
                    if (teacherMap[teacherKey]) {
                        reassignClass(offspring['data'][i].timetable, day, slot, teacherid, room); // Reassign the class to resolve conflict
                    } else {
                        teacherMap[teacherKey] = true;
                    }
                }

                // Check for room conflicts
                if (classid) {
                    const roomKey = `room-${classid}-${day}-${slot}`;
                    if (roomMap[roomKey]) {
                        reassignRoom(offspring['data'][i].timetable, day, slot, classid, room); // Reassign the room to resolve conflict
                    } else {
                        roomMap[roomKey] = true;
                    }
                }
            }
        }
    }
};
// Function to perform crossover between two timetables (parents)
const crossover = (parent1, parent2, room) => {
    // Deep copy parent timetables to avoid modifying the original ones
    const offspring1 = JSON.parse(JSON.stringify(parent1));
    const offspring2 = JSON.parse(JSON.stringify(parent2));

    // Select a random crossover point (section, day, time slot)
    const crossoverPoint = Math.floor(Math.random() * offspring1['data'].length); // Cross over between sections
    const sectionCrossoverPoint = Math.floor(Math.random() * 7); // Days
    const timeSlotCrossoverPoint = Math.floor(Math.random() * 10); // Time slots in a day

    // Perform crossover by swapping timetables after the crossover point
    for (let i = crossoverPoint; i < offspring1['data'].length; i++) {
        for (let j = sectionCrossoverPoint; j < 7; j++) {
            for (let k = timeSlotCrossoverPoint; k < 10; k++) {
                // Swap the timetable slots between offspring1 and offspring2
                const tempSlot = offspring1['data'][i].timetable[j][k];
                offspring1['data'][i].timetable[j][k] = offspring2['data'][i].timetable[j][k];
                offspring2['data'][i].timetable[j][k] = tempSlot;
            }
        }
    }

    // After crossover, resolve any conflicts in the offspring timetables
    resolveConflicts(offspring1, room);
    resolveConflicts(offspring2, room);

    return [offspring1, offspring2];
};

// Function to perform crossover on a whole generation (population)
const crossoverGeneration = (population, room) => {
    const newGeneration = [];

    // Pair up parents from the population
    for (let i = 0; i < population.length; i += 2) {
        // Select two parents
        const parent1 = population[i];
        const parent2 = population[i + 1] || population[0]; // In case of odd population, pair with first parent

        // Perform crossover
        const [offspring1, offspring2] = crossover(parent1, parent2, room);

        // Add offspring to the new generation
        newGeneration.push(offspring1, offspring2);
    }

    return newGeneration;
};

let alltimetable = JSON.parse(fs.readFileSync('population_selected.json', 'utf8'));    //  timetable data with subjects and teachers already assigned
let room = JSON.parse(fs.readFileSync('room.json', 'utf8'));            //  (capacity is not implemented in this code right now)
let population = crossoverGeneration(alltimetable, room);
for (let i = 0; i < population.length; i++) {
    population[i] = fitness_func(population[i]);
    console.log("======== [ Validation : " + validate_timetable(population[i]) + " ] ========= [ Fitness : " + population[i]['fitness'] + " ] ==========");

}
population = population.sort((a, b) => b.fitness - a.fitness);
// console.log(population);

fs.writeFileSync('population_crossover.json', JSON.stringify(population, null, 4), 'utf8');
export default crossoverGeneration;
