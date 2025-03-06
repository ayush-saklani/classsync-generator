import fs from 'fs';

let old_timetable_data = JSON.parse(fs.readFileSync('classsync.tables.json', 'utf8'));
let old_room_data = JSON.parse(fs.readFileSync('classsync.rooms.json', 'utf8'));
let old_faculty_data = JSON.parse(fs.readFileSync('classsync.faculties.json', 'utf8'));

let new_timetable_data = [];
let new_faculty_data = {};
let new_room_data = {
    "room": [],
    "hall": [],
    "lab": []
};
let mergemap = {
    "5": {
        "A1": ["A2"],
        "B1": ["B2"],
        "C1": ["C2"],
    }
}
let spare_teacher_id = 2119666;
for (let i = 0; i < old_timetable_data.length; i++) {
    let tttemp3 = [];
    let skip = false;
    if (mergemap[old_timetable_data[i].semester]) {
        for (let x of Object.keys(mergemap[old_timetable_data[i].semester])) {
            for (let y = 0; y < mergemap[old_timetable_data[i].semester][x].length; y++) {
                if (old_timetable_data[i].section == mergemap[old_timetable_data[i].semester][x][y]) {
                    skip = true;
                    console.log("Skipping ", old_timetable_data[i].section);
                    break;
                }
            }
        }
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
        delete old_timetable_data[i].teacher_subject_data[j]['_id'];

        tttemp3.push({
            "subjectid": old_timetable_data[i].teacher_subject_data[j].subjectcode,
            "teacherid": old_timetable_data[i].teacher_subject_data[j].teacherid == 0 ? spare_teacher_id++ : old_timetable_data[i].teacher_subject_data[j].teacherid,
            "weekly_hrs": old_timetable_data[i].teacher_subject_data[j].theory_practical == "PRACTICAL" ? 2 : old_timetable_data[i].teacher_subject_data[j].weekly_hrs,
            // 3hrs for practicals not allowed
            // it can be changed to 4 if needed
            "type": old_timetable_data[i].teacher_subject_data[j].theory_practical == "PRACTICAL" ? "practical" : "theory"
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
        console.log(mergemap[old_timetable_data[i].semester][old_timetable_data[i].section]);
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
fs.writeFileSync('classsync.converted.tables.json', JSON.stringify(new_timetable_data, null, 4), 'utf8');
// fs.writeFileSync('classsync.tables.json', JSON.stringify(old_timetable_data, null, 4), 'utf8');

for (let i = 0; i < old_room_data.length; i++) {
    if (old_room_data[i].allowed_course.length > 0 &&
        old_room_data[i].allowed_course.includes("btechcse") &&
        old_room_data[i].roomid != "0"
    ) {
        if (old_room_data[i].type == "class") {
            if (old_room_data[i].capacity > 1) {
                new_room_data.hall.push({
                    "roomid": old_room_data[i].roomid,
                    "capacity": old_room_data[i].capacity
                });
            } else {
                new_room_data.room.push({
                    "roomid": old_room_data[i].roomid,
                    "capacity": old_room_data[i].capacity
                });
            }
        } else if (old_room_data[i].type == "lab") {
            new_room_data.lab.push({
                "roomid": old_room_data[i].roomid,
                "capacity": old_room_data[i].capacity
            });
        } else {
            console.log("Invalid room type: ", old_room_data[i].type);
        }
    }
}
fs.writeFileSync('classsync.converted.rooms.json', JSON.stringify(new_room_data, null, 4), 'utf8');


for (let i = 0; i < old_faculty_data.length; i++) {
    new_faculty_data[old_faculty_data[i].teacherid] = {
        "teacherid": old_faculty_data[i].teacherid,
        "name": old_faculty_data[i].name,
    };
}
fs.writeFileSync('classsync.converted.faculties.json', JSON.stringify(new_faculty_data, null, 4), 'utf8');

// This takes the teacher allocated timetables, faculty data, and room data from the mongodb database in the following files:
// classsync.tables.json, classsync.faculties.json, classsync.rooms.json
// Then it converts the data into the format required by the genetic algorithm.
// The converted timetable is saved in the following files:
// classsync.converted.tables.json, classsync.converted.faculties.json, classsync.converted.rooms.json
// The converted timetable can be used as an input to the genetic algorithm.
// The genetic algorithm is implemented in ABconvert.js 