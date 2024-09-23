import fs from 'fs';
import validate_timetable_set from './validate_timetable.js';
import fitness_func from './fitness_func.js';

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

// Timtable in 2D-array (just for reference)
//  0  1  2  3  4  5  6  7  8  9        monday
// 10 11 12 13 14 15 16 17 18 19        tuesday
// 20 21 22 23 24 25 26 27 28 29        wednesday
// 30 31 32 33 34 35 36 37 38 39        thursday
// 40 41 42 43 44 45 46 47 48 49        friday
// 50 51 52 53 54 55 56 57 58 59        saturday
// 60 61 62 63 64 65 66 67 68 69        sunday
//              |
//             \/
//           index = [6,4] in 2D array   and yes i made it by myself not AI :P


//  slot range for timetable
let min = 0; // if 10 then start from 10 (tuesday 9am)   
let max = 50; // it 60 then end at 59  (saturday 6pm) (60 is not included)

//  timetable data with subjects and teachers already assigned
let alltimetable = JSON.parse(fs.readFileSync('data.json', 'utf8'));
//  room data with room id and capacity (capacity is not implemented in this code right now)
let room = JSON.parse(fs.readFileSync('room.json', 'utf8'));

//  this function will validate the slot of timetable and flag out the room and teacher conflicts from that batch of timetables
const validate_timetable_slot = (alltimetable, j, k, teacherid, classid) => {
    let temp = {}
    if (alltimetable['data'].length == 0) { return true; }
    for (let i = 0; i < alltimetable['data'].length; i++) {        // all timetables
        if (alltimetable['data'][i]['timetable'][j][k].teacherid && alltimetable['data'][i]['timetable'][j][k].classid) {         // if class is empty            
            if (temp[("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid)] || temp[("class" + alltimetable['data'][i]['timetable'][j][k].classid)]) {
                return false;
            } else {
                temp[("teacher" + alltimetable['data'][i]['timetable'][j][k].teacherid)] = true;
                temp[("class" + alltimetable['data'][i]['timetable'][j][k].classid)] = true;
            }
        }
    }
    if (temp[("teacher" + teacherid)] || temp[("class" + classid)]) {
        return false;
    } else {
        return true;
    }
}
// this function will prevent the teacher to teach in multiple slots in a day
const validate_multiple_slot_in_a_day = (timetable, j, k, teacherid, classid) => {    // this function will prevent the teacher to teach in multiple slots in a day
    let map = {}
    for (let i = 0; i < 10; i++) {
        map[timetable[j][i].teacherid] = true;
    }
    if (map[teacherid]) {
        // console.log("false");
        return false;
    } else {
        return true;
    }
}
const initialize_population = (alltimetable) => {
    let flag = 0;   // flag to check the number of conflicts in the timetable generation
    let number_of_sections = alltimetable['data'].length;
    for (let i = 0; i < number_of_sections; i++) {
        let subjects = JSON.parse(JSON.stringify(alltimetable['data'][i].subjects));            // deep copy of subjects
        let timetable = JSON.parse(JSON.stringify(timetablestructure));                 // deep copy of timetablestructure
        while (subjects.length > 0) {                                                   // loop until all subjects are assigned
            let temp_subject_index = (Math.floor(Math.random() * subjects.length));     // randomly choose subject
            temp_subject_index = 0;                                                     // for testing


            let temp_room_index = (Math.floor(Math.random() * room.length));            // randomly choose room

            if (subjects[temp_subject_index] && room[temp_room_index]) {

                let temp = Math.floor(Math.random() * (max - min)) + min;           // randomly choose slot btwn 10 to 59 (just for testing)
                let temp_day = Math.floor(temp / 10);                               // get the day from slot
                let temp_slot = Math.floor(temp % 10);                              // get the slot from slot

                // console.log(temp + " || " + temp_day + " || " + temp_slot);
                if (timetable[temp_day][temp_slot].teacherid == "" && timetable[(temp_day)][temp_slot].classid == "") {

                    //if validation in slot is true then assign the subject to that slot
                    if (validate_timetable_slot(alltimetable, temp_day, temp_slot, subjects[temp_subject_index].teacherid, room[temp_room_index].roomid)) {

                        // if validation in a day is true then assign the subject to that slot (this will prevent the teacher to teach in multiple slots in a day)
                        if (validate_multiple_slot_in_a_day(timetable, temp_day, temp_slot, subjects[temp_subject_index].teacherid, room[temp_room_index].roomid)) {
                            timetable[temp_day][temp_slot].teacherid = subjects[temp_subject_index].teacherid;
                            timetable[temp_day][temp_slot].classid = room[temp_room_index].roomid;
                            subjects[temp_subject_index].weekly_hrs--;
                            if (subjects[temp_subject_index].weekly_hrs == 0) {
                                subjects.splice(temp_subject_index, 1);                 // remove subject from list and 
                            }
                            if (room[temp_room_index].capacity == 0) {
                                room.splice(temp_room_index, 1);                        // remove room from list (currently not implemented) due to above reason
                            }
                        }
                    } else {
                        flag++;
                        // console.log(flag);
                    }
                }
            }
        }
        alltimetable['data'][i].timetable = timetable;
    }
    alltimetable = fitness_func(alltimetable);
    console.log("========== [ Validation : " + validate_timetable_set(alltimetable) + " ] ========= [ Fitness : " + alltimetable['fitness'] + " ] ==========");
    fs.writeFileSync('data2.json', JSON.stringify(alltimetable, null, 4), 'utf8');
}
initialize_population(alltimetable);    // initialize the population of timetables randomly for all sections


// Timtable in 2D-array (just for reference)
//  0  1  2  3  4  5  6  7  8  9        monday
// 10 11 12 13 14 15 16 17 18 19        tuesday
// 20 21 22 23 24 25 26 27 28 29        wednesday
// 30 31 32 33 34 35 36 37 38 39        thursday
// 40 41 42 43 44 45 46 47 48 49        friday
// 50 51 52 53 54 55 56 57 58 59        saturday
// 60 61 62 63 64 65 66 67 68 69        sunday
//              |
//             \/
//           index = [6,4] in 2D array   and yes i made it by myself not AI :P and yes it is copied from above :P, 