import admin from "./firebase.js";

export const sendPushNotification = async (
    fcmToken,
    title,
    body,
    data = {}
) => {
    try {
        const message = {
            token: fcmToken,
            notification: { title, body },
            data,
            android: {
                priority: "high",
                notification: {
                    channelId: "default",
                    sound: "default",
                },
            },
        };
        console.log("SENDING MESSAGE:", JSON.stringify(message, null, 2)); // ← add this
        const response = await admin.messaging().send(message);
        console.log("Notification sent:", response);
        return response;
    } catch (error) {
        console.log("Error sending notification:", error);
        throw error;
    }
};
