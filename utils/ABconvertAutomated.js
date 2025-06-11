import fs from 'fs';
import { room_schedule_sample, mergemap, table_schedule_sample } from './constant.js';
import Tables from "./DBupload/table.model.js";
import Rooms from "./DBupload/room.model.js";
import Faculties from "./DBupload/faculty.model.js";
import mongoose, { set } from "mongoose";
import dotenv from "dotenv";
import cliProgress from 'cli-progress';

dotenv.config(); // Load environment variables

let production = false; // Set to false for skipping progress bar and database connection

let multibar, b1, b0, b2, b3, b4;

if (production) {
    multibar = new cliProgress.MultiBar({
        clearOnComplete: false,
        hideCursor: true,
        format: '{bar} {percentage}% | {eta}s | {value}/{total} | {filename}',
    }, cliProgress.Presets.rect);

    b1 = multibar.create(100, 0, { filename: "AB Conversion" });
    b0 = multibar.create(1, 0, { filename: "Fetching Data" });
    b2 = multibar.create(100, 0, { filename: "Timetable Data" });
    b3 = multibar.create(100, 0, { filename: "Room Data" });
    b4 = multibar.create(100, 0, { filename: "Faculty Data" });
}
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DBURI);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};
const converttimetable = async (old_timetable_data) => {
    if (production) b2.start(old_timetable_data.length, 0);
    let new_timetable_data = [];
    // process.stdout.write("Skipping | ");
    for (let i = 0; i < old_timetable_data.length; i++) {
        if (production) b2.update(i + 1, { filename: "Timetable Data" });
        let tttemp3 = [];
        let skip = false;
        if (mergemap[old_timetable_data[i].semester]) {
            for (let x of Object.keys(mergemap[old_timetable_data[i].semester])) {
                for (let y = 0; y < mergemap[old_timetable_data[i].semester][x].length; y++) {
                    if (old_timetable_data[i].section == mergemap[old_timetable_data[i].semester][x][y]) {
                        skip = true;
                        // process.stdout.write(old_timetable_data[i].section + " | ");
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
            // let currsub = old_timetable_data[i].teacher_subject_data[j].subjectcode;
            // let skiplist = ["TCS552", "TCS531", "TCS548", "TCS591", "TCS592", "TCS565", "TCS566", "TCS561", "TCS567", "TCS592", "TCS515", "ELECTIVE", "CSP501", "SCS501", "GP501", "PCS512"];
            // if (skiplist.includes(currsub)) {
            //     continue;
            // }
            let teacher_temp_var = old_timetable_data[i].teacher_subject_data[j].teacherid;
            if (teacher_temp_var == 0 || teacher_temp_var == '0' || teacher_temp_var == '' || teacher_temp_var == undefined) {
                continue;
            }
            if (old_timetable_data[i].teacher_subject_data[j].weekly_hrs == 0) {
                continue;
            }

            // Find all teachers for the current section and add them to an array
            let sectionTeachers = [];
            if (mergemap[old_timetable_data[i].semester][old_timetable_data[i].section] && old_timetable_data[i].teacher_subject_data[j].theory_practical == "PRACTICAL") {
                for (let k = 0; k < old_timetable_data.length; k++) {
                    if (old_timetable_data[k].semester === old_timetable_data[i].semester && mergemap[old_timetable_data[i].semester][old_timetable_data[i].section].includes(old_timetable_data[k].section)) {
                        let subj = old_timetable_data[k].teacher_subject_data.find(s => s.subjectcode === old_timetable_data[i].teacher_subject_data[j].subjectcode);
                        if (subj && subj.teacherid && !sectionTeachers.includes(subj.teacherid)) {
                            sectionTeachers.push(subj.teacherid);
                        }
                    }
                }
            }

            // Existing logic for pushing subject info
            tttemp3.push({
                "subjectid": old_timetable_data[i].teacher_subject_data[j].subjectcode,
                "teacherid": old_timetable_data[i].teacher_subject_data[j].teacherid,
                "weekly_hrs": old_timetable_data[i].teacher_subject_data[j].theory_practical == "PRACTICAL" ? 2 : old_timetable_data[i].teacher_subject_data[j].weekly_hrs,
                // 3hrs for practicals not allowed
                // it can be changed to 4 if needed
                "type": old_timetable_data[i].teacher_subject_data[j].theory_practical == "PRACTICAL" ? "practical" : "theory",
                "room_type":
                    (mergemap[old_timetable_data[i].semester][old_timetable_data[i].section] && (old_timetable_data[i].teacher_subject_data[j].room_type.toLowerCase() == 'class' || old_timetable_data[i].teacher_subject_data[j].room_type.toLowerCase() == 'hall')) ? "hall" :
                        (!mergemap[old_timetable_data[i].semester][old_timetable_data[i].section] && (old_timetable_data[i].teacher_subject_data[j].room_type.toLowerCase() == 'class' || old_timetable_data[i].teacher_subject_data[j].room_type.toLowerCase() == 'hall')) ? "class" :
                            (old_timetable_data[i].teacher_subject_data[j].room_type).toLowerCase(),
                "merge_teachers": sectionTeachers // add the array here
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
    for (let i = 0; i < old_timetable_data.length; i++) {
        old_timetable_data[i].schedule = JSON.parse(JSON.stringify(table_schedule_sample));
    }
    fs.writeFileSync('./JSON/classsync.tables.json', JSON.stringify(old_timetable_data, null, 4), 'utf8');//removes _id from the data
    if (production) b2.stop();
    return new_timetable_data;
}
const convertrooms = async (old_room_data) => {
    let new_room_data = {};
    if (production) b3.start(old_room_data.length, 0);
    for (let i = 0; i < old_room_data.length; i++) {
        if (production) b3.update(i + 1, { filename: "Room Data" });
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
    if (production) b3.stop();
    return new_room_data;
}
const convertfaculties = async (old_faculty_data) => {
    let new_faculty_data = {};
    if (production) b4.start(old_faculty_data.length, 0);
    for (let i = 0; i < old_faculty_data.length; i++) {
        if (production) b4.update(i + 1, { filename: "Faculty Data" });
        if (old_faculty_data[i].teacherid == 0) {
            continue;
        }
        new_faculty_data[old_faculty_data[i].teacherid] = {
            "teacherid": old_faculty_data[i].teacherid,
            "name": old_faculty_data[i].name,
        };
    }
    if (production) b4.stop();
    return new_faculty_data;
}
const fetchAndSaveAll = async () => {
    await connectDB();
    if (production) b0.start(3, 0, { filename: "Connecting to MongoDB" });
    try {
        let allTables = await Tables.find({});
        fs.writeFileSync("./JSON/classsync.tables.json", JSON.stringify(allTables, null, 2), "utf8");
        if (production) b0.update(1, { filename: "Fetching Timetable Data" });
        let allRooms = await Rooms.find({});
        fs.writeFileSync("./JSON/classsync.rooms.json", JSON.stringify(allRooms, null, 2), "utf8");
        if (production) b0.update(2, { filename: "Fetching Room Data" });
        let allFaculties = await Faculties.find({});
        fs.writeFileSync("./JSON/classsync.faculties.json", JSON.stringify(allFaculties, null, 2), "utf8");
        if (production) b0.update(3, { filename: "Fetching Faculty Data" });

        return {
            "allTables": allTables,
            "allRooms": allRooms,
            "allFaculties": allFaculties
        }
    } catch (error) {
        console.error("Error fetching and saving documents:", error);
    } finally {
        if (production) b0.update(3, { filename: "Fetching Data" });
        if (production) b0.stop();
        mongoose.connection.close();
    }
};
const serverorlocal = false; // Set to false for local storage, true for server database
const ABconvert = async () => {
    if (production) b1.start(4, 0, { filename: "AB Conversion" });
    if (production) await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds to ensure room data is ready
    let old_timetable_data, old_room_data, old_faculty_data;
    if (serverorlocal) {
        let data = await fetchAndSaveAll();
        old_timetable_data = JSON.parse(JSON.stringify(data.allTables));
        old_room_data = JSON.parse(JSON.stringify(data.allRooms));
        old_faculty_data = JSON.parse(JSON.stringify(data.allFaculties));
    }
    else { // traditionally, the data is taken from the local storage use this for that and comment the above code
        if (production) b0.update(1, { filename: "Data Taken from Local Storage" });
        old_timetable_data = JSON.parse(fs.readFileSync('./JSON/classsync.tables.json', 'utf8'));
        old_room_data = JSON.parse(fs.readFileSync('./JSON/classsync.rooms.json', 'utf8'));
        old_faculty_data = JSON.parse(fs.readFileSync('./JSON/classsync.faculties.json', 'utf8'));
    }

    if (production) b1.update(1);

    if (production) await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds to ensure room data is ready
    let new_timetable_data = await converttimetable(old_timetable_data);
    if (production) b1.update(2);

    if (production) await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds to ensure room data is ready
    let new_room_data = await convertrooms(old_room_data);
    if (production) b1.update(3);

    if (production) await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds to ensure room data is ready
    let new_faculty_data = await convertfaculties(old_faculty_data);
    if (production) b1.update(4);

    fs.writeFileSync('./JSON/classsync.converted.tables.json', JSON.stringify(new_timetable_data, null, 4), 'utf8');
    fs.writeFileSync('./JSON/classsync.converted.rooms.json', JSON.stringify(new_room_data, null, 4), 'utf8');
    fs.writeFileSync('./JSON/classsync.converted.faculties.json', JSON.stringify(new_faculty_data, null, 4), 'utf8');
    if (production) b1.stop();
    if (production) multibar.stop();
}
await ABconvert();

// This takes the teacher allocated timetables, faculty data, and room data from the mongodb database in the following files:
// classsync.tables.json, classsync.faculties.json, classsync.rooms.json
// Then it converts the data into the format required by the genetic algorithm.
// The converted timetable is saved in the following files:
// ./JSON/classsync.converted.tables.json, ./JSON/classsync.converted.faculties.json, ./JSON/classsync.converted.rooms.json
// The converted timetable can be used as an input to the genetic algorithm.
// The genetic algorithm is implemented in ABconvert.js