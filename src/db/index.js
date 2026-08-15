import moongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDb = async () => {
    try {
        const connectionInstance = await moongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );
        console.log(
            `MongoDb connected ! host ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log(`Error while connecting to MongoDb ${error.message}`);
    }
};

export default connectDb;
