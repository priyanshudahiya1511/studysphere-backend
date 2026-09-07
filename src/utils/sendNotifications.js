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
        };
        const response = await admin.messaging().send(message);
        console.log("Notification sent:", response);
        return response;
    } catch (error) {
        console.log("Error sending notification:", error);
        throw error;
    }
};
