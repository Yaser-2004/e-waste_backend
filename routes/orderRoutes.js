import express from 'express';
import EWaste from '../models/waste.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

//get pending ordres
router.get("/pending-orders", async (req, res) => {
    try {
      const pendingOrders = await EWaste.find({ status: "Pending" }).populate("userId", "firstName email");
      res.json(pendingOrders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
//get processed orders
router.get("/processed-orders", async (req, res) => {
  try{
    const processedOrders = await EWaste.find({ status: "Processed" }).populate("userId", "firstName email");
    res.json(processedOrders);
  }
  catch(err){
    res.status(500).json({error:err.message});
  }
});
//recycled orders
router.get("/recycled-orders",async (req,res)=>{
  try{
    const recycledOrders = await EWaste.find({ status: "Recycled" }).populate("userId", "firstName email");
    res.json(recycledOrders);
  }
  catch(err){
    res.status(500).json({error:err.message});
  }
});
//go to store
router.get("/store", async (req, res) => {

  try{
    const products = await EWaste.find({ status: "Repaired" }).select("imageUrl cost description");
    res.json(products);
  }
  catch(err){
    res.status(500).json({error:err.message});
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
//to pick order by company
router.patch("/picked-status/:id", async (req, res) => {
  try{
    const {id}=req.params;
    const updatedWaste = await EWaste.findByIdAndUpdate(
      id,
      { status: "Processed" },
      { new: true } );
      if (!updatedWaste) {
        return res.status(404).json({ message: "E-Waste not found" });
    }
    res.status(200).json(updatedWaste);

  }
  catch(err){
    res.status(500).json({error:err.message});
  }
});
//to update reccycled status
router.patch("/picked-status/:id", async (req, res) => {
  try{
    const {id}=req.params;
    const updatedWaste = await EWaste.findByIdAndUpdate(
      id,
      { status: "Recycled" },
      { new: true } );
      if (!updatedWaste) {
        return res.status(404).json({ message: "E-Waste not found" });
    }
    res.status(200).json(updatedWaste);

  }
  catch(err){
    res.status(500).json({error:err.message});
  }
});
//to update repaired status
router.patch("/picked-status/:id",upload.single("image"), async (req, res) => {
  try{
    const {id}=req.params;
    const imageUrl = `/uploads/${req.file.filename}`;
    const updatedWaste = await EWaste.findByIdAndUpdate(
      id,
      { status: "Repaired" },
      {cost:100},
      {imageUrl},
      { new: true } );
      if (!updatedWaste) {
        return res.status(404).json({ message: "E-Waste not found" });
    }
    res.status(200).json(updatedWaste);

  }
  catch(err){
    res.status(500).json({error:err.message});
  }
});

export default router