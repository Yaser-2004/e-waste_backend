import express from 'express'
import User from '../models/User.js'

const router = express.Router();


router.post('/register', async (req, res) => {     //registering
    const { firstName, lastName, email, password } = req.body;

    try {
        const newUser = new User({ firstName, lastName, email, password });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to create user' });
    }
});


export default router;