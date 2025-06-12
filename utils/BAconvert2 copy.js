import fs from "fs";

const teacher_room_clash_map_generator = (population) => {
  let teacher_room_clash_map = {};
  for (let i = 0; i < population["data"].length; i++) {
    for (let j = 0; j < 7; j++) {
      for (let k = 0; k < 10; k++) {
        if (population["data"][i]["timetable"][j][k].teacherid == "" && population["data"][i]["timetable"][j][k].roomid == "") {
          continue;
        }
        teacher_room_clash_map[`room;${j};${k};${population["data"][i]["timetable"][j][k].roomid}`] = true;
        teacher_room_clash_map[`teacher;${j};${k};${population["data"][i]["timetable"][j][k].teacherid}`] = true;
      }
    }
  }
  population["teacher_room_clash_map"] = teacher_room_clash_map;
  return population;
};

export default check_merge_error = (timetable_data, rooms_list) => {
  let stats = {
    filled: 0,
    sameteacherskipped: 0,
    roomfail: 0,
    total: 0,
    bothfail: 0,
  };

  for (let i = 0; i < timetable_data['data'].length; i++) {
    if (timetable_data['data'][i].joint) {
      timetable_data = teacher_room_clash_map_generator(timetable_data);
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
      for (let j = 0; j < timetable_data['data'][i].timetable.length; j++) {
        for (let k = 0; k < timetable_data['data'][i].timetable[j].length; k++) {
          if (timetable_data['data'][i].timetable[j][k].roomid != "" && timetable_data['data'][i].timetable[j][k].type == "practical") {
            stats.total++;
            let otherteacherids = timetable_data['data'][i].subjects.find(
              (subject) => subject.subjectid == timetable_data['data'][i].timetable[j][k].subjectid
            ).merge_teachers;
            let currroomtype = timetable_data['data'][i].subjects.find(
              (subject) => subject.subjectid == timetable_data['data'][i].timetable[j][k].subjectid
            ).room_type;
            let roomexist = rooms_list[currroomtype].some((room) => {
              return (timetable_data['teacher_room_clash_map'][`room;${j};${k};${room.roomid}`]) ? false : true;
            });

            let teacherslot = timetable_data['teacher_room_clash_map'][`teacher;${j};${k};${otherteacherids[0]}`];
            let nextteacherslot = timetable_data['teacher_room_clash_map'][`teacher;${j};${k + 1};${otherteacherids[0]}`];

            if ((!teacherslot && !nextteacherslot) && roomexist) {
              stats.filled++;
            } else if ((teacherslot && nextteacherslot) && !roomexist) {
              stats.bothfail++;
            } else {
              if (!roomexist) stats.roomfail++;
              if (teacherslot && nextteacherslot) stats.sameteacherskipped++;
            }
            console.log(
              timetable_data['data'][i].timetable[j][k].teacherid + " " + otherteacherids + " || " +
              (teacherslot ? 'clash' : 'free') + " " + (nextteacherslot ? 'clash' : 'free') + "\t || " +
              "free room: " + roomexist
            );
            k++;
          }
        }
      }
    }
  }
  console.log("\n======================= SUMMARY =======================");
  console.log("Total slots Detected :", stats.total);
  console.log("=======================================================");
  console.log("Fillable slots       :", stats.filled);
  console.log("Teacher fail         :", stats.sameteacherskipped);
  console.log("Room Fail            :", stats.roomfail);
  console.log("Teacher & Room Fail  :", stats.bothfail);
  console.log("=======================================================");
  return ((stats.sameteacherskipped + stats.roomfail + stats.bothfail) == 0);
}

//for testing purposes (at present check the best one in the checkpoint)
// let rooms_list = JSON.parse(fs.readFileSync("./JSON/classsync.converted.rooms.json", "utf8"));
// let timetable_data = JSON.parse(fs.readFileSync("./JSON/classsync.win.chechpoint.tables.json", "utf8"));
// timetable_data = timetable_data[0];
// console.log(check_merge_error(timetable_data, rooms_list));