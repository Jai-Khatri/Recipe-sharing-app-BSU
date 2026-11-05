import express from "express"
import mongoose from "mongoose"
import { Recipe } from "../db/models/recipe.js"

import {
  recordRecipeView,
  getRecipeViewStats
} from "../services/events.js"

const router = express.Router()

router.post("/:id/views", async (req,res) => {
  const id = req.params.id

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid recipe ID"
    })
  }

  try {
    const recipe = await Recipe.exists({ _id: id })

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found"
      })
    }

    await recordRecipeView(id)

    const stats = await getRecipeViewStats(id)

    res.status(201).json(stats)
  }
  catch {
    res.status(500).json({
      message: "Could not record view"
    })
  }
})

router.get("/:id/stats", async (req,res) => {
  const id = req.params.id

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid recipe ID"
    })
  }

  try {
    const recipe = await Recipe.exists({ _id: id })

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found"
      })
    }

    const stats = await getRecipeViewStats(id)

    res.json(stats)
  }
  catch {
    res.status(500).json({
      message: "Could not load statistics"
    })
  }
})

export default router