import fs from "fs";
import { room_schedule_sample } from "./constant.js";

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const timeSlots = [
  "08-09",
  "09-10",
  "10-11",
  "11-12",
  "12-01",
  "01-02",
  "02-03",
  "03-04",
  "04-05",
  "05-06",
];

let old_room_data = JSON.parse(
  fs.readFileSync("./JSON/classsync.rooms.json", "utf8"),
);
// genetic to classsync table
let genetic_reverted_timetable = JSON.parse(
  fs.readFileSync("./JSON/classsync.backtonormal.tables.json", "utf8"),
);

// code to create room data for classsync from genetic algorithm output jsons
////////
let new_converted_room_data = [];

// creating a seperate map to find room faster inside the converted room data
let room_map = {};

// intialising the room data for classsync
for (let i = 0; i < old_room_data.length; i++) {
  let current_room = {};
  current_room.roomid = old_room_data[i].roomid;
  current_room.name = old_room_data[i].name;
  current_room.type = old_room_data[i].type;
  current_room.capacity = old_room_data[i].capacity;
  current_room.allowed_course = old_room_data[i].allowed_course;
  current_room.schedule = JSON.parse(JSON.stringify(room_schedule_sample));
  new_converted_room_data.push(current_room);
  room_map[old_room_data[i].roomid] = i;
}

// iterating through genetic reverted table to fill up room schedule
for (let i = 0; i < genetic_reverted_timetable.length; i++) {
  let current_table = genetic_reverted_timetable[i];

  // extracting basic data from current_table for cleaner code
  let table_course = current_table.course;
  let table_semester = current_table.semester;
  let table_section = current_table.section;
  let table_schedule = current_table.schedule;

  // code to find create teacher id map for current table
  let subjectcode_to_teacherid_map = {};
  for (let subject_data of current_table.teacher_subject_data) {
    subjectcode_to_teacherid_map[subject_data.subjectcode] =
      subject_data.teacherid;
  }

  // code to modify the schedule of room
  for (const day of days) {
    for (const time of timeSlots) {
      let table_slot = table_schedule[day][time];

      //filling course, semes, section, teacherid, subjectcode of room slot
      let current_room_id = table_slot.class_id;
      if (current_room_id === "") continue; // skip if table slot is empty
      let current_subject_id = table_slot.subjectcode;

      let current_room = new_converted_room_data[room_map[current_room_id]];
      // if (current_room.roomid == "4085")
      // console.log(current_room.roomid, day, time);
      let room_slot = current_room.schedule[day][time];

      room_slot.course = table_course;
      room_slot.semester = table_semester;
      room_slot.section.push(table_section);
      room_slot.teacherid = subjectcode_to_teacherid_map[current_subject_id];
      room_slot.subjectcode = current_subject_id;
    }
  }
}

// Save the converted room data to a JSON file
fs.writeFileSync(
  "./JSON/classsync.backtonormal.rooms.json",
  JSON.stringify(new_converted_room_data, null, 2),
  "utf8",
);
console.log(
  "Modified room data has been saved to classsync.modified.rooms.json",
);
