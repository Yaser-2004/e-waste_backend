import express from "express";
import { registerCompany, loginCompany, logoutCompany } from "../controls/companyControls.js";
import { authCompany } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/register", registerCompany);
router.post("/login", loginCompany);
router.post("/logout", authCompany, logoutCompany);

// Protected route example
router.get("/dashboard", authCompany, (req, res) => {
  res.json({ message: "Welcome to the company dashboard", company: req.company });
});

export default router;