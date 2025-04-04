import UserModel from "../models/User.js";
import createUser from "../services/userservices.js";
import { validationResult } from "express-validator";
import BlacklistToken from "../models/blacklisttoken.js";


export async function registerUser(req,res,next) {
    try{
        const error=validationResult(req);
        if(!error.isEmpty()) {
            return res.status(400).json({message: error.array()});
        }
        const {firstName, lastName, email, password, location}=req.body;
        const existing=await UserModel.findOne({email});
        if(existing) {
            return res.status(400).json({message: "User with this email already exists"});
        }
        const newpassword=await UserModel.hashPassword(password);
        const newUser=await createUser({firstName, lastName, email,password:newpassword, location});
        if(!newUser) {
            return res.status(500).json({message: "Error creating user"});
        }
        const token=await newUser.generateAuthToken();
        console.log(token);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, 
            sameSite: "Lax",
            maxAge: 24 * 60 * 60 * 1000
          });
          
        return res.status(201).json({token,newUser});
    }
    catch(err) {
        res.status(500).json({message: err.message});
    }
    
}



export async function loginUser(req,res,next) {
    const error=validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({error: error.array()});
    }
    const {email,password}=req.body;
    const user=await UserModel.findOne({email});
    console.log("--------->", user);
    
    if(!user) {
        return res.status(400).json({message: "User not found"});
    }
    const valid=await user.comparePassword(password);
    if(!valid) {
        return res.status(400).json({message: "Invalid Password or email"});
    }
    const token=await user.generateAuthToken();
    res.cookie("token", token, {
        httpOnly: true,
        secure: false, 
        sameSite: "Lax",
        maxAge: 24 * 60 * 60 * 1000
      });
    return res.status(200).json({token,user});
}



export async function getUser(req,res,next) {
    return res.status(200).json({user: req.user});
}



export async function logoutUser(req,res,next) {
    try{
        res.clearCookie('token');
        const token=req.cookies?.token||req.headers.authorization.split(" ")[1];
        await BlacklistToken.create({token});
        res.status(200).json({message: "Logged out successfully"});
    }
    catch(err) {
        res.status(500).json({message: err.message});
    }
}