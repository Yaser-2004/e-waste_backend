import mongoose from "mongoose";

const eWasteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
  operation: { type: String, enum: ["Recycle", "Destroy", "Repair"], required: true },
  status: { type: String, enum: ["Pending", "Processing", "Accepted", "For Sale"], default: "Pending" },
  location: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});


const wasteModel = mongoose.model("EWaste", eWasteSchema);
export default wasteModel
