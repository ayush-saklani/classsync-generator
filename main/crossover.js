import fs from "fs";
import { fitness_func_generation } from "./fitness_func.js";
import validate_timetable from "./validate_timetable.js";
import config from "./config.js";
import teacher_room_clash_map_generator from "./teacher_room_clash_map_generator.js";
let showstats = config.showstats;
// practical merger changes are done here ig (tested)

const check_teacher_overload = (j, k, teacherid, type, teacher_room_clash_map,) => {
  let curr_index = k + 1;
  let streak = 1;
  if (type == "practical") {
    k++;
    streak++;
  }
  let local_stream = 0;
  while (curr_index <= 9) {
    let teacher_overload_checker = "teacher" + ";" + j + ";" + curr_index + ";" + teacherid;
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
    let teacher_overload_checker = "teacher" + ";" + j + ";" + curr_index + ";" + teacherid;
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
const find_new_slot_or_room = (timetable, day, slot, teacherid, roomid, type, teacher_room_clash_map, room, teacher_subject_data) => {
  if (showstats) {
    console.log("\n============= " + type + "\t || Initial slot : " + day + " " + slot + " ====================",);
  }
  let room_type = type === "practical" ? "lab" : "room"; /// there are several types of rooms, so we need to check the type of room required
  room_type = teacher_subject_data.find((subject) => subject.subjectid === timetable[day][slot].subjectid).room_type // get the room type from the subject data
  let min = config.min, max = config.max;
  let temp_total_forward = day * 10 + slot;
  let temp_total_backward = day * 10 + slot;
  let slotsubjectid = timetable[day][slot].subjectid;
  let slottype = timetable[day][slot].type;

  const merge_teachers = teacher_subject_data.find(sub => sub.subjectid === slotsubjectid).merge_teachers;

  // Clear the current slot for the conflicting class
  if (timetable[day][slot].teacherid === teacherid && timetable[day][slot].roomid === roomid) {
    timetable[day][slot].teacherid = "";
    timetable[day][slot].roomid = "";
    timetable[day][slot].subjectid = "";
    timetable[day][slot].type = "";

    if (type === "practical") {
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
    if (type === "practical" && temp_slot_forward < 9 && !teacher_room_clash_map[teacher_checker_forward] && !teacher_room_clash_map[teacher_checker_forward_practical] && timetable[temp_day_forward][temp_slot_forward].teacherid === "" && timetable[temp_day_forward][temp_slot_forward + 1].teacherid === "" && check_teacher_overload(temp_day_forward, temp_slot_forward, teacherid, type, teacher_room_clash_map,)) {
      if (merge_teachers && merge_teachers.length > 0) {        // Check all merged teachers for conflict
        const anyClash = merge_teachers.some(tid =>
          teacher_room_clash_map[`teacher;${temp_day_forward};${temp_slot_forward};${tid}`] ||
          teacher_room_clash_map[`teacher;${temp_day_forward};${temp_slot_forward + 1};${tid}`]
        );
        if (anyClash) {
          if (showstats) {
            console.log(`Merge teacher clash at ${temp_day_forward}, ${temp_slot_forward}`);
          }
          temp_total_forward += 2;
          continue;
        }
      }

      // Check room availability for the practical class in two consecutive slots
      if (showstats)
        process.stdout.write("Slot : " + temp_day_forward + " " + temp_slot_forward + " || Room : ",);
      for (let i = 0; i < room[room_type].length; i++) {
        if (showstats) process.stdout.write(room[room_type][i].roomid + " ");

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

          if (merge_teachers && merge_teachers.length > 0) {  // mark merged teachers in the clash map
            for (let l = 0; l < merge_teachers.length; l++) {
              teacher_room_clash_map[`teacher;${temp_day_forward};${temp_slot_forward};${merge_teachers[l]}`] = true;
              teacher_room_clash_map[`teacher;${temp_day_forward};${temp_slot_forward + 1};${merge_teachers[l]}`] = true;
            }
          }

          if (showstats) {
            process.stdout.write(" || slot found at " + temp_day_forward + " " + temp_slot_forward,);
            console.log("\n===================================================================",);
          }
          return { timetable, teacher_room_clash_map };
        }
      }
      if (showstats) process.stdout.write(" || NA\n");
    } else if (type === "theory" && !teacher_room_clash_map[teacher_checker_forward] && check_teacher_overload(temp_day_forward, temp_slot_forward, teacherid, type, teacher_room_clash_map,) && timetable[temp_day_forward][temp_slot_forward].teacherid === "") {
      if (showstats)
        process.stdout.write("Slot : " + temp_day_forward + " " + temp_slot_forward + " || Room : ",);

      // Check room availability for theory class
      for (let i = 0; i < room[room_type].length; i++) {
        if (showstats) process.stdout.write(room[room_type][i].roomid + " ");

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
            process.stdout.write(" || slot found at " + temp_day_forward + " " + temp_slot_forward,);
            console.log("\n===================================================================",);
          }
          return { timetable, teacher_room_clash_map };
        }
      }
      if (showstats) process.stdout.write(" || NA\n");
    }

    // Check backward for practical subjects
    if (type === "practical" && temp_slot_backward < 9 && !teacher_room_clash_map[teacher_checker_backward] && !teacher_room_clash_map[teacher_checker_backward_practical] && timetable[temp_day_backward][temp_slot_backward].teacherid === "" && timetable[temp_day_backward][temp_slot_backward + 1].teacherid === "" && check_teacher_overload(temp_day_forward, temp_slot_forward, teacherid, type, teacher_room_clash_map,)) {
      if (merge_teachers && merge_teachers.length > 0) { // check all merged teachers for conflict
        const anyClash = merge_teachers.some(tid =>
          teacher_room_clash_map[`teacher;${temp_day_backward};${temp_slot_backward};${tid}`] ||
          teacher_room_clash_map[`teacher;${temp_day_backward};${temp_slot_backward + 1};${tid}`]
        );
        if (anyClash) {
          if (showstats) {
            console.log(`Merge teacher clash at ${temp_day_backward}, ${temp_slot_backward}`);
          }
          temp_total_backward -= 2;
          continue;
        }
      }

      if (showstats)
        process.stdout.write("Slot : " + temp_day_backward + " " + temp_slot_backward + " || Room : ",);
      for (let i = 0; i < room[room_type].length; i++) {
        if (showstats) process.stdout.write(room[room_type][i].roomid + " ");

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

          if (merge_teachers && merge_teachers.length > 0) {  // mark merged teachers in the clash map
            for (let l = 0; l < merge_teachers.length; l++) {
              teacher_room_clash_map[`teacher;${temp_day_backward};${temp_slot_backward};${merge_teachers[l]}`] = true;
              teacher_room_clash_map[`teacher;${temp_day_backward};${temp_slot_backward + 1};${merge_teachers[l]}`] = true;
            }
          }

          if (showstats) {
            process.stdout.write(" || slot found at " + temp_day_backward + " " + temp_slot_backward,);
            console.log("\n===================================================================",);
          }
          return { timetable, teacher_room_clash_map };
        }
      }
      if (showstats) process.stdout.write(" || NA\n");
    } else if (type === "theory" && !teacher_room_clash_map[teacher_checker_backward] && check_teacher_overload(temp_day_forward, temp_slot_forward, teacherid, type, teacher_room_clash_map,) && timetable[temp_day_backward][temp_slot_backward].teacherid === "") {
      if (showstats)
        process.stdout.write("Slot : " + temp_day_backward + " " + temp_slot_backward + " || Room : ",);
      // Check room availability for theory class
      for (let i = 0; i < room[room_type].length; i++) {
        if (showstats) process.stdout.write(room[room_type][i].roomid + " ");

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
            process.stdout.write(" || slot found at " + temp_day_backward + " " + temp_slot_backward,);
            console.log("\n===================================================================",);
          }
          return { timetable, teacher_room_clash_map };
        }
      }
      if (showstats) process.stdout.write(" || NA\n");
    }

    // Move forward and backward in time
    temp_total_forward++;
    temp_total_backward--;
    if (type === "practical") {
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
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<       >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",);
    console.log("===================================================================",);
  }
  // If no free slot was found, return null
  return null;
};

const check_merge_teacher = (timetable_set, teacher_room_clash_map) => {
  let joint_teacher_set = timetable_set["data"][i].subjects.find((subject) => subject.subjectid === timetable_set["data"][i]["timetable"][j][k].subjectid).merge_teachers;
  for (let l = 0; l < joint_teacher_set.length; l++) {
    if (teacher_room_clash_map["teacher" + ";" + j + ";" + k + ";" + joint_teacher_set[l]]) {
      return false; // If any joint teacher is already assigned in the same slot, return false
    }
  }
  return true; // If no joint teacher is assigned in the same slot, return true
}
// Function to resolve conflicts (teacher/room clashes) in a timetable
const resolveConflicts = (timetable_set, room) => {
  let teacher_room_clash_map = {};
  for (let i = 0; i < timetable_set["data"].length; i++) {
    for (let j = 0; j < 7; j++) {
      for (let k = 0; k < 10; k++) {
        if (timetable_set["data"][i]["timetable"][j][k].teacherid == "" && timetable_set["data"][i]["timetable"][j][k].roomid == "") {
          continue;          // if class is empty, skip it
        } else if (timetable_set["data"][i]["timetable"][j][k].teacherid && timetable_set["data"][i]["timetable"][j][k].roomid) {
          if (timetable_set["data"][i].joint && timetable_set["data"][i]["timetable"][j][k].type === "practical") {
            if (!check_merge_teacher(timetable_set, teacher_room_clash_map)) {
              let newslottedtt;
              if (k < 9 && timetable_set["data"][i]["timetable"][j][k + 1].subjectid === timetable_set["data"][i]["timetable"][j][k].subjectid) {
                newslottedtt = find_new_slot_or_room(timetable_set["data"][i]["timetable"], j, k, timetable_set["data"][i]["timetable"][j][k].teacherid, timetable_set["data"][i]["timetable"][j][k].roomid, timetable_set["data"][i]["timetable"][j][k].type, teacher_room_clash_map, room, timetable_set['data'][i].subjects);
              } else if (k > 0 && timetable_set["data"][i]["timetable"][j][k - 1].subjectid === timetable_set["data"][i]["timetable"][j][k].subjectid) {
                newslottedtt = find_new_slot_or_room(timetable_set["data"][i]["timetable"], j, k - 1, timetable_set["data"][i]["timetable"][j][k].teacherid, timetable_set["data"][i]["timetable"][j][k].roomid, timetable_set["data"][i]["timetable"][j][k].type, teacher_room_clash_map, room, timetable_set['data'][i].subjects);
              }
              if (newslottedtt == null) {
                if (showstats) console.log("TraahiMaam TraahiMaam, PaahiMaam PaahiMaam Jagat-Srishti-Pralay Vishva, Sankat tav Naashitaam",);
                return false;
              } else {
                timetable_set["data"][i]["timetable"] = newslottedtt.timetable;
                teacher_room_clash_map = newslottedtt.teacher_room_clash_map;
              }
            } else {
              let joint_teacher_set = timetable_set["data"][i].subjects.find((subject) => subject.subjectid === timetable_set["data"][i]["timetable"][j][k].subjectid).merge_teachers;
              for (let l = 0; l < joint_teacher_set.length; l++) {
                teacher_room_clash_map["teacher" + ";" + j + ";" + k + ";" + joint_teacher_set[l]] = true;
              }
              teacher_room_clash_map["room" + ";" + j + ";" + k + ";" + timetable_set["data"][i]["timetable"][j][k].roomid] = true;
            }
          }
          else if (teacher_room_clash_map["teacher" + ";" + j + ";" + k + ";" + timetable_set["data"][i]["timetable"][j][k].teacherid] || teacher_room_clash_map["room" + ";" + j + ";" + k + ";" + timetable_set["data"][i]["timetable"][j][k].roomid]) {
            let newslottedtt;
            if (timetable_set["data"][i]["timetable"][j][k].type === "practical" && k < 9 && timetable_set["data"][i]["timetable"][j][k + 1].teacherid === timetable_set["data"][i]["timetable"][j][k].teacherid) {
              newslottedtt = find_new_slot_or_room(timetable_set["data"][i]["timetable"], j, k, timetable_set["data"][i]["timetable"][j][k].teacherid, timetable_set["data"][i]["timetable"][j][k].roomid, timetable_set["data"][i]["timetable"][j][k].type, teacher_room_clash_map, room, timetable_set['data'][i].subjects);
            } else if (timetable_set["data"][i]["timetable"][j][k].type === "practical" && k > 0 && timetable_set["data"][i]["timetable"][j][k - 1].teacherid === timetable_set["data"][i]["timetable"][j][k].teacherid) {
              newslottedtt = find_new_slot_or_room(timetable_set["data"][i]["timetable"], j, k - 1, timetable_set["data"][i]["timetable"][j][k].teacherid, timetable_set["data"][i]["timetable"][j][k].roomid, timetable_set["data"][i]["timetable"][j][k].type, teacher_room_clash_map, room, timetable_set['data'][i].subjects);
            } else {
              newslottedtt = find_new_slot_or_room(timetable_set["data"][i]["timetable"], j, k, timetable_set["data"][i]["timetable"][j][k].teacherid, timetable_set["data"][i]["timetable"][j][k].roomid, timetable_set["data"][i]["timetable"][j][k].type, teacher_room_clash_map, room, timetable_set['data'][i].subjects);
            }
            // newslottedtt = find_new_slot_or_room(timetable_set['data'][i]['timetable'], j, k, timetable_set['data'][i]['timetable'][j][k].teacherid, timetable_set['data'][i]['timetable'][j][k].roomid, timetable_set['data'][i]['timetable'][j][k].type, teacher_room_clash_map, room);
            if (newslottedtt == null) {
              if (showstats)
                console.log("TraahiMaam TraahiMaam, PaahiMaam PaahiMaam Jagat-Srishti-Pralay Vishva, Sankat tav Naashitaam",);
              return false;
            } else {
              timetable_set["data"][i]["timetable"] = newslottedtt.timetable;
              teacher_room_clash_map = newslottedtt.teacher_room_clash_map;
            }
          } else {
            teacher_room_clash_map["teacher" + ";" + j + ";" + k + ";" + timetable_set["data"][i]["timetable"][j][k].teacherid] = true;
            teacher_room_clash_map["room" + ";" + j + ";" + k + ";" + timetable_set["data"][i]["timetable"][j][k].roomid] = true;
          }
        }
      }
    }
  }
  return timetable_set;
};
// Function to perform crossover between two timetables (parents)
const crossover = (parent1, parent2, room) => {
  // Deep copy parent timetables to avoid modifying the original ones
  let Timetable_set_1 = JSON.parse(JSON.stringify(parent1));
  let Timetable_set_2 = JSON.parse(JSON.stringify(parent2));

  // Select a random crossover point (section, day, time slot)
  let crossoverPoint = Math.floor(Math.random() * Timetable_set_1["data"].length); // Cross over between sections

  // Perform crossover by swapping timetables after the crossover point
  for (let i = crossoverPoint; i < Timetable_set_1["data"].length; i++) {
    let placeholdervar = Timetable_set_1["data"][i]
    Timetable_set_1["data"][i] = Timetable_set_2["data"][i]
    Timetable_set_2["data"][i] = placeholdervar;
  }

  Timetable_set_1 = resolveConflicts(Timetable_set_1, room);
  Timetable_set_2 = resolveConflicts(Timetable_set_2, room);
  let res = [];
  if (Timetable_set_1 !== false) {
    res.push(Timetable_set_1);
  }
  if (Timetable_set_2 !== false) {
    res.push(Timetable_set_2);
  }
  return res;
};

const crossoverGeneration = (population, room) => {
  population = fitness_func_generation(population);
  population.sort(function (a, b) { return b.fitness - a.fitness; });     // Sort population by fitness score (descending order)
  let newGeneration = [];

  const eliteCount = Math.ceil(population.length * config.eliteRate);
  let elites = JSON.parse(JSON.stringify(population.slice(0, eliteCount))); // Deep copy the top N
  let nonElites = JSON.parse(JSON.stringify(population.slice(eliteCount))); // Deep copy the bottom N

  let selectedForCrossover = population;
  let crossover_map = {};         // Map to keep track of crossover pairs
  newGeneration.push(...elites); // Add the elites to the new generation (deep copy)

  while (newGeneration.length < population.length) {
    let random1, random2;
    while (true) {        // check for unique random pairs of timetables for crossover
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
    if (Object.keys(crossover_map).length >= (population.length * (population.length - 1)) / 2) {
      console.log("All possible crossovers have been done");
      break;
    }
  }
  newGeneration = newGeneration.sort(function (a, b) { return b.fitness - a.fitness; });
  if (newGeneration.length > population.length) {
    newGeneration = newGeneration.slice(0, population.length);
  } else if (newGeneration.length == eliteCount) {
    // *************************** Logic Missing here ***************************
    // generate new random timetables to fill the population as the crossover did not generate enough timetables and
    // old population will generate the same results again and again if we keep using the same population
    console.log("Population size is less than expected after crossover logic to handle this is missing",);
  } else if (newGeneration.length < population.length) {
    console.log("Population size is less than expected after crossover");
    newGeneration.push(...nonElites.slice(0, population.length - newGeneration.length),);
  }
  newGeneration = fitness_func_generation(newGeneration);
  newGeneration = teacher_room_clash_map_generator(newGeneration, (showstats = false),);
  newGeneration = newGeneration.sort(function (a, b) { return b.fitness - a.fitness; });
  // console.log(population.length, newGeneration.length);

  if (config.showstats) {
    for (let i = 0; i < newGeneration.length; i++) {
      console.log("======== [ Validation : " + validate_timetable(newGeneration[i]) + " ] ========= [ Fitness : " + newGeneration[i]["fitness"] + " ] ==========");
    }
  }
  return newGeneration;
};

export default crossoverGeneration;

// Example usage:
// let population = JSON.parse(fs.readFileSync('./JSON/population_selected.json', 'utf8'));
// let room = JSON.parse(fs.readFileSync('../JSON/classsync.converted.rooms.json', 'utf8'));
// population = crossoverGeneration(population, room);         // Apply elitism and roulette selection to the population
// fs.writeFileSync('./JSON/population_selected.json', JSON.stringify(population, null, 4), 'utf8');     // Save the new population

