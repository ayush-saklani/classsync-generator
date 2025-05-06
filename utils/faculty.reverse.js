import fs from "fs";
import { faculty_schedule_sample } from "./constant.js";

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const timeSlots = ["08-09", "09-10", "10-11", "11-12", "12-01", "01-02", "02-03", "03-04", "04-05", "05-06"];

console.log("================================= Converting faculty data =================================");
let old_faculty_data = JSON.parse(fs.readFileSync("./JSON/classsync.faculties.json", "utf8"));
// genetic to classsync table
let genetic_reverted_timetable = JSON.parse(fs.readFileSync("./JSON/classsync.backtonormal.tables.json", "utf8"));

// code to create faculty data for classsync from genetic algorithm output jsons
let new_converted_faculty_data = [];

// creating a seperate map to find faculty faster inside the converted room data
let faculty_map = {};

// intialising the faculty data for classsync
for (let i = 0; i < old_faculty_data.length; i++) {
  let current_faculty = {};
  current_faculty.teacherid = old_faculty_data[i].teacherid;
  current_faculty.name = old_faculty_data[i].name;
  current_faculty.schedule = JSON.parse(JSON.stringify(faculty_schedule_sample));
  new_converted_faculty_data.push(current_faculty);
  faculty_map[old_faculty_data[i].teacherid] = i;
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
    subjectcode_to_teacherid_map[subject_data.subjectcode] = subject_data.teacherid;
  }

  // code to modify the schedule of faculty
  for (const day of days) {
    for (const time of timeSlots) {
      let table_slot = table_schedule[day][time];

      //filling course, semes, section, roomid, subjectcode of faculty slot
      let current_room_id = table_slot.class_id;
      if (current_room_id === "") continue; // skip if table slot is empty
      let current_subject_id = table_slot.subjectcode;

      let current_faculty_id = subjectcode_to_teacherid_map[current_subject_id];
      if (current_faculty_id === "0") continue;

      let current_faculty = new_converted_faculty_data[faculty_map[current_faculty_id]];
      // if (current_room.roomid == "4085")
      // console.log(current_room.roomid, day, time);
      let faculty_slot = current_faculty.schedule[day][time];

      faculty_slot.course = table_course;
      faculty_slot.semester = table_semester;
      faculty_slot.section.push(table_section);
      if (faculty_slot.roomid.indexOf(current_room_id) == -1) {
        faculty_slot.roomid.push(current_room_id);
      }
      faculty_slot.subjectcode = current_subject_id;
    }
  }
}

// Save the converted room data to a JSON file
fs.writeFileSync("./JSON/classsync.backtonormal.faculties.json", JSON.stringify(new_converted_faculty_data, null, 2), "utf8");
console.log("========== Converted faculty data saved to classsync.backtonormal.faculties.json ==========");