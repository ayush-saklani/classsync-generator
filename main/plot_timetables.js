import fs from "fs";
import validate_timetable_set from "./validate_timetable.js";
import { fitness_func } from "./fitness_func.js";
import config from "./config.js";
// practical merger changes are done here ig (tested)

//  structure of timetable as template
let timetablestructure = [
  [
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
  ],
  [
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
  ],
  [
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
  ],
  [
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
  ],
  [
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
  ],
  [
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
  ],
  [
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
    { roomid: "", teacherid: "", subjectid: "", type: "" },
  ],
];

//  this function will validate the slot of timetable and flag out the room and teacher conflicts from that batch of timetables
const validate_timetable_slot = (j, k, teacherid, roomid, type, teacher_overload_map, room_overload_map, merge_teachers = [], room, room_type) => {
  if (type == "practical" && k % 2 !== 0) return false;
  if (teacher_overload_map[`teacher;${j};${k};${teacherid}`] || room_overload_map[`room;${j};${k};${roomid}`]) {
    return false;
  }
  if (type == "practical" && (teacher_overload_map[`teacher;${j};${k + 1};${teacherid}`] == true || room_overload_map[`room;${j};${k + 1};${roomid}`] == true)) {
    return false;
  }
  if (merge_teachers.length > 0) {
    for (let itr = 0; itr < merge_teachers.length; itr++) {
      if (
        teacher_overload_map[`teacher;${j};${k};${merge_teachers[itr]}`] == true ||
        teacher_overload_map[`teacher;${j};${k + 1};${merge_teachers[itr]}`] == true
      ) {
        return false;
      }
    }
    let count = 0;
    for (let itr = 0; itr < room[room_type].length; itr++) {
      if (!room_overload_map[`room;${j};${k};${room[room_type][itr].roomid}`] == true) {
        count++;
      }
    }
    if (count < merge_teachers.length) {
      return false;
    }
  }
  return true;
};
// this function will prevent the teacher to teach in multiple slots in a day
const validate_multiple_slot_in_a_day = (timetable, j, k, teacherid, roomid, subjectid, type,) => {
  // this function will prevent the teacher to teach in multiple slots in a day
  let map = {};
  for (let i = 0; i < 10; i++) {
    if (timetable[j][i].teacherid == "" || timetable[j][i].roomid == "")
      continue;
    map["subjectid" + ";" + j + ";" + i + ";" + timetable[j][i].subjectid] = true;
  }
  if (map["subjectid" + ";" + j + ";" + k + ";" + subjectid]) {
    return false;
  } else {
    return true;
  }
};
const check_teacher_overload = (j, k, teacherid, type, teacher_overload_map, merge_teachers = []) => {
  const teacherids = [teacherid, ...merge_teachers];
  for (const tid of teacherids) {
    if (type == "practical" && k % 2 !== 0) return false;
    let curr_index = type == "practical" ? k + 2 : k + 1;
    let streak = type == "practical" ? 2 : 1;
    let local_stream = 0;
    while (curr_index <= 9) {
      let teacher_overload_checker = `teacher;${j};${curr_index};${tid}`;
      if (teacher_overload_map[teacher_overload_checker] == true) {
        local_stream++;
      } else {
        break;
      }
      curr_index++;
    }
    streak += local_stream;
    local_stream = 0;

    curr_index = k - 1;
    while (curr_index >= 0) {
      let teacher_overload_checker = `teacher;${j};${curr_index};${tid}`;
      if (teacher_overload_map[teacher_overload_checker] == true) {
        local_stream++;
      } else {
        break;
      }
      curr_index--;
    }
    streak += local_stream;
    if (streak > config.max_streak) return false;
  }
  return true;
};
const initialize_gene = (alltimetable, room) => {
  let max = config.max;
  let min = config.min;
  let flag = 0; // flag to check the number of conflicts in the timetable generation
  let number_of_sections = alltimetable["data"].length;
  let teacher_overload_map = {};
  let room_overload_map = {};
  for (let i = 0; i < number_of_sections; i++) {
    let subjects = JSON.parse(JSON.stringify(alltimetable["data"][i].subjects)); // deep copy of subjects
    subjects = subjects.sort((a, b) => a.type.localeCompare(b.type));
    let timetable = JSON.parse(JSON.stringify(timetablestructure)); // deep copy of timetablestructure

    let slotmap = new Array(70).fill(false); // slotmap to keep track of the slots that are already assigned
    for (let i = max + 1; i < 70; i++) {
      slotmap[i] = true; // mark the slots that are not to be assigned
    }

    while (subjects.length > 0) {
      // loop until all subjects are assigned
      let temp_subject_index = Math.floor(Math.random() * subjects.length); // randomly choose subject
      temp_subject_index = 0;

      let room_type = subjects[temp_subject_index].room_type; // get the room type from subject

      let temp_room_index = Math.floor(Math.random() * room[room_type].length); // randomly choose room

      if (subjects[temp_subject_index] && room[room_type][temp_room_index]) {
        let temp, temp_day, temp_slot;
        while (true) {
          temp = Math.floor(Math.random() * (max - min + 1)) + min; // randomly choose slot between min and max (inclusive)
          temp_day = Math.floor(temp / 10); // get the day from slot
          temp_slot = Math.floor(temp % 10); // get the slot from slot

          if (subjects[temp_subject_index].type == "practical" && temp_slot % 2 != 0) {
            temp_slot == 9 ? temp_slot-- : temp_slot++; // if slot is odd then make it even
            temp = temp_day * 10 + temp_slot;
          }
          if (slotmap[temp] != true) {
            break;
          }
          if (slotmap.every((slot) => slot)) {
            return null;
          }
        }

        if (timetable[temp_day][temp_slot].teacherid == "" && timetable[temp_day][temp_slot].roomid == "") {
          // if slot is empty only then assign the subject to that slot

          //if validation in slot is true then assign the subject to that slot
          if (
            validate_timetable_slot(temp_day, temp_slot, subjects[temp_subject_index].teacherid, room[room_type][temp_room_index].roomid, subjects[temp_subject_index].type, teacher_overload_map, room_overload_map, subjects[temp_subject_index].merge_teachers, room, room_type)
          ) {
            if (
              check_teacher_overload(temp_day, temp_slot, subjects[temp_subject_index].teacherid, subjects[temp_subject_index].type, teacher_overload_map, subjects[temp_subject_index].merge_teachers)
            ) {
              // if validation in a day is true then assign the subject to that slot (this will prevent the teacher to teach in multiple slots in a day)
              if (validate_multiple_slot_in_a_day(timetable, temp_day, temp_slot, subjects[temp_subject_index].teacherid, room[room_type][temp_room_index].roomid, subjects[temp_subject_index].subjectid, subjects[temp_subject_index].type,)) {
                timetable[temp_day][temp_slot].teacherid = subjects[temp_subject_index].teacherid;
                timetable[temp_day][temp_slot].roomid = room[room_type][temp_room_index].roomid;
                timetable[temp_day][temp_slot].subjectid = subjects[temp_subject_index].subjectid;
                timetable[temp_day][temp_slot].type = subjects[temp_subject_index].type;
                slotmap[temp_day * 10 + temp_slot] = true; // mark the slot as assigned
                teacher_overload_map["teacher" + ";" + temp_day + ";" + temp_slot + ";" + timetable[temp_day][temp_slot].teacherid] = true;
                room_overload_map["room" + ";" + temp_day + ";" + temp_slot + ";" + room[room_type][temp_room_index].roomid] = true;
                if (subjects[temp_subject_index].merge_teachers.length > 0) {
                  for (let itr = 0; itr < subjects[temp_subject_index].merge_teachers; itr++) {
                    teacher_overload_map["teacher" + ";" + temp_day + ";" + temp_slot + ";" + subjects[temp_subject_index].merge_teachers[itr]] = true;
                  }
                }

                // if subject is practical then assign the next slot to the teacher and room as well (this is for practical subjects)
                // the practical subjects are assigned in even slots only because the odd slots are best suited as they fit better
                // and practical subjects are assigned first so that the clashes can be minimized
                if (subjects[temp_subject_index].type == "practical") {
                  timetable[temp_day][temp_slot + 1].teacherid = subjects[temp_subject_index].teacherid;
                  timetable[temp_day][temp_slot + 1].roomid = room[room_type][temp_room_index].roomid;
                  timetable[temp_day][temp_slot + 1].subjectid = subjects[temp_subject_index].subjectid;
                  timetable[temp_day][temp_slot + 1].type = subjects[temp_subject_index].type;
                  subjects[temp_subject_index].weekly_hrs--;
                  slotmap[temp_day * 10 + (temp_slot + 1)] = true; // mark the slot as assigned
                  teacher_overload_map["teacher" + ";" + temp_day + ";" + (temp_slot + 1) + ";" + timetable[temp_day][temp_slot].teacherid] = true;
                  room_overload_map["room" + ";" + temp_day + ";" + (temp_slot + 1) + ";" + room[room_type][temp_room_index].roomid] = true;
                  if (subjects[temp_subject_index].merge_teachers.length > 0) {
                    // console.log("Practical subject with merge teachers found.");
                    for (let itr = 0; itr < subjects[temp_subject_index].merge_teachers; itr++) {
                      teacher_overload_map["teacher" + ";" + temp_day + ";" + (temp_slot + 1) + ";" + subjects[temp_subject_index].merge_teachers[itr]] = true;
                    }
                  }
                }

                subjects[temp_subject_index].weekly_hrs--;
                if (subjects[temp_subject_index].weekly_hrs == 0) {
                  subjects.splice(temp_subject_index, 1); // remove subject from list and
                }

                if (room[room_type][temp_room_index].capacity == 0) {
                  room[room_type].splice(temp_room_index, 1); // remove room from list (currently not implemented) due to above reason
                }
              } else {
                flag++;
                if (flag > 30000) {
                  console.log("Too many conflicts for section " + i + ". Resetting timetable.",);
                  return null;
                }
              }
            } else {
              flag++;
              if (flag > 30000) {
                console.log("Too many conflicts for section " + i + ". Resetting timetable.",);
                return null;
              }
            }
          } else {
            flag++;
            if (flag > 30000) {
              console.log("Too many conflicts for section " + i + ". Resetting timetable.",);
              return null;
            }
          }
        }
      }
    }
    alltimetable["data"][i].timetable = timetable;
    flag = 0;
  }
  alltimetable = fitness_func(alltimetable);
  if (config.showstats) {
    console.log("======== [ Validation : " + validate_timetable_set(alltimetable) + " ] ========= [ Fitness : " + alltimetable["fitness"] + " ] ==========",);
  }

  return alltimetable;
};

export default initialize_gene;

// let alltimetable = JSON.parse(fs.readFileSync('../JSON/classsync.converted.tables.json', 'utf8'));
// let room = JSON.parse(fs.readFileSync('../JSON/classsync.converted.rooms.json', 'utf8'));
// fs.writeFileSync('data2.json', JSON.stringify(initialize_gene(alltimetable, room), null, 4), 'utf8');
// initialize_gene(alltimetable, room, true); // demo function call

// import check_merge_error from "../utils/practical_merge_possible.js";
// for (let i = 0; i < 10; i++) {  // test to test practical merge errors
//   console.log(
//     check_merge_error(initialize_gene(
//       JSON.parse(fs.readFileSync('./JSON/classsync.converted.tables.json', 'utf8')),
//       JSON.parse(fs.readFileSync('./JSON/classsync.converted.rooms.json', 'utf8'))
//     ))
//   ); // check_merge_error function call
// }