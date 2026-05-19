const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "tutoring",       // مذاكرة / شرح مادة
        "translation",    // ترجمة
        "design",         // تصميم
        "programming",    // برمجة
        "writing",        // كتابة / تلخيص
        "photography",    // تصوير
        "other",
      ],
    },
    price: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "EGP",
      },
      type: {
        type: String,
        enum: ["fixed", "per_hour"],
        default: "fixed",
      },
    },
    deliveryTime: {
      value: { type: Number, required: true }, // e.g. 2
      unit: {
        type: String,
        enum: ["hours", "days"],
        default: "days",
      },
    },
    tags: [{ type: String, trim: true }],
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for search & filtering
serviceSchema.index({ title: "text", description: "text", tags: "text" });
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ "rating.average": -1 });

module.exports = mongoose.model("Service", serviceSchema);