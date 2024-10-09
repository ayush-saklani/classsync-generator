import fs from 'fs'
import {fitness_func_generation} from './fitness_func.js';
import validate_timetable from './validate_timetable.js';
import config from './config.js';

const mutate_Single_Gene = (timetable, day, slot, teacherid, roomid, type, temp) => {
    let min = config.min, max = config.max;
    let temp_total_forward = (day * 10) + slot;
    let temp_total_backward = (day * 10) + slot;
    let slotsubjectid = timetable[day][slot].subjectid;
    let slottype = timetable[day][slot].type;
    if (timetable[day][slot].teacherid === teacherid && timetable[day][slot].roomid === roomid) {
        timetable[day][slot].teacherid = "";
        timetable[day][slot].roomid = "";
        timetable[day][slot].subjectid = "";
        timetable[day][slot].type = "";
        if (type === 'practical') {
            if (slot < 9 &&timetable[day][slot + 1].teacherid === teacherid && timetable[day][slot + 1].roomid === roomid) {
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
            temp_total_forward = temp_total_forward +2;
            temp_total_backward = temp_total_backward - 2;
            
            temp_total_forward = (temp_total_forward > 69) ? min : temp_total_forward;
            temp_total_backward = (temp_total_backward < 0) ? (max - 1): temp_total_backward;
        }
        else{
            temp_total_forward = temp_total_forward +1;
            temp_total_backward = temp_total_backward - 1;
            
            temp_total_forward = (temp_total_forward > 69) ? min : temp_total_forward;
            temp_total_backward = (temp_total_backward < 0) ? max: temp_total_backward;
        }
    }
    let flag1 = true, flag2 = true;

    while (flag1 || flag2) {
        let temp_day_forward = Math.floor(temp_total_forward / 10);
        let temp_slot_forward = temp_total_forward % 10;

        let temp_day_backward = Math.floor(temp_total_backward / 10);
        let temp_slot_backward = temp_total_backward % 10;


        // Create conflict keys for forward and backward checking
        let room_checker_forward = "class" + ";" + temp_day_forward + ";" + temp_slot_forward + ";" + roomid;
        let room_checker_backward = "class" + ";" + temp_day_backward + ";" + temp_slot_backward + ";" + roomid;
        let teacher_checker_forward = "teacher" + ";" + temp_day_forward + ";" + temp_slot_forward + ";" + teacherid;
        let teacher_checker_backward = "teacher" + ";" + temp_day_backward + ";" + temp_slot_backward + ";" + teacherid;

        let room_checker_forward_practical = "class" + ";" + temp_day_forward + ";" + (temp_slot_forward + 1) + ";" + roomid;
        let room_checker_backward_practical = "class" + ";" + temp_day_backward + ";" + (temp_slot_backward + 1) + ";" + roomid;
        let teacher_checker_forward_practical = "teacher" + ";" + temp_day_forward + ";" + (temp_slot_forward + 1) + ";" + teacherid;
        let teacher_checker_backward_practical = "teacher" + ";" + temp_day_backward + ";" + (temp_slot_backward + 1) + ";" + teacherid;
        // Check forward for practical subjects
        if (type === 'practical') {
            if (temp_slot_forward < 9 && (!temp[room_checker_forward] || true) && (!temp[room_checker_forward_practical] || true) &&
                (!temp[teacher_checker_forward] || true) && (!temp[teacher_checker_forward_practical] || true) &&
                timetable[temp_day_forward][temp_slot_forward].teacherid === "" &&
                timetable[temp_day_forward][temp_slot_forward + 1].teacherid === "" &&
                timetable[temp_day_forward][temp_slot_forward].roomid === "" &&
                timetable[temp_day_forward][temp_slot_forward + 1].roomid === "") {

                // Assign the new slot to the practical class
                timetable[temp_day_forward][temp_slot_forward].teacherid = teacherid;
                timetable[temp_day_forward][temp_slot_forward + 1].teacherid = teacherid;
                timetable[temp_day_forward][temp_slot_forward].roomid = roomid;
                timetable[temp_day_forward][temp_slot_forward + 1].roomid = roomid;
                timetable[temp_day_forward][temp_slot_forward].subjectid = slotsubjectid;
                timetable[temp_day_forward][temp_slot_forward + 1].subjectid = slotsubjectid;
                timetable[temp_day_forward][temp_slot_forward].type = slottype;
                timetable[temp_day_forward][temp_slot_forward + 1].type = slottype;
                temp[room_checker_forward] = true;
                temp[room_checker_forward_practical] = true;
                temp[teacher_checker_forward] = true;
                temp[teacher_checker_forward_practical] = true;
                return { timetable, temp };
            }
        } else {
            if ((!temp[room_checker_forward] || true) && (!temp[teacher_checker_forward] || true) &&
                timetable[temp_day_forward][temp_slot_forward].teacherid === "" &&
                timetable[temp_day_forward][temp_slot_forward].roomid === "") {

                // Assign the new slot to the non-practical class
                timetable[temp_day_forward][temp_slot_forward].teacherid = teacherid;
                timetable[temp_day_forward][temp_slot_forward].roomid = roomid;
                timetable[temp_day_forward][temp_slot_forward].subjectid = slotsubjectid;
                timetable[temp_day_forward][temp_slot_forward].type = slottype;
                temp[room_checker_forward] = true;
                temp[teacher_checker_forward] = true;
                return { timetable, temp };
            }
        }

        // Check backward for practical subjects
        if (type === 'practical') {
            if (temp_slot_backward < 9 && (!temp[room_checker_backward] || true) && (!temp[room_checker_backward_practical] || true) &&
                (!temp[teacher_checker_backward] || true) && (!temp[teacher_checker_backward_practical] || true) &&
                timetable[temp_day_backward][temp_slot_backward].teacherid === "" &&
                timetable[temp_day_backward][temp_slot_backward + 1].teacherid === "" &&
                timetable[temp_day_backward][temp_slot_backward].roomid === "" &&
                timetable[temp_day_backward][temp_slot_backward + 1].roomid === "") {

                // Assign the new slot to the practical class
                timetable[temp_day_backward][temp_slot_backward].teacherid = teacherid;
                timetable[temp_day_backward][temp_slot_backward + 1].teacherid = teacherid;
                timetable[temp_day_backward][temp_slot_backward].roomid = roomid;
                timetable[temp_day_backward][temp_slot_backward + 1].roomid = roomid;
                timetable[temp_day_backward][temp_slot_backward].subjectid = slotsubjectid;
                timetable[temp_day_backward][temp_slot_backward + 1].subjectid = slotsubjectid;
                timetable[temp_day_backward][temp_slot_backward].type = slottype;
                timetable[temp_day_backward][temp_slot_backward + 1].type = slottype;
                temp[room_checker_backward] = true;
                temp[room_checker_backward_practical] = true;
                temp[teacher_checker_backward] = true;
                temp[teacher_checker_backward_practical] = true;
                return { timetable, temp };
            }
        } else {
            if ((!temp[room_checker_backward] || true) && (!temp[teacher_checker_backward] || true) &&
                timetable[temp_day_backward][temp_slot_backward].teacherid === "" &&
                timetable[temp_day_backward][temp_slot_backward].roomid === "") {

                // Assign the new slot to the non-practical class
                timetable[temp_day_backward][temp_slot_backward].teacherid = teacherid;
                timetable[temp_day_backward][temp_slot_backward].roomid = roomid;
                timetable[temp_day_backward][temp_slot_backward].subjectid = slotsubjectid;
                timetable[temp_day_backward][temp_slot_backward].type = slottype;
                temp[room_checker_backward] = true;
                temp[teacher_checker_backward] = true;
                return { timetable, temp };
            }
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

    // If no free slot was found, return null (no free slot available)
    return null;
};

const mutate_Genome = (timetableset, room, mutationRate = 0.01, temp) => {
    let min = config.min;
    let max = config.max;

    let number_of_gene_to_mutate = Math.ceil(timetableset['data'].length * mutationRate);
    let rand_gene_index_map = {};
    console.log("Number of Genes to mutate: " + number_of_gene_to_mutate );
    while (number_of_gene_to_mutate > 0) {
        // Randomly decide whether to mutate this section based on the mutation rate
        let z;
        while (true) {
            z = Math.floor(Math.random() * timetableset['data'].length);
            if (rand_gene_index_map[z] == undefined || rand_gene_index_map[z] == false) {
                rand_gene_index_map[z] = true;
                break;
            }
        }
        console.log("Currently Mutating gene: " + (z + 1));
        let slotmap = new Array(70).fill(false);
        for (let i = max + 1; i < 70; i++) {
            slotmap[i] = true;                                                      // mark the slots that are not to be assigned
        }
        let number_of_slots_to_mutate = Math.ceil(70 * mutationRate);
        while (number_of_slots_to_mutate > 0) {
            // Get the timetable for this section
            let randomDay, randomSlot;
            let mutating_timetable = timetableset['data'][0]['timetable'];
            // let mutating_timetable = timetableset['data'][z]['timetable'];

            while (true) {
                randomDay = Math.floor(Math.random() * 7);
                randomSlot = Math.floor(Math.random() * 10);
                if(timetableset['data'][z]['timetable'][randomDay][randomSlot].teacherid == "") {
                    slotmap[((randomDay * 10) + randomSlot)] = true;
                }
                else if (!slotmap[((randomDay * 10) + randomSlot)]) {
                    
                    slotmap[((randomDay * 10) + randomSlot)] = true;
                    break;
                }
            }
            
            if (mutating_timetable[randomDay][randomSlot].type == 'practical') {
                if (randomDay > 0 && mutating_timetable[randomDay - 1][0] == mutating_timetable[randomDay][randomSlot]) {
                    randomDay = randomDay - 1;
                }
                if (randomSlot < 9 && mutating_timetable[randomDay][randomSlot + 1] == mutating_timetable[randomDay][randomSlot]) {
                }
            }
            timetableset['data'][z]['timetable'] = mutate_Single_Gene(mutating_timetable, randomDay, randomSlot, mutating_timetable[randomDay][randomSlot].teacherid, mutating_timetable[randomDay][randomSlot].roomid, mutating_timetable[randomDay][randomSlot].type, temp).timetable;
            number_of_slots_to_mutate--;
        }
        number_of_gene_to_mutate--;
    }

    return timetableset;
};

const mutate_Population = (population, room) => {
    let mutationRate = config.mutationRate;
    let number_of_genome_to_mutate = Math.ceil(population.length * mutationRate);
    let rand_tt_index_map = {};
    console.log("Number of Genomes to mutate: " + number_of_genome_to_mutate);
    while (number_of_genome_to_mutate > 0) {
        // Randomly decide whether to mutate this section based on the mutation rate
        let z;
        while (true) {
            z = Math.floor(Math.random() * population.length);
            if (rand_tt_index_map[z] == undefined || rand_tt_index_map[z] == false) {
                rand_tt_index_map[z] = true;
                break;
            }
        }
        console.log("Currently Mutating genome: " + (z + 1));
        let temp = {};
        for (let i = 0; i < population[z]['data'].length; i++) {
            for (let j = 0; j < 7; j++) {
                for (let k = 0; k < 10; k++) {
                    let room_checker = "class" + ";" + j + ";" + k + ";" + population[z]['data'][i]['timetable'][j][k].roomid;
                    let teacher_checker = "teacher" + ";" + j + ";" + k + ";" + population[z]['data'][i]['timetable'][j][k].teacherid;
                    temp[room_checker] = true;
                    temp[teacher_checker] = true;
                }
            }
        }
        population[z] = mutate_Genome(population[z], room, mutationRate, temp);
        number_of_genome_to_mutate--;
    }
    if (config.showstats) {
        for (let i = 0; i < population.length; i++) {
            console.log("======== [ Validation : " + validate_timetable(population[i]) + " ] ========= [ Fitness : " + population[i]['fitness'] + " ] ==========");
        }
    }
    population = fitness_func_generation(population);
    population = population.sort(function (a, b) { return b.fitness - a.fitness; });
    return population;
};

export default mutate_Population;


// let population = JSON.parse(fs.readFileSync('population_selected.json', 'utf8'));
// let room = JSON.parse(fs.readFileSync('room.json', 'utf8'));
// population = mutate_Population(population, room);  // Applying mutation with 1% probability
// fs.writeFileSync('population_selected.json', JSON.stringify(population, null, 4), 'utf8');