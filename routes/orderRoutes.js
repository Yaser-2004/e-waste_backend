import express from 'express';
import EWaste from '../models/waste.js';

const router = express.Router();


//get pending ordres
router.get("/pending-orders", async (req, res) => {
    try {
      const pendingOrders = await EWaste.find({ status: "Pending" }).populate("userId", "firstName email");
      res.json(pendingOrders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});


//get all orders
router.get("/all", async (req, res) => {
    try {
        const allOrders = await EWaste.find().populate("userId", "firstName email");
        res.status(200).json(allOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default router