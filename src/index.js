import dotenv from "dotenv";
import connectDb from "./db/index.js";
import app from "./app.js";
import { startTaskReminderJob } from "./utils/taskReminder.js";

dotenv.config({
    path: "./.env",
});

const Port = process.env.PORT || 5000;

connectDb()
    .then(() => {
        app.listen(Port, () => {
            console.log(`Server is running on Port no. ${Port}`);
        });
        startTaskReminderJob();
    })
    .catch((err) => {
        console.log("MongoDb connection error", err);
    });
