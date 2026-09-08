import cron from "node-cron";
import PlannerTask from "../models/plannerTask.model.js";
import User from "../models/user.model.js";
import { sendPushNotification } from "../utils/sendNotifications.js";

export const startTaskReminderJob = () => {
    cron.schedule("0 9 * * *", async () => {
        console.log("Running task reminder job...");
        try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const tasks = await PlannerTask.find({
                status: "pending",
                dueDate: { $gte: startOfDay, $lte: endOfDay },
            });

            for (const task of tasks) {
                const user = await User.findById(task.owner);
                if (user?.fcmToken) {
                    await sendPushNotification(
                        user.fcmToken,
                        "Task Due Today",
                        `Don't forget: ${task.title}`,
                        { screen: "planner" }
                    );
                }
            }

            console.log(
                `Task reminder job: notified for ${tasks.length} tasks`
            );
        } catch (error) {
            console.log("Error in task reminder job:", error);
        }
    });
};
