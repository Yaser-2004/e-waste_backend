import mongoose from "mongoose";
const companySchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
});

const companymodel=mongoose.model('company',companySchema);
export default companymodel;