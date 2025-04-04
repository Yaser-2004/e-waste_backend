import mongoose from "mongoose";
import  bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, required: true },
});

companySchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return token;
 };

 companySchema.methods.comparePassword=async function (password) {
    return await bcrypt.compare(password,this.password); 
 }
 companySchema.statics.hashPassword=async function(password){
     return await bcrypt.hash(password,10);
 }

const CompanyModel = mongoose.model('Company', companySchema);
export default CompanyModel;
