import mongoose from "mongoose";

const eWasteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String},
  description: { type: String, required: true },
  operation: { type: String, enum: ["Recycle", "Destroy", "Repair"], required: true },
  status: { type: String, enum: ["Pending", "Processed", "Recycled", "Repaired"], default: "Pending" },
  location: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  cost:{type:Number,default:0}
});


const wasteModel = mongoose.model("EWaste", eWasteSchema);
export default wasteModel
