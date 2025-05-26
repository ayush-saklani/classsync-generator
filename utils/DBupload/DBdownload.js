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
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

const bar1 = new cliProgress.SingleBar({ format: '{bar} {percentage}% | {eta}s | {value}/{total} \t| Timetable Data' }, cliProgress.Presets.shades_grey);
const fetchAndSaveAll = async () => {
  await connectDB();
  bar1.start(3, 0);
  try {
    const allTables = await Tables.find({});
    fs.writeFileSync("./JSON/classsync.tables.json", JSON.stringify(allTables, null, 2), "utf8");
    bar1.update(1);
    const allRooms = await Rooms.find({});
    fs.writeFileSync("./JSON/classsync.rooms.json", JSON.stringify(allRooms, null, 2), "utf8");
    bar1.update(2);
    const allFaculties = await Faculties.find({});
    fs.writeFileSync("./JSON/classsync.faculties.json", JSON.stringify(allFaculties, null, 2), "utf8");
    bar1.update(3);
    console.log("\nAll documents fetched and saved to JSON files.");
  } catch (error) {
    console.error("Error fetching and saving documents:", error);
  } finally {
    bar1.stop();
    mongoose.connection.close();
  }
};

fetchAndSaveAll();