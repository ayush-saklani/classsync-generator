import fs from 'fs';
import { fitness_func_generation } from './fitness_func.js';
import validate_timetable from './validate_timetable.js';
import config from './config.js';
let showstats = config.showstats;
const check_teacher_overload = (j, k, teacherid, type, teacher_room_clash_map) => {
    let curr_index = k + 1;
    let streak = 1;
    if (type == 'practical') {
        k++;
        streak++;
    }
    let local_stream = 0;
    while (curr_index <= 9) {
        let teacher_overload_checker = 'teacher' + ';' + j + ';' + curr_index + ';' + teacherid;
        if (teacher_room_clash_map[teacher_overload_checker] == true) {
            local_stream++;
        } else {
            break;
        }
        curr_index++;
    }
    streak += local_stream;
    local_stream = 0;
    curr_index = k--;

    while (curr_index >= 0) {
        let teacher_overload_checker = 'teacher' + ';' + j + ';' + curr_index + ';' + teacherid;
        if (teacher_room_clash_map[teacher_overload_checker] == true) {
            local_stream++;
        } else {
            break;
        }
        curr_index--;
    }
    streak += local_stream;
    if (streak > 4) {
        // console.log(streak>4 ? false : true);
    }
    return streak > 4 ? false : true;
}
const findNewSlot = (timetable, day, slot, teacherid, roomid, type, teacher_room_clash_map, room) => {
    if (showstats) {
        console.log("\n============= " + type + "\t || Initial slot : " + day + " " + slot + " ====================")
    }
    let room_type = (type === 'practical') ? 'lab' : 'room';
    let min = config.min, max = config.max;
    let temp_total_forward = (day * 10) + slot;
    let temp_total_backward = (day * 10) + slot;
    let slotsubjectid = timetable[day][slot].subjectid;
    let slottype = timetable[day][slot].type;

    // Clear the current slot for the conflicting class
    if (timetable[day][slot].teacherid === teacherid && timetable[day][slot].roomid === roomid) {
        timetable[day][slot].teacherid = "";
        timetable[day][slot].roomid = "";
        timetable[day][slot].subjectid = "";
        timetable[day][slot].type = "";

        if (type === 'practical') {
            if (slot < 9 && timetable[day][slot + 1].teacherid === teacherid && timetable[day][slot + 1].roomid === roomid) {
                timetable[day][slot + 1].teacherid = "";
                timetable[day][slot + 1].roomid = "";
                timetable[day][slot + 1].subjectid = "";
                timetable[day][slot + 1].type = "";
            } else if (slot > 0 && timetable[day][slot - 1].teacherid === teacherid && timetable[day][slot - 1].roomid === roomid) {
                timetable[day][slot - 1].teacherid = "";
                timetable[day][slot - 1].roomid = "";
                timetable[day][slot - 1].subjectid = "";
                timetable[day][slot - 1].type = "";
                temp_total_forward--;
                temp_total_backward--;
            }
        }
    }

    let flag1 = true, flag2 = true;

    while (flag1 || flag2) {
        let temp_day_forward = Math.floor(temp_total_forward / 10);
        let temp_slot_forward = temp_total_forward % 10;

        let temp_day_backward = Math.floor(temp_total_backward / 10);
        let temp_slot_backward = temp_total_backward % 10;

        // Create conflict keys for forward and backward checking (teacher and room availability)
        let teacher_checker_forward = "teacher" + ";" + temp_day_forward + ";" + temp_slot_forward + ";" + teacherid;
        let teacher_checker_backward = "teacher" + ";" + temp_day_backward + ";" + temp_slot_backward + ";" + teacherid;

        // For practical classes, also check the next slot
        let teacher_checker_forward_practical = "teacher" + ";" + temp_day_forward + ";" + (temp_slot_forward + 1) + ";" + teacherid;
        let teacher_checker_backward_practical = "teacher" + ";" + temp_day_backward + ";" + (temp_slot_backward + 1) + ";" + teacherid;

        // Check forward for practical subjects
        if (type === 'practical' && temp_slot_forward < 9 &&
            (!teacher_room_clash_map[teacher_checker_forward] && !teacher_room_clash_map[teacher_checker_forward_practical]) &&
            timetable[temp_day_forward][temp_slot_forward].teacherid === "" &&
            timetable[temp_day_forward][temp_slot_forward + 1].teacherid === "" &&
            check_teacher_overload(temp_day_forward, temp_slot_forward, teacherid, type, teacher_room_clash_map)) {

            // Check room availability for the practical class in two consecutive slots
            if (showstats)
                process.stdout.write("Slot : " + temp_day_forward + " " + temp_slot_forward + " || Room : ");
            for (let i = 0; i < room[room_type].length; i++) {
                if (showstats)
                    process.stdout.write(room[room_type][i].roomid + " ");

                let room_checker_forward = "room" + ";" + temp_day_forward + ";" + temp_slot_forward + ";" + room[room_type][i].roomid;
                let room_checker_forward_practical = "room" + ";" + temp_day_forward + ";" + (temp_slot_forward + 1) + ";" + room[room_type][i].roomid;

                if (!teacher_room_clash_map[room_checker_forward] && !teacher_room_clash_map[room_checker_forward_practical]) {
                    // Assign the new slot to the practical class
                    timetable[temp_day_forward][temp_slot_forward].teacherid = teacherid;
                    timetable[temp_day_forward][temp_slot_forward + 1].teacherid = teacherid;
                    timetable[temp_day_forward][temp_slot_forward].roomid = room[room_type][i].roomid;
                    timetable[temp_day_forward][temp_slot_forward + 1].roomid = room[room_type][i].roomid;
                    timetable[temp_day_forward][temp_slot_forward].subjectid = slotsubjectid;
                    timetable[temp_day_forward][temp_slot_forward + 1].subjectid = slotsubjectid;
                    timetable[temp_day_forward][temp_slot_forward].type = slottype;
                    timetable[temp_day_forward][temp_slot_forward + 1].type = slottype;

                    // Update the clash map
                    teacher_room_clash_map[room_checker_forward] = true;
                    teacher_room_clash_map[room_checker_forward_practical] = true;
                    teacher_room_clash_map[teacher_checker_forward] = true;
                    teacher_room_clash_map[teacher_checker_forward_practical] = true;
                    if (showstats) {
                        process.stdout.write(" || slot found at " + temp_day_forward + " " + temp_slot_forward);
                        console.log("\n===================================================================")
                    }
                    return { timetable, teacher_room_clash_map };
                }
            }
            if (showstats)
                process.stdout.write(" || NA\n");
        } else if (type === 'theory' && !teacher_room_clash_map[teacher_checker_forward] &&
            check_teacher_overload(temp_day_forward, temp_slot_forward, teacherid, type, teacher_room_clash_map) &&
            timetable[temp_day_forward][temp_slot_forward].teacherid === "") {
            if (showstats)
                process.stdout.write("Slot : " + temp_day_forward + " " + temp_slot_forward + " || Room : ");

            // Check room availability for theory class
            for (let i = 0; i < room[room_type].length; i++) {
                if (showstats)
                    process.stdout.write(room[room_type][i].roomid + " ");

                let room_checker_forward = "room" + ";" + temp_day_forward + ";" + temp_slot_forward + ";" + room[room_type][i].roomid;

                if (!teacher_room_clash_map[room_checker_forward]) {
                    // Assign the new slot to the theory class
                    timetable[temp_day_forward][temp_slot_forward].teacherid = teacherid;
                    timetable[temp_day_forward][temp_slot_forward].roomid = room[room_type][i].roomid;
                    timetable[temp_day_forward][temp_slot_forward].subjectid = slotsubjectid;
                    timetable[temp_day_forward][temp_slot_forward].type = slottype;

                    // Update the clash map
                    teacher_room_clash_map[room_checker_forward] = true;
                    teacher_room_clash_map[teacher_checker_forward] = true;
                    if (showstats) {
                        process.stdout.write(" || slot found at " + temp_day_forward + " " + temp_slot_forward);
                        console.log("\n===================================================================")
                    }
                    return { timetable, teacher_room_clash_map };
                }
            }
            if (showstats)
                process.stdout.write(" || NA\n");
        }

        // Check backward for practical subjects
        if (type === 'practical' && temp_slot_backward < 9 &&
            (!teacher_room_clash_map[teacher_checker_backward] && !teacher_room_clash_map[teacher_checker_backward_practical]) &&
            timetable[temp_day_backward][temp_slot_backward].teacherid === "" &&
            timetable[temp_day_backward][temp_slot_backward + 1].teacherid === "" &&
            check_teacher_overload(temp_day_forward, temp_slot_forward, teacherid, type, teacher_room_clash_map)) {
            if (showstats)
                process.stdout.write("Slot : " + temp_day_backward + " " + temp_slot_backward + " || Room : ");
            for (let i = 0; i < room[room_type].length; i++) {
                if (showstats)
                    process.stdout.write(room[room_type][i].roomid + " ");

                let room_checker_backward = "room" + ";" + temp_day_backward + ";" + temp_slot_backward + ";" + room[room_type][i].roomid;
                let room_checker_backward_practical = "room" + ";" + temp_day_backward + ";" + (temp_slot_backward + 1) + ";" + room[room_type][i].roomid;

                if (!teacher_room_clash_map[room_checker_backward] && !teacher_room_clash_map[room_checker_backward_practical]) {
                    // Assign the new slot to the practical class
                    timetable[temp_day_backward][temp_slot_backward].teacherid = teacherid;
                    timetable[temp_day_backward][temp_slot_backward + 1].teacherid = teacherid;
                    timetable[temp_day_backward][temp_slot_backward].roomid = room[room_type][i].roomid;
                    timetable[temp_day_backward][temp_slot_backward + 1].roomid = room[room_type][i].roomid;
                    timetable[temp_day_backward][temp_slot_backward].subjectid = slotsubjectid;
                    timetable[temp_day_backward][temp_slot_backward + 1].subjectid = slotsubjectid;
                    timetable[temp_day_backward][temp_slot_backward].type = slottype;
                    timetable[temp_day_backward][temp_slot_backward + 1].type = slottype;

                    // Update the clash map
                    teacher_room_clash_map[room_checker_backward] = true;
                    teacher_room_clash_map[room_checker_backward_practical] = true;
                    teacher_room_clash_map[teacher_checker_backward] = true;
                    teacher_room_clash_map[teacher_checker_backward_practical] = true;
                    if (showstats) {
                        process.stdout.write(" || slot found at " + temp_day_backward + " " + temp_slot_backward);
                        console.log("\n===================================================================")
                    }
                    return { timetable, teacher_room_clash_map };
                }
            }
            if (showstats)
                process.stdout.write(" || NA\n");
        } else if (type === 'theory' && !teacher_room_clash_map[teacher_checker_backward] &&
            check_teacher_overload(temp_day_forward, temp_slot_forward, teacherid, type, teacher_room_clash_map) &&
            timetable[temp_day_backward][temp_slot_backward].teacherid === "") {
            if (showstats)
                process.stdout.write("Slot : " + temp_day_backward + " " + temp_slot_backward + " || Room : ");
            // Check room availability for theory class
            for (let i = 0; i < room[room_type].length; i++) {
                if (showstats)
                    process.stdout.write(room[room_type][i].roomid + " ");

                let room_checker_backward = "room" + ";" + temp_day_backward + ";" + temp_slot_backward + ";" + room[room_type][i].roomid;

                if (!teacher_room_clash_map[room_checker_backward]) {
                    // Assign the new slot to the theory class
                    timetable[temp_day_backward][temp_slot_backward].teacherid = teacherid;
                    timetable[temp_day_backward][temp_slot_backward].roomid = room[room_type][i].roomid;
                    timetable[temp_day_backward][temp_slot_backward].subjectid = slotsubjectid;
                    timetable[temp_day_backward][temp_slot_backward].type = slottype;

                    // Update the clash map
                    teacher_room_clash_map[room_checker_backward] = true;
                    teacher_room_clash_map[teacher_checker_backward] = true;
                    if (showstats) {
                        process.stdout.write(" || slot found at " + temp_day_backward + " " + temp_slot_backward);
                        console.log("\n===================================================================")
                    }
                    return { timetable, teacher_room_clash_map };
                }
            }
            if (showstats)
                process.stdout.write(" || NA\n");
        }

        // Move forward and backward in time
        temp_total_forward++;
        temp_total_backward--;
        if (type === 'practical') {
            temp_total_forward++;
            temp_total_backward--;
        }

        if (temp_total_forward > max) {
            flag1 = false;
            temp_total_forward = min;
        }
        if (temp_total_backward < min) {
            flag2 = false;
            temp_total_backward = max;
        }
    }
    if (showstats) {
        console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<       >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        console.log("===================================================================")
    }
    // If no free slot was found, return null
    return null;
};

// Function to resolve conflicts (teacher/room clashes) in a timetable
const resolveConflicts = (offspring, room) => {
    let teacher_room_clash_map = {};
    for (let i = 0; i < offspring['data'].length; i++) {
        for (let j = 0; j < 7; j++) {
            for (let k = 0; k < 10; k++) {
                if (offspring['data'][i]['timetable'][j][k].teacherid == "" && offspring['data'][i]['timetable'][j][k].roomid == "") {         // if class is empty            
                    continue;
                }
                else if (offspring['data'][i]['timetable'][j][k].teacherid && offspring['data'][i]['timetable'][j][k].roomid) {
                    if (teacher_room_clash_map[("teacher" + ";" + j + ";" + k + ";" + offspring['data'][i]['timetable'][j][k].teacherid)] || teacher_room_clash_map[("room" + ";" + j + ";" + k + ";" + offspring['data'][i]['timetable'][j][k].roomid)]) {
                        let newslottedtt;
                        if (offspring['data'][i]['timetable'][j][k].type === 'practical' && k < 9 &&
                            offspring['data'][i]['timetable'][j][k + 1].teacherid === offspring['data'][i]['timetable'][j][k].teacherid) {
                            newslottedtt = findNewSlot(offspring['data'][i]['timetable'], j, k, offspring['data'][i]['timetable'][j][k].teacherid, offspring['data'][i]['timetable'][j][k].roomid, offspring['data'][i]['timetable'][j][k].type, teacher_room_clash_map, room);
                        } else if (offspring['data'][i]['timetable'][j][k].type === 'practical' && k > 0 &&
                            offspring['data'][i]['timetable'][j][k - 1].teacherid === offspring['data'][i]['timetable'][j][k].teacherid) {
                            newslottedtt = findNewSlot(offspring['data'][i]['timetable'], j, (k - 1), offspring['data'][i]['timetable'][j][k].teacherid, offspring['data'][i]['timetable'][j][k].roomid, offspring['data'][i]['timetable'][j][k].type, teacher_room_clash_map, room);
                        } else {
                            newslottedtt = findNewSlot(offspring['data'][i]['timetable'], j, k, offspring['data'][i]['timetable'][j][k].teacherid, offspring['data'][i]['timetable'][j][k].roomid, offspring['data'][i]['timetable'][j][k].type, teacher_room_clash_map, room);
                        }
                        // newslottedtt = findNewSlot(offspring['data'][i]['timetable'], j, k, offspring['data'][i]['timetable'][j][k].teacherid, offspring['data'][i]['timetable'][j][k].roomid, offspring['data'][i]['timetable'][j][k].type, teacher_room_clash_map, room);
                        if (newslottedtt == null) {
                            if (showstats)
                                console.log("TraahiMaam TraahiMaam, PaahiMaam PaahiMaam Jagat-Srishti-Pralay Vishva, Sankat tav Naashitaam");
                            return false;
                        } else {
                            offspring['data'][i]['timetable'] = newslottedtt.timetable;
                            teacher_room_clash_map = newslottedtt.teacher_room_clash_map;
                        }
                    }
                    else {
                        teacher_room_clash_map[("teacher" + ";" + j + ";" + k + ";" + offspring['data'][i]['timetable'][j][k].teacherid)] = true;
                        teacher_room_clash_map[("room" + ";" + j + ";" + k + ";" + offspring['data'][i]['timetable'][j][k].roomid)] = true;
                    }
                }
            }
        }
    }
    return offspring;
};
// Function to perform crossover between two timetables (parents)
const crossover = (parent1, parent2, room) => {
    // Deep copy parent timetables to avoid modifying the original ones
    let offspring1 = JSON.parse(JSON.stringify(parent1));
    let offspring2 = JSON.parse(JSON.stringify(parent2));

    // Select a random crossover point (section, day, time slot)
    let crossoverPoint = Math.floor(Math.random() * offspring1['data'].length); // Cross over between sections

    // Perform crossover by swapping timetables after the crossover point
    for (let i = crossoverPoint; i < offspring1['data'].length; i++) {
        let teacher_room_clash_map = offspring1['data'][i].timetable;
        offspring1['data'][i].timetable = offspring2['data'][i].timetable;
        offspring2['data'][i].timetable = teacher_room_clash_map;
    }

    offspring1 = resolveConflicts(offspring1, room);
    offspring2 = resolveConflicts(offspring2, room);
    let res = [];
    if (offspring1 !== false) {
        res.push(offspring1);
    }
    if (offspring2 !== false) {
        res.push(offspring2);
    }
    return res;
};
const elitism = (population, eliteRate = 0.05) => {         // Default to 5% of the population
    const eliteCount = Math.ceil(population.length * eliteRate);
    return population.slice(0, eliteCount);  // Return the top elite individuals
};

const crossoverGeneration = (population, room) => {
    population = population.sort(function (a, b) { return b.fitness - a.fitness; });
    fitness_func_generation(population);
    for (let i = 0; i < population.length; i++) {
        // process.stdout.write(population[i].fitness + " ");
    }
    console.log();
    let eliteRate = config.eliteRate;

    let newGeneration = [];

    let elites = elitism(population, eliteRate);      // Perform elitism (preserve the best solutions)
    newGeneration.push(...elites);                      // Add the elites to the new generation (deep copy)

    let nonElites = population.slice(elites.length);
    let selectedForCrossover = population ; 
    let crossover_map = {};


    while (newGeneration.length < population.length) {
        let random1, random2;
        while (true) {
            random1 = Math.floor(Math.random() * selectedForCrossover.length);
            random2 = Math.floor(Math.random() * selectedForCrossover.length);
            if (random1 != random2 && !crossover_map[random1 + ";" + random2] && !crossover_map[random2 + ";" + random1]) {
                crossover_map[random1 + ";" + random2] = true;
                crossover_map[random2 + ";" + random1] = true;
                break;
            }
        }
        let parent1 = selectedForCrossover[random1];
        let parent2 = selectedForCrossover[random2];

        let child = crossover(parent1, parent2, room);
        newGeneration.push(...child);
        if (Object.keys(crossover_map).length >= (population.length * (population.length - 1) / 2)) {
            console.log("All possible crossovers have been done");
            break;
        }
    }
    if (newGeneration.length > population.length) {
        newGeneration = newGeneration.slice(0, population.length);
    }
    newGeneration = fitness_func_generation(newGeneration);

    newGeneration = newGeneration.sort(function (a, b) { return b.fitness - a.fitness; });
    for (let i = 0; i < newGeneration.length; i++) {
        // process.stdout.write(newGeneration[i].fitness + " ");
    }
    console.log();
    console.log(population.length, newGeneration.length);
    // Evaluate fitness of the new population
    if (config.showstats) {
        for (let i = 0; i < newGeneration.length; i++) {
            console.log("======== [ Validation : " + validate_timetable(newGeneration[i]) + " ] ========= [ Fitness : " + newGeneration[i]['fitness'] + " ] ==========");
        }
    }
    newGeneration = newGeneration.sort(function (a, b) { return b.fitness - a.fitness; });
    return newGeneration;
};

// Example usage:
let population = JSON.parse(fs.readFileSync('population_selected.json', 'utf8'));
let room = JSON.parse(fs.readFileSync('room.json', 'utf8'));
population = crossoverGeneration(population, room);         // Apply elitism and roulette selection to the population
// fs.writeFileSync('population_selected.json', JSON.stringify(population, null, 4), 'utf8');     // Save the new population
export default crossoverGeneration;