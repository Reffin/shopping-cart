const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  items: [
    {
      product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name:     { type: String, required: true },
      price:    { type: Number, required: true },
      qty:      { type: Number, required: true, min: 1 },
      image:    { type: String },
    }
  ],
  total:       { type: Number, required: true },
  status:      { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
  address: {
    fullName: { type: String, required: true },
    street:   { type: String, required: true },
    city:     { type: String, required: true },
    zip:      { type: String, required: true },
  },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);