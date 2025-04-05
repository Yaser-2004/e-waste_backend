import mongoose from "mongoose";
import  bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
    ecoPoints: {type: Number, default: 0},
    createdAt: { type: Date, default: Date.now },
});
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return token;
 };
 
userSchema.methods.comparePassword=async function (password) {
   return await bcrypt.compare(password,this.password); 
}
userSchema.statics.hashPassword=async function(password){
    return await bcrypt.hash(password,10);
}

// const userModel=mongoose.model('user',userSchema);



const UserModel = mongoose.model("User", userSchema);
export default UserModel