// import { cloneDeep } from 'lodash'; // For deep copying the timetables
import fs from 'fs'
import fitness_func from './fitness_func.js';
import validate_timetable from './validate_timetable.js';

const findNewRoom = (j, k, roomid, type, room, temp) => {
    let room_type = (type == 'practical') ? 'lab' : 'room';

    while (room[room_type].length > 0) {
        let random_room_index = Math.floor(Math.random() * room[room_type].length);
        let temproom = room[room_type][random_room_index].roomid;
        // console.log("Room conflict " + temproom + " " + roomid + " " + j + " " + k + " " + type);
        if (type == 'practical') {
            let offset = (k < 9) ? 1 : -1;
            if ((temp[('class' + ';' + j + ';' + k + ';' + temproom)] || false) || (temp[('class' + ';' + j + ';' + (k + offset) + ';' + temproom)] || false)) {
                room[room_type].splice(random_room_index, 1);
            } else {
                return temproom;
            }
        }
        else {
            if (temp[('class' + ';' + j + ';' + k + ';' + temproom)]) {
                room[room_type].splice(random_room_index, 1);
            } else {
                return temproom;
            }
        }
    }
    return null;
}

const findNewSlot = (timetable, day, slot, teacherid, room) => {
}

// Function to resolve conflicts (teacher/room clashes) in a timetable
const resolveConflicts = (offspring, room) => {
    let temp = {};
    for (let i = 0; i < offspring['data'].length; i++) {
        for (let j = 0; j < 7; j++) {
            for (let k = 0; k < 10; k++) {
                const { teacherid, roomid } = offspring['data'][i]['timetable'][j][k];
                if (offspring['data'][i]['timetable'][j][k].teacherid == "" && offspring['data'][i]['timetable'][j][k].roomid == "") {         // if class is empty            
                    continue;
                }
                else if (offspring['data'][i]['timetable'][j][k].teacherid && offspring['data'][i]['timetable'][j][k].roomid) {
                    if (temp[("teacher" + ";" + j + ";" + k + ";" + offspring['data'][i]['timetable'][j][k].teacherid)] || temp[("class" + ";" + j + ";" + k + ";" + offspring['data'][i]['timetable'][j][k].roomid)]) {
                        if (temp[("class" + ";" + j + ";" + k + ";" + offspring['data'][i]['timetable'][j][k].roomid)]) {
                            //  if class is already assigned to a slot then find a new slot for the class and assign it to the slot
                            let tempRoom = findNewRoom(j, k, offspring['data'][i]['timetable'][j][k].roomid, offspring['data'][i]['timetable'][j][k].type, room, temp);
                            console.log("Class conflict " + offspring['data'][i]['timetable'][j][k].type + " " + offspring['data'][i]['timetable'][j][k].roomid + " " + i + " " + j + " " + k + " " + tempRoom);
                            if (tempRoom == null) {
                                console.log("are baba all rooms are full we need to find a new slot for the class");
                                findNewSlot(offspring['data'][i]['timetable'], j, k, offspring['data'][i]['timetable'][j][k].teacherid, room);
                            }
                            else {
                                if (offspring['data'][i]['timetable'][j][k].type == 'practical') {
                                    let offset = (k < 9) ? 1 : -1;
                                    temp[('class' + ';' + j + ';' + k + ';' + offspring['data'][i]['timetable'][j][k].roomid)] = false                 //remove the current class from the temp
                                    temp[('class' + ';' + j + ';' + (k + offset) + ';' + offspring['data'][i]['timetable'][j][k].roomid)] = false      //remove the current class from the temp
                                    offspring['data'][i]['timetable'][j][k].roomid = tempRoom;                                                         //assign the new room to the current class                          
                                    offspring['data'][i]['timetable'][j][k + offset].roomid = tempRoom;                                                //assign the new room to the next slot of the current class
                                    temp[('class' + ';' + j + ';' + k + ';' + offspring['data'][i]['timetable'][j][k].roomid)] = true;                 //add the new class to the temp
                                    temp[('class' + ';' + j + ';' + (k + offset) + ';' + offspring['data'][i]['timetable'][j][k].roomid)] = true;      //add the new class to the temp
                                }
                                else {
                                    temp[('class' + ';' + j + ';' + k + ';' + offspring['data'][i]['timetable'][j][k].roomid)] = false;                //remove the current class from the temp
                                    offspring['data'][i]['timetable'][j][k].roomid = tempRoom;                                                         //assign the new room to the current class
                                    temp[('class' + ';' + j + ';' + k + ';' + offspring['data'][i]['timetable'][j][k].roomid)] = true;                 //add the new class to the temp
                                }
                            }
                        }
                        if (temp[("teacher" + ";" + j + ";" + k + ";" + offspring['data'][i]['timetable'][j][k].teacherid)]) {
                            // findNewSlot(offspring['data'][i]['timetable'], j, k, offspring['data'][i]['timetable'][j][k].roomid, room);
                            // console.log("Teacher conflict found "+ i + " " + j + " " + k);
                            return false;
                        }
                    }
                    else {
                        temp[("teacher" + ";" + j + ";" + k + ";" + offspring['data'][i]['timetable'][j][k].teacherid)] = true;
                        temp[("class" + ";" + j + ";" + k + ";" + offspring['data'][i]['timetable'][j][k].roomid)] = true;
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

    // Perform crossover by swapping timetables after the crossover point
    for (let i = crossoverPoint; i < offspring1['data'].length; i++) {
        let temp = offspring1['data'][i].timetable;
        offspring1['data'][i].timetable = offspring2['data'][i].timetable;
        offspring2['data'][i].timetable = temp;
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
    // console.log("======== [ Validation : " + validate_timetable(population[i]) + " ] ========= [ Fitness : " + population[i]['fitness'] + " ] ==========");

}
population = population.sort((a, b) => b.fitness - a.fitness);
// console.log(population);

fs.writeFileSync('population_crossover.json', JSON.stringify(population, null, 4), 'utf8');
export default crossoverGeneration;
