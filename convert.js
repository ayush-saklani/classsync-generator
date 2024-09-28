import fs from 'fs';

let old_data = JSON.parse(fs.readFileSync('old_data.json', 'utf8'));
let new_data = [];
let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
let currcol = ["08-09", "09-10", "10-11", "11-12", "12-01", "01-02", "02-03", "03-04", "04-05", "05-06"];
let spare_teacher_id = 2119666;
for (let i = 0; i < old_data.length; i++) {
    let tttemp3 = [];
    for (let j = 0; j < old_data[i].teacher_subject_data.length; j++) {
        let currsub = old_data[i].teacher_subject_data[j].subjectcode;
        let skiplist = ["TCS552", "TCS531", "TCS548", "TCS591", "TCS592", "TCS565", "TCS566", "TCS561", "TCS567", "TCS592", "TCS515", "ELECTIVE", "CSP501", "SCS501", "GP501", "PCS512"];
        if (skiplist.includes(currsub)) {
            continue;
        }

        tttemp3.push({
            "subjectid": old_data[i].teacher_subject_data[j].subjectcode,
            "teacherid": old_data[i].teacher_subject_data[j].teacherid == 0 ? spare_teacher_id++ : old_data[i].teacher_subject_data[j].teacherid,
            "weekly_hrs": old_data[i].teacher_subject_data[j].weekly_hrs,
            "type": old_data[i].teacher_subject_data[j].theory_practical == "PRACTICAL" ? "practical" : "theory"
        });
    }
    let tttemp = [
        [{ "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }],
        [{ "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }],
        [{ "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }],
        [{ "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }],
        [{ "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }],
        [{ "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }],
        [{ "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }, { "classid": "", "teacherid": "", "subjectid": "", "type": "" }]
    ];

    new_data.push({
        "local_fitness": 0,
        "timetable": tttemp,
        "subjects": tttemp3,
    });
}
new_data = {
    "fitness": 0,
    "data": new_data
}
fs.writeFileSync('old_data2.json', JSON.stringify(new_data, null, 4), 'utf8');