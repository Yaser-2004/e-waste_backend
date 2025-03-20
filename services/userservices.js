import UserModel from "../models/User.js";

async function createUser({firstName, lastName, email, password}) {
    try{
        if(!firstName || !lastName || !email || !password) {
            throw new Error("Missing input parameters");
        }
        const existing =await UserModel.findOne({email});
    if(existing) {
        throw new Error("User with this email already exists");
    }
    const newUser=new UserModel({firstName,lastName,email,password});
    await newUser.save();
    return newUser;
    }
    catch(err) {
        throw new Error(err.message);
    }   
}
export default createUser

