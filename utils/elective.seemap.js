import fs from "fs";
import { elective_map_sample } from "./constant.js";

let new_timetable_data = JSON.parse(fs.readFileSync("./JSON/classsync.backtonormal.tables.json", "utf8"));

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const timeSlots = ["08-09", "09-10", "10-11", "11-12", "12-01", "01-02", "02-03", "03-04", "04-05", "05-06"];

let elective_map = []
for (let i = 0; i < new_timetable_data.length; i++) {
  let xx = elective_map.find((e) => e.course === new_timetable_data[i].course && e.semester === new_timetable_data[i].semester)
  if (!xx) {
    let elective_map_entry = JSON.parse(JSON.stringify(elective_map_sample));
    elective_map_entry.course = new_timetable_data[i].course;
    elective_map_entry.semester = new_timetable_data[i].semester;
    elective_map_entry.no_of_section = new_timetable_data.filter(
      (e) => e.course === new_timetable_data[i].course && e.semester === new_timetable_data[i].semester
    ).length;
    elective_map.push(elective_map_entry);
    xx = elective_map[elective_map.length - 1];
  }
  for (let j = 0; j < days.length; j++) {
    for (let k = 0; k < timeSlots.length; k++) {
      let currslot = new_timetable_data[i].schedule[days[j]][timeSlots[k]];
      if (currslot.class_id == '') {
        xx.timetable[j][k].elective_section_avail.push(new_timetable_data[i].section);
      }
    }
  }
}
fs.writeFileSync("./JSON/classsync.elective.seemap.json", JSON.stringify(elective_map, null, 4), "utf8");
