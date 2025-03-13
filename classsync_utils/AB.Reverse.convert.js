import fs from 'fs';
import { schedule_sample } from './constant.js';

let new_timetable_data = JSON.parse(fs.readFileSync('classsync.converted.tables.json', 'utf8'));
let old_timetable_data = JSON.parse(fs.readFileSync('classsync.tables.json', 'utf8'));
new_timetable_data = new_timetable_data.data;
let room_data = JSON.parse(fs.readFileSync('classsync.converted.rooms.json', 'utf8'));
let faculty_data = JSON.parse(fs.readFileSync('classsync.converted.faculties.json', 'utf8'));

let new_converted_data = [];
const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const timeSlots = ["08-09", "09-10", "10-11", "11-12", "12-01", "01-02", "02-03", "03-04", "04-05", "05-06"];
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
fs.writeFileSync('classsync.backtonormal.tables.json', JSON.stringify(new_converted_data, null, 4), 'utf8');

// This does exactly the opposite of what ABconvert.js does or what is written below lol.
// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// This takes the teacher allocated timetables, faculty data, and room data from the mongodb database in the following files:
// classsync.tables.json, classsync.faculties.json, classsync.rooms.json
// Then it converts the data into the format required by the genetic algorithm.
// The converted timetable is saved in the following files:
// classsync.converted.tables.json, classsync.converted.faculties.json, classsync.converted.rooms.json
// The converted timetable can be used as an input to the genetic algorithm.
// The genetic algorithm is implemented in ABconvert.js 