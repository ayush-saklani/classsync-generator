import Tables from "./table.model.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DBURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

const save_timetable = async (wholeAssTimetableData) => {
  try {
    const { course, semester, section, schedule, teacher_subject_data } =
      wholeAssTimetableData;

    const section_data = await Tables.findOne({ course, semester, section });

    if (section_data) {
      await Tables.findOneAndUpdate(
        { course, semester, section },
        { $set: { schedule, teacher_subject_data } },
      );
      console.log(
        `======================== Updated ======================: ${section}`,
      );
    } else {
      await Tables.create({
        course: wholeAssTimetableData.course,
        semester: wholeAssTimetableData.semester,
        section: wholeAssTimetableData.section,
        schedule: wholeAssTimetableData.schedule,
        teacher_subject_data: wholeAssTimetableData.teacher_subject_data,
      });
      console.log(
        `======================== Created ======================: ${section}`,
      );
    }
  } catch (error) {
    console.error("Error saving timetable:", error);
  }
};
let new_timetable_data = JSON.parse(
  fs.readFileSync("../classsync.backtonormal.tables.json", "utf8"),
);
if (new_timetable_data.length != 0) {
  await connectDB(); // Ensure DB connection
  for (let i = 0; i < new_timetable_data.length; i++) {
    await save_timetable(new_timetable_data[i]);
  }
  mongoose.connection.close(); // Close connection after operation
}

export default save_timetable;

