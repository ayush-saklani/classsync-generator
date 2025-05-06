import fs from 'fs';
import { schedule_sample } from './constant.js';
import { room_schedule_sample } from "./constant.js";
import { faculty_schedule_sample } from "./constant.js";

let new_timetable_data = JSON.parse(fs.readFileSync('./JSON/classsync.converted.tables.json', 'utf8'));
let old_timetable_data = JSON.parse(fs.readFileSync('./JSON/classsync.tables.json', 'utf8'));
new_timetable_data = new_timetable_data.data;
let room_data = JSON.parse(fs.readFileSync('./JSON/classsync.converted.rooms.json', 'utf8'));
let faculty_data = JSON.parse(fs.readFileSync('./JSON/classsync.converted.faculties.json', 'utf8'));

let new_converted_data = [];
const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const timeSlots = ["08-09", "09-10", "10-11", "11-12", "12-01", "01-02", "02-03", "03-04", "04-05", "05-06"];

console.log("===========================================================================================");
console.log("================== Converting from algorithm format to class-sync format ==================");
console.log("===========================================================================================");

console.log("\n================================ Converting timetable data ================================");
for (let i = 0; i < new_timetable_data.length; i++) {
    let current_timetable = JSON.parse(JSON.stringify({
        "course": new_timetable_data[i].course,
        "semester": new_timetable_data[i].semester,
        "section": new_timetable_data[i].section,
        "schedule": schedule_sample,
        "teacher_subject_data": old_timetable_data.find(x => x.course == new_timetable_data[i].course && x.semester == new_timetable_data[i].semester && x.section == new_timetable_data[i].section).teacher_subject_data
    }));
    let schedule_copy = JSON.parse(JSON.stringify(schedule_sample));
    for (let j = 0; j < new_timetable_data[i].timetable.length; j++) {
        for (let k = 0; k < new_timetable_data[i].timetable[j].length; k++) {
            let currslot = new_timetable_data[i].timetable[j][k];

            current_timetable.schedule[days[j]][timeSlots[k]].class_id = currslot.roomid;
            current_timetable.schedule[days[j]][timeSlots[k]].subjectcode = currslot.subjectid;
            if (new_timetable_data[i].joint && currslot.type != 'practical') {
                schedule_copy[days[j]][timeSlots[k]].class_id = currslot.roomid;
                schedule_copy[days[j]][timeSlots[k]].subjectcode = currslot.subjectid;
            }
        }
    }
    new_converted_data.push(current_timetable);
    if (new_timetable_data[i].joint) {
        for (let x = 0; x < new_timetable_data[i].merged_section.length; x++) {
            let current_timetable_copy = JSON.parse(JSON.stringify({
                "course": new_timetable_data[i].course,
                "semester": new_timetable_data[i].semester,
                "section": new_timetable_data[i].merged_section[x],
                "schedule": JSON.parse(JSON.stringify(schedule_copy)),
                "teacher_subject_data": old_timetable_data.find(y => y.course == new_timetable_data[i].course && y.semester == new_timetable_data[i].semester && y.section == new_timetable_data[i].merged_section[x]).teacher_subject_data
            }));
            new_converted_data.push(current_timetable_copy);
        }
    }
}
fs.writeFileSync('./JSON/classsync.backtonormal.tables.json', JSON.stringify(new_converted_data, null, 4), 'utf8');
console.log("========== Converted timetable data saved to classsync.backtonormal.tables.json  ==========\n");


console.log("---------------------------------- Converting room data  ----------------------------------");
let old_room_data = JSON.parse(fs.readFileSync("./JSON/classsync.rooms.json", "utf8"),);
// genetic to classsync table
let genetic_reverted_timetable = JSON.parse(fs.readFileSync("./JSON/classsync.backtonormal.tables.json", "utf8"),);

// code to create room data for classsync from genetic algorithm output jsons
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
        subjectcode_to_teacherid_map[subject_data.subjectcode] = subject_data.teacherid;
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
fs.writeFileSync("./JSON/classsync.backtonormal.rooms.json", JSON.stringify(new_converted_room_data, null, 2), "utf8");
console.log("------------- Converted room data saved to classsync.backtonormal.rooms.json  -------------\n");




console.log("================================= Converting faculty data =================================");
let old_faculty_data = JSON.parse(fs.readFileSync("./JSON/classsync.faculties.json", "utf8"));

let new_converted_faculty_data = [];            // code to create faculty data for classsync from genetic algorithm output jsons
let faculty_map = {};                           // creating a seperate map to find faculty faster inside the converted room data

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
fs.writeFileSync("./JSON/classsync.backtonormal.faculties.json", JSON.stringify(new_converted_faculty_data, null, 2), "utf8");
console.log("========== Converted faculty data saved to classsync.backtonormal.faculties.json ==========\n");

console.log("===========================================================================================");
console.log("================ Finished converting to class-sync format from algorithm format  ==========");
console.log("===========================================================================================");

// This does exactly the opposite of what ABconvert.js does or what is written below lol.
// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// This takes the teacher allocated timetables, faculty data, and room data from the mongodb database in the following files:
// ./JSON/classsync.tables.json, ./JSON/classsync.faculties.json, ./JSON/classsync.rooms.json
// Then it converts the data into the format required by the genetic algorithm.
// The converted timetable is saved in the following files:
// ./JSON/classsync.converted.tables.json, ./JSON/classsync.converted.faculties.json, ./JSON/classsync.converted.rooms.json
// The converted timetable can be used as an input to the genetic algorithm.
// The genetic algorithm is implemented in ABconvert.js 