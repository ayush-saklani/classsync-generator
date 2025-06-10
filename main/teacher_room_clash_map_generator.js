import fs from "fs";

const teacher_room_clash_map_generator = (population, showstats = false) => {
  for (let x = 0; x < population.length; x++) {
    let teacher_room_clash_map = {};
    for (let i = 0; i < population[x]["data"].length; i++) {
      for (let j = 0; j < 7; j++) {
        for (let k = 0; k < 10; k++) {
          if (
            population[x]["data"][i]["timetable"][j][k].teacherid == "" &&
            population[x]["data"][i]["timetable"][j][k].roomid == ""
          )
            continue;
          let room_checker = "room" + ";" + j + ";" + k + ";" + population[x]["data"][i]["timetable"][j][k].roomid;
          let teacher_checker = "teacher" + ";" + j + ";" + k + ";" + population[x]["data"][i]["timetable"][j][k].teacherid;
          // if (teacher_room_clash_map[room_checker] || teacher_room_clash_map[teacher_checker]) {
          //   console.log("Conflict found at " + i + " " + j + " " + k);
          // }
          teacher_room_clash_map[room_checker] = true;
          teacher_room_clash_map[teacher_checker] = true;
        }
      }
    }
    population[x]["teacher_room_clash_map"] = teacher_room_clash_map;
  }
  if (showstats) {
    for (let i = 0; i < population.length; i++) {
      process.stdout.write(Object.keys(population[i]["teacher_room_clash_map"]).length + " ");
    }
    console.log();
  }
  return population;
};

export default teacher_room_clash_map_generator;

// example usage:
let population = JSON.parse(fs.readFileSync("./JSON/classsync.win.chechpoint.tables.json", "utf8"));
population = teacher_room_clash_map_generator(population);
// fs.writeFileSync('./JSONdata/teacher_room_clash_map.json', JSON.stringify(population, null, 4), 'utf8');

