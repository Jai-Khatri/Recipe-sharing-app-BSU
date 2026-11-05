import mongoose, { Schema } from "mongoose"

const eventSchema = new Schema({
  recipe: {
    type: Schema.Types.ObjectId,
    ref: "Recipe",
    required: true
  },

  type: {
    type: String,
    default: "view",
    required: true
  },

  source: {
    type: String,
    enum: ["live", "demo"],
    default: "live"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

eventSchema.index({ recipe: 1, type: 1, createdAt: 1 })

export const Event = mongoose.model("Event", eventSchema)