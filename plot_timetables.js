import fs from 'fs';
import validate_timetable_set from './validate_timetable.js';
let no_of_timetable = 20;

//  structure of timetable as template
let timetablestructure = [
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }],
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }],
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }],
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }],
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }],
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }],
    [{ "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }, { "classid": "", "teacherid": "" }]
];

//  room data
let room = JSON.parse(fs.readFileSync('room.json', 'utf8'));

let max = 60; // 6 days * 10 hours mon to sat 8am to 6pm

let alltimetable = JSON.parse(fs.readFileSync('data.json', 'utf8'));

const validate_timetable_slot = (alltimetable, j, k, teacherid, classid) => {
    // 8am to 6pm
    let temp = {}
    if (alltimetable.length == 0) { return true; }
    for (let i = 0; i < alltimetable.length; i++) {        // all timetables
        if (alltimetable[i]['timetable'][j][k].teacherid && alltimetable[i]['timetable'][j][k].classid) {         // if class is empty            
            if (temp[("teacher" + alltimetable[i]['timetable'][j][k].teacherid)] || temp[("class" + alltimetable[i]['timetable'][j][k].classid)]) {
                return false;
            } else {
                temp[("teacher" + alltimetable[i]['timetable'][j][k].teacherid)] = true;
                temp[("class" + alltimetable[i]['timetable'][j][k].classid)] = true;
            }
        }
    }
    if (temp[("teacher" + teacherid)] || temp[("class" + classid)]) {
        return false;
    } else {
        return true;
    }
}

let flag = 0;   // flag to check the number of conflicts in the timetable generation
let number_of_sections = alltimetable.length;
let morning_batch = Math.ceil(number_of_sections / 2);     // number of timetable to generate 
for (let i = 0; i < alltimetable.length; i++) {
    console.log("Generating Timetables for Section " + i);
    let subjects = JSON.parse(JSON.stringify(alltimetable[i].subjects));            // deep copy of subjects
    let timetable = JSON.parse(JSON.stringify(timetablestructure));                 // deep copy of timetablestructure
    while (subjects.length > 0) {                                                   // loop until all subjects are assigned
        let temp_subject_index = (Math.floor(Math.random() * subjects.length));     // randomly choose subject
        let temp_room_index = (Math.floor(Math.random() * room.length));            // randomly choose room

        if (subjects[temp_subject_index] && room[temp_room_index]) {

            // =================================  Randomly assign subject to slot  =================================
            // ============== this below logic will make half timetable morning and half evening shift =============
            let temp;
            while (1) {
                temp = Math.floor(Math.random() * max);                         // randomly choose slot
                if (morning_batch == 0 && (Math.floor(temp % 10) >= 5)) {       // if morning batch is over then choose only afternoon slots
                    break;
                }
                else if (morning_batch > 0 && (Math.floor(temp % 10) < 5)) {   // if morning batch is not over then choose only morning slots
                    break;
                }
            }
            // ============== this above logic will make half timetable morning and half evening shift =============
            // let temp = Math.floor(Math.random() * max);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      // old logic to assign subject to slot (randomly)


            // console.log(temp + " || " + (Math.floor(temp / 10)) + " || " + (Math.floor((temp % 10))));
            if (timetable[(Math.floor(temp / 10))][(Math.floor(temp % 10))].teacherid == "" && timetable[(Math.floor(temp / 10))][(Math.floor(temp % 10))].classid == "") {

                //if validation in slot is true then assign the subject to that slot
                if (validate_timetable_slot(alltimetable, (Math.floor(temp / 10)), (Math.floor(temp % 10)), subjects[temp_subject_index].teacherid, room[temp_room_index].roomid, morning_batch)) {
                    timetable[(Math.floor(temp / 10))][(Math.floor(temp % 10))].teacherid = subjects[temp_subject_index].teacherid;
                    timetable[(Math.floor(temp / 10))][(Math.floor(temp % 10))].classid = room[temp_room_index].roomid;
                    subjects[temp_subject_index].weekly_hrs--;
                    // room[temp_room_index].capacity--;                        // currently not implemented due to logic thinking incapability of the developer, lol :P
                    if (subjects[temp_subject_index].weekly_hrs == 0) {
                        subjects.splice(temp_subject_index, 1);                 // remove subject from list and 
                    } if (room[temp_room_index].capacity == 0) {
                        room.splice(temp_room_index, 1);                        // remove room from list (currently not implemented) due to above reason
                    }
                } else {
                    flag++;
                    // console.log(flag);
                }
            }
        }
    }
    console.log("===========================================================");
    morning_batch = (morning_batch > 0) ? (morning_batch - 1) : morning_batch;
    alltimetable[i].timetable = timetable;
}
console.log("=============  Timetable Generation Complete  =============");
console.log("==========  Timetable validation status : " + validate_timetable_set(alltimetable) + "    =========");
console.log("===========================================================");
fs.writeFileSync('data2.json', JSON.stringify(alltimetable), 'utf8');





// Timtable in 2D-array (just for reference)
//  0  1  2  3  4  5  6  7  8  9
// 10 11 12 13 14 15 16 17 18 19
// 20 21 22 23 24 25 26 27 28 29
// 30 31 32 33 34 35 36 37 38 39
// 40 41 42 43 44 45 46 47 48 49
// 50 51 52 53 54 55 56 57 58 59
//              |
//             \/
//           index = [5,4] in 2D array
