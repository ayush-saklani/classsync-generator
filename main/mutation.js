import fs from "fs";
import { fitness_func_generation } from "./fitness_func.js";
import validate_timetable from "./validate_timetable.js";
import config from "./config.js";
import teacher_room_clash_map_generator from "./teacher_room_clash_map_generator.js";
let showstats = true;
const check_teacher_overload = (
  j,
  k,
  teacherid,
  type,
  teacher_room_clash_map,
) => {
  let curr_index = k + 1;
  let streak = 1;
  if (type == "practical") {
    k++;
    streak++;
  }
  let local_stream = 0;
  while (curr_index <= 9) {
    let teacher_overload_checker =
      "teacher" + ";" + j + ";" + curr_index + ";" + teacherid;
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
    let teacher_overload_checker =
      "teacher" + ";" + j + ";" + curr_index + ";" + teacherid;
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
};
const mutate_Single_timetable = (
  timetable,
  day,
  slot,
  teacher_room_clash_map,
  room,
) => {
  let teacherid = timetable[day][slot].teacherid;
  let roomid = timetable[day][slot].roomid;
  let type = timetable[day][slot].type;

  let room_type = type === "practical" ? "lab" : "room";/// this is not correct and several room types are there
  let min = config.min;
  let max = config.max;
  let temp_total_forward = day * 10 + slot;
  let temp_total_backward = day * 10 + slot;
  let slotsubjectid = timetable[day][slot].subjectid;
  let slottype = timetable[day][slot].type;

  // Clear the current slot for the conflicting class
  if (
    timetable[day][slot].teacherid === teacherid &&
    timetable[day][slot].roomid === roomid
  ) {
    timetable[day][slot].teacherid = "";
    timetable[day][slot].roomid = "";
    timetable[day][slot].subjectid = "";
    timetable[day][slot].type = "";

    if (type === "practical") {
      if (
        slot < 9 &&
        timetable[day][slot + 1].teacherid === teacherid &&
        timetable[day][slot + 1].roomid === roomid
      ) {
        timetable[day][slot + 1].teacherid = "";
        timetable[day][slot + 1].roomid = "";
        timetable[day][slot + 1].subjectid = "";
        timetable[day][slot + 1].type = "";
      } else if (
        slot > 0 &&
        timetable[day][slot - 1].teacherid === teacherid &&
        timetable[day][slot - 1].roomid === roomid
      ) {
        timetable[day][slot - 1].teacherid = "";
        timetable[day][slot - 1].roomid = "";
        timetable[day][slot - 1].subjectid = "";
        timetable[day][slot - 1].type = "";
        temp_total_forward--;
        temp_total_backward--;
      }
    }
  }

  let slotmap = new Array(70).fill(false); // slotmap to keep track of the slots that are already assigned
  for (let i = max + 1; i < 70; i++) {
    slotmap[i] = true; // mark the slots that are not to be assigned
  }
  slotmap[temp_total_forward] = true;
  if (type === "practical") {
    slotmap[temp_total_forward + 1] = true;
  }

  while (true) {
    let temp_overall_slot;
    while (true) {
      temp_overall_slot = Math.floor(Math.random() * (max - min + 1)) + min;
      if (type === "practical" && temp_overall_slot % 2 == 0) {
        if (
          slotmap[temp_overall_slot] != true &&
          slotmap[temp_overall_slot + 1] != true
        ) {
          slotmap[temp_overall_slot] = true;
          slotmap[temp_overall_slot + 1] = true;
          break;
        } else {
          slotmap[temp_overall_slot] = true;
          slotmap[temp_overall_slot + 1] = true;
          continue;
        }
      } else if (type === "theory") {
        if (slotmap[temp_overall_slot] != true) {
          slotmap[temp_overall_slot] = true;
          break;
        } else {
          slotmap[temp_overall_slot] = true;
          continue;
        }
      }
      if (slotmap.every((slot) => slot)) {
        return null;
      }
    }
    let temp_day = Math.floor(temp_overall_slot / 10);
    let temp_slot = temp_overall_slot % 10;

    // Create conflict keys for forward and backward checking (teacher and room availability)
    let teacher_checker_forward =
      "teacher" + ";" + temp_day + ";" + temp_slot + ";" + teacherid;

    // For practical classes, also check the next slot
    let teacher_checker_forward_practical =
      "teacher" + ";" + temp_day + ";" + (temp_slot + 1) + ";" + teacherid;
    // Check forward for practical subjects
    if (
      type === "practical" &&
      temp_slot < 9 &&
      !teacher_room_clash_map[teacher_checker_forward] &&
      !teacher_room_clash_map[teacher_checker_forward_practical] &&
      timetable[temp_day][temp_slot].teacherid === "" &&
      timetable[temp_day][temp_slot + 1].teacherid === "" &&
      check_teacher_overload(
        temp_day,
        temp_slot,
        teacherid,
        type,
        teacher_room_clash_map,
      )
    ) {
      // Check room availability for the practical class in two consecutive slots
      if (showstats)
        process.stdout.write(
          "Slot : " + temp_day + " " + temp_slot + " || Room : ",
        );
      for (let i = 0; i < room[room_type].length; i++) {
        if (showstats) process.stdout.write(room[room_type][i].roomid + " ");

        let room_checker_forward = "room" + ";" + temp_day + ";" + temp_slot + ";" + room[room_type][i].roomid;
        let room_checker_forward_practical = "room" + ";" + temp_day + ";" + (temp_slot + 1) + ";" + room[room_type][i].roomid;

        if (
          !teacher_room_clash_map[room_checker_forward] &&
          !teacher_room_clash_map[room_checker_forward_practical]
        ) {
          // Assign the new slot to the practical class
          timetable[temp_day][temp_slot].teacherid = teacherid;
          timetable[temp_day][temp_slot + 1].teacherid = teacherid;
          timetable[temp_day][temp_slot].roomid = room[room_type][i].roomid;
          timetable[temp_day][temp_slot + 1].roomid = room[room_type][i].roomid;
          timetable[temp_day][temp_slot].subjectid = slotsubjectid;
          timetable[temp_day][temp_slot + 1].subjectid = slotsubjectid;
          timetable[temp_day][temp_slot].type = slottype;
          timetable[temp_day][temp_slot + 1].type = slottype;

          // Update the clash map
          teacher_room_clash_map[room_checker_forward] = true;
          teacher_room_clash_map[room_checker_forward_practical] = true;
          teacher_room_clash_map[teacher_checker_forward] = true;
          teacher_room_clash_map[teacher_checker_forward_practical] = true;
          if (showstats) {
            process.stdout.write(
              " || slot found at " + temp_day + " " + temp_slot,
            );
            console.log(
              "\n===================================================================",
            );
          }
          return { timetable, teacher_room_clash_map };
        }
      }
      if (showstats) process.stdout.write(" || NA\n");
    } else if (
      type === "theory" &&
      !teacher_room_clash_map[teacher_checker_forward] &&
      check_teacher_overload(
        temp_day,
        temp_slot,
        teacherid,
        type,
        teacher_room_clash_map,
      ) &&
      timetable[temp_day][temp_slot].teacherid === ""
    ) {
      if (showstats)
        process.stdout.write(
          "Slot : " + temp_day + " " + temp_slot + " || Room : ",
        );

      // Check room availability for theory class
      for (let i = 0; i < room[room_type].length; i++) {
        if (showstats) process.stdout.write(room[room_type][i].roomid + " ");

        let room_checker_forward = "room" + ";" + temp_day + ";" + temp_slot + ";" + room[room_type][i].roomid;

        if (!teacher_room_clash_map[room_checker_forward]) {
          // Assign the new slot to the theory class
          timetable[temp_day][temp_slot].teacherid = teacherid;
          timetable[temp_day][temp_slot].roomid = room[room_type][i].roomid;
          timetable[temp_day][temp_slot].subjectid = slotsubjectid;
          timetable[temp_day][temp_slot].type = slottype;

          // Update the clash map
          teacher_room_clash_map[room_checker_forward] = true;
          teacher_room_clash_map[teacher_checker_forward] = true;
          if (showstats) {
            process.stdout.write(
              " || slot found at " + temp_day + " " + temp_slot,
            );
            console.log("\n===================================================================",);
          }
          return { timetable, teacher_room_clash_map };
        }
      }
      if (showstats) process.stdout.write(" || NA\n");
    }
  }
  // If no free slot was found, return null
  return null;
};

const mutate_timtable_set = (timetableset, room, teacher_room_clash_map) => {
  let max = config.max;
  let mutationRate = config.mutationRate || 0.01;

  let number_of_gene_to_mutate = Math.ceil(
    timetableset["data"].length * mutationRate,
  );
  let rand_gene_index_map = {};

  while (number_of_gene_to_mutate > 0) {
    // Randomly decide whether to mutate this section based on the mutation rate
    let gene_index = 0;
    while (true) {
      gene_index = Math.floor(Math.random() * timetableset["data"].length);
      if (
        rand_gene_index_map[gene_index] == undefined ||
        rand_gene_index_map[gene_index] == false
      ) {
        rand_gene_index_map[gene_index] = true;
        break;
      }
    }

    let slotmap = new Array(70).fill(false); // slotmap to keep track of the slots that are already assigned
    for (let i = max + 1; i < 70; i++) {
      slotmap[i] = true; // mark the slots that are not to be assigned
    }

    let number_of_slots_to_mutate = Math.ceil(70 * mutationRate);
    while (number_of_slots_to_mutate > 0) {
      let randomDay, randomSlot;
      let mutating_timetable = timetableset["data"][gene_index]["timetable"];

      while (true) {
        randomDay = Math.floor(Math.random() * 7);
        randomSlot = Math.floor(Math.random() * 10);
        if (mutating_timetable[randomDay][randomSlot].teacherid == "") {
          slotmap[randomDay * 10 + randomSlot] = true;
        } else if (!slotmap[randomDay * 10 + randomSlot]) {
          slotmap[randomDay * 10 + randomSlot] = true;
          break;
        }
        if (slotmap.every((val) => val === true)) {
          return null;
        }
      }

      if (mutating_timetable[randomDay][randomSlot].type == "practical") {
        if (
          randomDay > 0 &&
          mutating_timetable[randomDay - 1][0] ==
          mutating_timetable[randomDay][randomSlot]
        ) {
          randomDay = randomDay - 1;
        } else if (
          randomSlot < 9 &&
          mutating_timetable[randomDay][randomSlot + 1] ==
          mutating_timetable[randomDay][randomSlot]
        ) {
        }
      }

      let mutated_timetable = mutate_Single_timetable(mutating_timetable, randomDay, randomSlot, teacher_room_clash_map, room,);
      if (mutated_timetable == null) {
        continue;
      } else {
        timetableset["data"][gene_index]["timetable"] =
          mutated_timetable.timetable;
        teacher_room_clash_map = mutated_timetable.teacher_room_clash_map;
        delete teacher_room_clash_map["teacher" + ";" + randomDay + ";" + randomSlot + ";" + mutated_timetable.timetable[randomDay][randomSlot].teacherid];
        delete teacher_room_clash_map["room" + ";" + randomDay + ";" + randomSlot + ";" + mutated_timetable.timetable[randomDay][randomSlot].roomid];
        if (
          mutated_timetable.timetable[randomDay][randomSlot].type == "practical"
        ) {
          delete teacher_room_clash_map["teacher" + ";" + randomDay + ";" + (randomSlot + 1) + ";" + mutated_timetable.timetable[randomDay][randomSlot + 1].teacherid];
          delete teacher_room_clash_map["room" + ";" + randomDay + ";" + (randomSlot + 1) + ";" + mutated_timetable.timetable[randomDay][randomSlot + 1].roomid];
        }
      }
      number_of_slots_to_mutate--;
    }
    number_of_gene_to_mutate--;
  }

  return timetableset;
};

const mutate_Generation = (population, room) => {
  let mutationRate = config.mutationRate;
  let number_of_genome_to_mutate = Math.ceil(population.length * mutationRate);
  let random_genome_index_map = {};
  while (number_of_genome_to_mutate > 0) {
    let genome_index;
    while (true) {
      genome_index = Math.floor(Math.random() * population.length);
      if (random_genome_index_map[genome_index] == undefined || random_genome_index_map[genome_index] == false) {
        random_genome_index_map[genome_index] = true;
        break;
      }
    }

    let teacher_room_clash_map = {}; // this should be clash free
    for (let i = 0; i < population[genome_index]["data"].length; i++) {
      for (let j = 0; j < 7; j++) {
        for (let k = 0; k < 10; k++) {
          let room_checker = "room" + ";" + j + ";" + k + ";" + population[genome_index]["data"][i]["timetable"][j][k].roomid;
          let teacher_checker = "teacher" + ";" + j + ";" + k + ";" + population[genome_index]["data"][i]["timetable"][j][k].teacherid;
          teacher_room_clash_map[room_checker] = true;
          teacher_room_clash_map[teacher_checker] = true;
        }
      }
    }
    let mutated_timetable_set = mutate_timtable_set(
      population[genome_index],
      room,
      teacher_room_clash_map,
    );
    if (mutated_timetable_set == null) {
      continue;
    } else {
      population[genome_index] = mutated_timetable_set;
    }
    number_of_genome_to_mutate--;
  }
  if (config.showstats) {
    for (let i = 0; i < population.length; i++) {
      console.log("======== [ Validation : " + validate_timetable(population[i]) + " ] ========= [ Fitness : " + population[i]["fitness"] + " ] ==========",);
    }
  }
  population = fitness_func_generation(population);
  population = population.sort(function (a, b) {
    return b.fitness - a.fitness;
  });
  return population;
};

export default mutate_Generation;

// let population = JSON.parse(fs.readFileSync('./JSON/population_selected.json', 'utf8'));
// population = teacher_room_clash_map_generator(population);
// let room = JSON.parse(fs.readFileSync('../JSON/classsync.converted.rooms.json', 'utf8'));
// population = mutate_Generation(population, room);  // Applying mutation with 1% probability
// population = teacher_room_clash_map_generator(population);

// fs.writeFileSync('./JSON/population_selected.json', JSON.stringify(population, null, 4), 'utf8');

