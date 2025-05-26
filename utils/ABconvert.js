import fs from 'fs';
import { room_schedule_sample, mergemap } from './constant.js';

console.log("===========================================================================================");
console.log("================== Converting from class-sync format to algorithm format ==================");
console.log("===========================================================================================");

console.group("\n================================ Converting timetable data ================================");
let old_timetable_data = JSON.parse(fs.readFileSync('./JSON/classsync.tables.json', 'utf8'));
let new_timetable_data = [];
process.stdout.write("Skipping | ");
for (let i = 0; i < old_timetable_data.length; i++) {
    let tttemp3 = [];
    let skip = false;
    if (mergemap[old_timetable_data[i].semester]) {
        for (let x of Object.keys(mergemap[old_timetable_data[i].semester])) {
            for (let y = 0; y < mergemap[old_timetable_data[i].semester][x].length; y++) {
                if (old_timetable_data[i].section == mergemap[old_timetable_data[i].semester][x][y]) {
                    skip = true;
                    process.stdout.write(old_timetable_data[i].section + " | ");
                    break;
                }
            }
        }
    }
    for (let j = 0; j < old_timetable_data[i].teacher_subject_data.length; j++) {
        delete old_timetable_data[i].teacher_subject_data[j]['_id'];
    }
    if (skip) {
        continue
    }
    for (let j = 0; j < old_timetable_data[i].teacher_subject_data.length; j++) {
        let currsub = old_timetable_data[i].teacher_subject_data[j].subjectcode;
        let skiplist = ["TCS552", "TCS531", "TCS548", "TCS591", "TCS592", "TCS565", "TCS566", "TCS561", "TCS567", "TCS592", "TCS515", "ELECTIVE", "CSP501", "SCS501", "GP501", "PCS512"];
        if (skiplist.includes(currsub)) {
            continue;
        }
        let teacher_temp_var = old_timetable_data[i].teacher_subject_data[j].teacherid;
        if (teacher_temp_var == 0 || teacher_temp_var == '0' || teacher_temp_var == '' || teacher_temp_var == undefined) {
            continue;
        }
        if (old_timetable_data[i].teacher_subject_data[j].weekly_hrs == 0) {
            continue;
        }

        tttemp3.push({
            "subjectid": old_timetable_data[i].teacher_subject_data[j].subjectcode,
            "teacherid": old_timetable_data[i].teacher_subject_data[j].teacherid,
            "weekly_hrs": old_timetable_data[i].teacher_subject_data[j].theory_practical == "PRACTICAL" ? 2 : old_timetable_data[i].teacher_subject_data[j].weekly_hrs,
            // 3hrs for practicals not allowed
            // it can be changed to 4 if needed
            "type": old_timetable_data[i].teacher_subject_data[j].theory_practical == "PRACTICAL" ? "practical" : "theory",
            "room_type":
                (mergemap[old_timetable_data[i].semester][old_timetable_data[i].section] && (old_timetable_data[i].teacher_subject_data[j].room_type == 'class' || old_timetable_data[i].teacher_subject_data[j].room_type == 'hall')) ? "hall" :
                    (!mergemap[old_timetable_data[i].semester][old_timetable_data[i].section] && (old_timetable_data[i].teacher_subject_data[j].room_type == 'class' || old_timetable_data[i].teacher_subject_data[j].room_type == 'hall')) ? "class" :
                        old_timetable_data[i].teacher_subject_data[j].room_type,
        });
    }
    let tttemp = [
        [{ "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }],
        [{ "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }],
        [{ "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }],
        [{ "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }],
        [{ "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }],
        [{ "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }],
        [{ "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }, { "roomid": "", "teacherid": "", "subjectid": "", "type": "" }]
    ];
    if (old_timetable_data[i].section in mergemap[old_timetable_data[i].semester]) {
        // console.log(mergemap[old_timetable_data[i].semester][old_timetable_data[i].section]);
        new_timetable_data.push({
            "local_fitness": 0,
            "course": old_timetable_data[i].course,
            "semester": old_timetable_data[i].semester,
            "section": old_timetable_data[i].section,
            "joint": true,
            "merged_section": mergemap[old_timetable_data[i].semester][old_timetable_data[i].section],
            "timetable": tttemp,
            "subjects": tttemp3,
        });
    } else {
        new_timetable_data.push({
            "local_fitness": 0,
            "course": old_timetable_data[i].course,
            "semester": old_timetable_data[i].semester,
            "section": old_timetable_data[i].section,
            "joint": false,
            "merged_section": [],
            "timetable": tttemp,
            "subjects": tttemp3,
        });
    }
}
new_timetable_data = {
    "fitness": 0,
    "data": new_timetable_data
}
fs.writeFileSync('./JSON/classsync.converted.tables.json', JSON.stringify(new_timetable_data, null, 4), 'utf8');
fs.writeFileSync('./JSON/classsync.tables.json', JSON.stringify(old_timetable_data, null, 4), 'utf8');//removes _id from the data
console.groupEnd();
console.log("\n============ Converted timetable data saved to classsync.converted.tables.json ============\n");


console.log("---------------------------------- Converting room data  ----------------------------------");
let old_room_data = JSON.parse(fs.readFileSync('./JSON/classsync.rooms.json', 'utf8'));
let new_room_data = {};
for (let i = 0; i < old_room_data.length; i++) {
    if (old_room_data[i].allowed_course.length > 0 &&
        old_room_data[i].allowed_course.includes("btechcse") &&
        old_room_data[i].roomid != "0"
    ) {
        if (old_room_data[i].type) {
            new_room_data[old_room_data[i].type] = new_room_data[old_room_data[i].type] || [];
            new_room_data[old_room_data[i].type].push({
                "roomid": old_room_data[i].roomid,
                "capacity": old_room_data[i].capacity
            });
        } else {
            console.log("Invalid room type: ");
        }
    }
    // delete old_room_data[i]['_id'];
    // delete old_room_data[i]['__v'];
    // old_room_data[i]['schedule'] = room_schedule_sample;
}
// fs.writeFileSync('classsync.rooms.json', JSON.stringify(old_room_data, null, 4), 'utf8');//removes _id from the data
fs.writeFileSync('./JSON/classsync.converted.rooms.json', JSON.stringify(new_room_data, null, 4), 'utf8');
console.log("--------------- Converted room data saved to classsync.converted.rooms.json ---------------\n");


console.log("================================= Converting faculty data =================================");
let old_faculty_data = JSON.parse(fs.readFileSync('./JSON/classsync.faculties.json', 'utf8'));
let new_faculty_data = {};
for (let i = 0; i < old_faculty_data.length; i++) {
    if (old_faculty_data[i].teacherid == 0) {
        continue;
    }
    new_faculty_data[old_faculty_data[i].teacherid] = {
        "teacherid": old_faculty_data[i].teacherid,
        "name": old_faculty_data[i].name,
    };
}
fs.writeFileSync('./JSON/classsync.converted.faculties.json', JSON.stringify(new_faculty_data, null, 4), 'utf8');
console.log("=========== Converted faculty data saved to classsync.converted.faculties.json  ===========\n");

console.log("===========================================================================================");
console.log("================ Finished converting to class-sync format from algorithm format  ==========");
console.log("===========================================================================================");

// This takes the teacher allocated timetables, faculty data, and room data from the mongodb database in the following files:
// classsync.tables.json, classsync.faculties.json, classsync.rooms.json
// Then it converts the data into the format required by the genetic algorithm.
// The converted timetable is saved in the following files:
// ./JSON/classsync.converted.tables.json, ./JSON/classsync.converted.faculties.json, ./JSON/classsync.converted.rooms.json
// The converted timetable can be used as an input to the genetic algorithm.
// The genetic algorithm is implemented in ABconvert.js 