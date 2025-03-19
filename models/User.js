import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ecoPoints: {type: Number, default: 0},
});




const User = mongoose.model("User", UserSchema);
export default User