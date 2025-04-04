// companyControls.js
import CompanyModel from "../models/company.js";
import createCompany from "../services/companyServices.js";
import { validationResult } from "express-validator";
import BlacklistToken from "../models/blacklisttoken.js";

export async function registerCompany(req, res) {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ message: error.array() });
    }

    const { companyName, email, password, location } = req.body;
    const existing = await CompanyModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Company with this email already exists" });
    }
    const newpassword=await CompanyModel.hashPassword(password);
    const newCompany = await createCompany({ companyName, email, password:newpassword, location });
    if (!newCompany) {
      return res.status(500).json({ message: "Error creating company" });
    }

    const token = await newCompany.generateAuthToken();
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ token, newCompany });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function loginCompany(req, res) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  const { email, password } = req.body;
  const company = await CompanyModel.findOne({ email });

  if (!company) {
    return res.status(400).json({ message: "Company not found" });
  }

  const valid = await company.comparePassword(password);
  if (!valid) {
    return res.status(400).json({ message: "Invalid password or email" });
  }

  const token = await company.generateAuthToken();
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({ token, company });
}

export async function getCompany(req, res) {
  return res.status(200).json({ company: req.company });
}

export async function logoutCompany(req, res, next) {
  try {
    res.clearCookie("token");
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    await BlacklistToken.create({ token });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
