import fs from "fs";
import { mergemap } from "./constant.js";

// RUNS AFTER BAconvert.js

let stats = {
  filled: 0,
  already_filled: 0,
  sameteacherskipped: 0,
  roomfail: 0,
  total: 0,
};

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const timeSlots = ["08-09", "09-10", "10-11", "11-12", "12-01", "01-02", "02-03", "03-04", "04-05", "05-06"];
let rooms_list = JSON.parse(fs.readFileSync("./JSON/classsync.converted.rooms.json", "utf8"));
let backtonormal_timetable_data = JSON.parse(fs.readFileSync("./JSON/classsync.backtonormal.tables.json", "utf8"));
let backtonormal_rooms_data = JSON.parse(fs.readFileSync("./JSON/classsync.backtonormal.rooms.json", "utf8"));
let backtonormal_faculty_data = JSON.parse(fs.readFileSync("./JSON/classsync.backtonormal.faculties.json", "utf8"));

let section_map = {};
let room_map = {};
let faculty_map = {};

for (let i = 0; i < backtonormal_timetable_data.length; i++) {
  section_map[backtonormal_timetable_data[i].semester + backtonormal_timetable_data[i].section] = i;
}

for (let i = 0; i < backtonormal_rooms_data.length; i++) {
  room_map[backtonormal_rooms_data[i].roomid] = i;
}

for (let i = 0; i < backtonormal_faculty_data.length; i++) {
  faculty_map[backtonormal_faculty_data[i].teacherid] = i;
}

const findAndAssignPracticalRoomAndFacultySlot = (original_slot, merged_slot, isSameFaculty, day, time, subject_room_type, metadata) => {
  stats.total++;
  // console.log("FINDING:- ", day, time, subject_room_type, metadata);
  if (isSameFaculty) {
    // console.log("SKIPPED:- SAME FACULTY ", day, time);
    stats.sameteacherskipped++;
    return;
  } else if (merged_slot.subjectcode === original_slot.subjectcode) {
    stats.already_filled++;
    return;
  } else {
    let similar_room_list = rooms_list[subject_room_type];
    for (let room of similar_room_list) {
      let current_room_schedule = backtonormal_rooms_data[room_map[room.roomid]].schedule;
      if (current_room_schedule[day][time].subjectcode !== "") {
        continue;
      }

      let current_faculty_schedule = backtonormal_faculty_data[faculty_map[metadata.merged_teacherid]].schedule;
      // console.log(current_room_schedule[day][time].subjectcode);
      if (current_faculty_schedule[day][time].subjectcode === "") {
        // fill merged slot
        merged_slot.class_id = room.roomid;
        merged_slot.subjectcode = original_slot.subjectcode;

        // fill room data
        // course, semester, section, teacherid, subjectcode
        current_room_schedule[day][time] = {
          course: metadata.course,
          semester: metadata.semester,
          section: metadata.merged_section,
          teacherid: metadata.merged_teacherid,
          subjectcode: original_slot.subjectcode,
        };

        // fill faculty data
        // course, semester, section[], roomid[], subjectcode
        current_faculty_schedule[day][time] = {
          course: metadata.course,
          semester: metadata.semester,
          section: [metadata.merged_section],
          roomid: [room.roomid],
          subjectcode: original_slot.subjectcode,
        };

        // console.log("FILLED:- DIFFERENT FACULTY ", day, time);
        stats.filled++;
        return;
      }
    }
    // console.log("FAILED:- ", day, time);
    fs.appendFileSync(
      "./JSONdata/merge_failures.log.txt",
      JSON.stringify({ day, time, subject_room_type, ...metadata }) + "\n",
      "utf8"
    );
    console.log({ day, time, subject_room_type, ...metadata });
    stats.roomfail++;
    return;
  }
}

console.log("================================= Filling up practical data for merged sections =================================");

Object.entries(mergemap).forEach(([semester, sections]) => {
  // console.log("current semester=====", semester);
  Object.entries(sections).forEach(([originalSection, mergedSections]) => {
    let original_section_index = section_map[semester + originalSection];
    let original_timetable = backtonormal_timetable_data[original_section_index];

    // code to create subject code to metadata map for current table
    let subjectcode_to_metadata_map_original = {};
    for (let subject_data of original_timetable.teacher_subject_data) {
      subjectcode_to_metadata_map_original[subject_data.subjectcode] = { subject_type: subject_data.theory_practical, room_type: subject_data.room_type, teacherid: subject_data.teacherid };
    }

    for (let section of mergedSections) {
      let merged_section_index = section_map[semester + section];
      let merged_timetable = backtonormal_timetable_data[merged_section_index];

      let subjectcode_to_metadata_map_merged = {};
      for (let subject_data of merged_timetable.teacher_subject_data) {
        subjectcode_to_metadata_map_merged[subject_data.subjectcode] = { subject_type: subject_data.theory_practical, room_type: subject_data.room_type, teacherid: subject_data.teacherid };
      }

      // console.log("filling up practical data for section:", section);
      for (let day of days) {
        for (let time of timeSlots) {
          let original_slot = original_timetable.schedule[day][time];

          if (original_slot.subjectcode === "" || original_slot.subjectcode === "0") continue;

          let merged_slot = merged_timetable.schedule[day][time];
          let subjectcode_current_slot = original_slot.subjectcode;
          let subject_room_type = subjectcode_to_metadata_map_original[subjectcode_current_slot].room_type.toLowerCase();
          let original_teacherid = subjectcode_to_metadata_map_original[subjectcode_current_slot].teacherid;
          let merged_teacherid = subjectcode_to_metadata_map_merged[subjectcode_current_slot].teacherid;

          let isSameFaculty = original_teacherid === merged_teacherid;
          let original_slot_isPractical = subjectcode_to_metadata_map_original[subjectcode_current_slot].subject_type === "PRACTICAL";

          let metadata = {
            course: original_timetable.course,
            semester: original_timetable.semester,
            original_section: originalSection,
            merged_section: section,
            original_teacherid: original_teacherid,
            merged_teacherid: merged_teacherid,
          };

          if (original_slot.subjectcode !== "0" && original_slot_isPractical) {
            findAndAssignPracticalRoomAndFacultySlot(original_slot, merged_slot, isSameFaculty, day, time, subject_room_type, metadata);
            // console.log(merged_slot);
          }
        }
      }
    }
  });
});

fs.writeFileSync("./JSON/classsync.backtonormal.tables.json", JSON.stringify(backtonormal_timetable_data, null, 2), "utf8");
fs.writeFileSync("./JSON/classsync.backtonormal.rooms.json", JSON.stringify(backtonormal_rooms_data, null, 2), "utf8");
fs.writeFileSync("./JSON/classsync.backtonormal.faculties.json", JSON.stringify(backtonormal_faculty_data, null, 2), "utf8");

console.log("\n========================= SUMMARY =========================");
console.log("Filled slots      :", stats.filled);
console.log("Already filled    :", stats.already_filled);
console.log("Same teacher fail :", stats.sameteacherskipped);
console.log("Room Fail         :", stats.roomfail);
console.log("Total slots       :", stats.total);
console.log("===========================================================\n");