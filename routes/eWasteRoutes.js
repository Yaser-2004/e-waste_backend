import express from 'express';
import multer from 'multer';
import EWaste from '../models/waste.js';
import User from '../models/User.js';
import { authUser } from '../middlewares/auth.middleware.js';

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

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { userId, itemName, description, operation } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const imagePath = req.file ? req.file.path : null;

    const newWaste = new EWaste({
      userId,
      itemName,
      description,
      imageUrl: imagePath, 
      operation,
      location: user.location,
    });

    await newWaste.save();
    res.status(201).json({ message: "E-Waste item uploaded successfully", newWaste });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/count', authUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await EWaste.countDocuments({ userId });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export default router;
