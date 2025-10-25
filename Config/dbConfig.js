import mongoose from "mongoose";

export default function connectDB() {
        mongoose.connect(`mongodb://localhost:27017/suhas`).then((e) => {
        console.log("Connected!");
    })
}