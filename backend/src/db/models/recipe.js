import mongoose, { Schema } from "mongoose"

const recipeSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  ingredients: {
    type: [String],
    required: true
  },

  imageUrl: {
    type: String,
    required: true
  },

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {timestamps: true})

export const Recipe = mongoose.model("Recipe",recipeSchema)