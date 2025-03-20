import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import BlacklistToken from "../models/blacklisttoken.js";

export async function authUser(req, res, next) {
    try{
        const token=req.cookies?.token||req.headers.authorization?.split(" ")[1];
        if(!token){
            return res.status(401).json({message: "No token provided , please login"});
        }
        const blacklist=await BlacklistToken.findOne({token});
        if(blacklist){
            return res.status(401).json({message: "Token expired, please login"});
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await UserModel.findById(decoded._id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        req.user=user;
        next();
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}