import Tables from "./table.model.js";
import Rooms from "./room.model.js";
import Faculties from "./faculty.model.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import cliProgress from 'cli-progress';

dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DBURI);
    // console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

const save_timetable = async (wholeAssTimetableData) => {
  try {
    const { course, semester, section, schedule, teacher_subject_data } = wholeAssTimetableData;

    const section_data = await Tables.findOne({ course, semester, section });
    if (section_data) {
      await Tables.findOneAndUpdate(
        { course, semester, section },
        { $set: { schedule, teacher_subject_data } },
      );
      // console.log(`======================== Updated ======================: ${section}`);
    } else {
      await Tables.create({
        course: wholeAssTimetableData.course,
        semester: wholeAssTimetableData.semester,
        section: wholeAssTimetableData.section,
        schedule: wholeAssTimetableData.schedule,
        teacher_subject_data: wholeAssTimetableData.teacher_subject_data,
      });
      console.log(`======================== Created ======================: ${section}`);
    }
  } catch (error) {
    console.error("Error saving timetable:", error);
  }
};
const save_room = async (wholeAssRoomData) => {
  try {
    const { roomid, name, type, capacity, schedule, allowed_course } = wholeAssRoomData;

    const roomExists = await Rooms.findOne({ roomid: roomid });
    if (roomExists) {
      await Rooms.findOneAndUpdate(
        { roomid: roomid },
        {
          $set: {
            name: name,
            type: type,
            capacity: capacity,
            schedule: schedule,
            allowed_course: allowed_course,
          },
        }
      );
      // console.log(`======================== Updated ======================: ${roomid}`);
    } else {
      await Rooms.create({
        roomid: roomid,
        name: name,
        type: type,
        capacity: capacity,
        schedule: schedule,
        allowed_course: allowed_course,
      });
      await newRoom.save();
      console.log(`======================== Created ======================: ${roomid}`);
    }
  } catch (error) {
    console.error("Error saving room:", error);
  }
};
const save_faculty = async (wholeAssFacultyData) => {
  try {
    const { teacherid, name, schedule } = wholeAssFacultyData;

    const facultyExists = await Faculties.findOne({ teacherid: teacherid });
    if (facultyExists) {
      await Faculties.findOneAndUpdate(
        { teacherid: teacherid },
        { $set: { name: name, schedule: schedule } },
      );
      // console.log(`======================== Updated ======================: ${teacherid}`);
    } else {
      await Faculties.create({
        teacherid: teacherid,
        name: name,
        schedule: schedule,
      });
      console.log(`======================== Created ======================: ${teacherid}`);
    }
  } catch (error) {
    console.error("Error saving faculty:", error);
  }
};


let new_timetable_data = JSON.parse(fs.readFileSync("./JSON/classsync.backtonormal.tables.json", "utf8"));
const bar1 = new cliProgress.SingleBar({ format: '{bar} {percentage}% | {eta}s | {value}/{total} \t| Timetable Data' }, cliProgress.Presets.shades_grey);
if (new_timetable_data.length != 0) {
  await connectDB(); // Ensure DB connection
  bar1.start(new_timetable_data.length, 0);
  for (let i = 0; i < new_timetable_data.length; i++) {
    await save_timetable(new_timetable_data[i]);
    bar1.update(i + 1);
  }
  bar1.stop();
  mongoose.connection.close(); // Close connection after operation
}

let new_room_data = JSON.parse(fs.readFileSync("./JSON/classsync.backtonormal.rooms.json", "utf8"));
const bar2 = new cliProgress.SingleBar({ format: '{bar} {percentage}% | {eta}s | {value}/{total} \t| Room Data' }, cliProgress.Presets.shades_grey);
if (new_room_data.length != 0) {
  await connectDB();
  bar2.start(new_room_data.length, 0);
  for (let i = 0; i < new_room_data.length; i++) {
    await save_room(new_room_data[i]);
    bar2.update(i + 1);
  }
  bar2.stop();
  mongoose.connection.close();
}

let new_faculty_data = JSON.parse(fs.readFileSync("./JSON/classsync.backtonormal.faculties.json", "utf8"));
const bar3 = new cliProgress.SingleBar({ format: '{bar} {percentage}% | {eta}s | {value}/{total} \t| Faculty Data' }, cliProgress.Presets.shades_grey);
if (new_faculty_data.length != 0) {
  await connectDB();
  bar3.start(new_faculty_data.length, 0);
  for (let i = 0; i < new_faculty_data.length; i++) {
    await save_faculty(new_faculty_data[i]);
    bar3.update(i + 1);
  }
  bar3.stop();
  mongoose.connection.close();
}