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

const upload = multer({ storage });

//get by id
router.get("/order/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await EWaste.findById(orderId).populate("userId", "firstName email");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET /product-info
router.get("/product-info", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status.toLowerCase() !== "all") {
      filter.status = status;
    }

    const orders = await EWaste.find(filter).select("_id itemName location createdAt status");

    const result = orders.map(item => ({
      _id: item._id, // ✅ raw MongoDB ID (used for updates)
      itemName: item.itemName,
      location: item.location,
      date: item.createdAt,
      status: item.status,
    }));

    res.status(200).json(result);
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
//to change status of order
router.patch("/picked-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log("Received status:", status);
    console.log("Received ID:", id);
    
    const updateData = { status };
    if (status === "Repaired") {
      updateData.cost = 100;
    }

    const updatedWaste = await EWaste.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedWaste) {
      return res.status(404).json({ message: "E-Waste not found" });
    }

    res.status(200).json(updatedWaste);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//to update repaired status
router.patch("/picked-status/:id",upload.single("image"), async (req, res) => {
  try{
    const {id}=req.params;
    const imageUrl = `/uploads/${req.file.filename}`;
    const updatedWaste = await EWaste.findByIdAndUpdate(
      id,
      {
        status: "Repaired",
        cost: 100,
        imageUrl
      },

    const updatedWaste = await EWaste.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedWaste) {
      return res.status(404).json({ message: "E-Waste not found" });
    }

    res.status(200).json(updatedWaste);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//to buy product
router.delete("/buy/:id",async (req,res)=>{
  try{
    const {id}=req.params;
    const deletewaste=await EWaste.findByIdAndDelete(id);
    if(!deletewaste){
      return res.status(404).json({message:"E-Waste not found"});
    }
    res.status(200).json({message:"E-Waste item deleted successfully"});

  }
  catch(err){
    res.status(500).json({error:err.message});
  }
});


// GET /product-info
router.get("/product-info", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status.toLowerCase() !== "all") {
      filter.status = status;
    }

    const orders = await EWaste.find(filter).select("_id itemName location createdAt status");

    const result = orders.map(item => ({
      _id: item._id, // ✅ raw MongoDB ID (used for updates)
      itemName: item.itemName,
      location: item.location,
      date: item.createdAt,
      status: item.status,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router