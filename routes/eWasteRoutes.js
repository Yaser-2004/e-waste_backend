import express from 'express';
import multer from 'multer';
import EWaste from '../models/waste.js';
import User from '../models/User.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload",  async (req, res) => {
  try {
    const { userId, description, operation } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newWaste = new EWaste({
      userId,
      description,
      operation,
      location: user.location,
    });

    await newWaste.save();
    res.status(201).json({ message: "E-Waste item uploaded successfully", newWaste });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export default router;
