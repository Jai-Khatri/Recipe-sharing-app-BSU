import express from "express"
import mongoose from "mongoose"

import {
  createRecipe,
  listRecipes,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  likeRecipe,
  unlikeRecipe
} from "../services/recipes.js"

import {
  requireAuth,
  optionalAuth
} from "../middleware/auth.js"

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const recipes = await listRecipes(req.query.sort)
    res.json(recipes)
  }
  catch {
    res.status(500).json({
      message: "Could not load recipes"
    })
  }
})

router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const recipe = await getRecipe(req.params.id)

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found"
      })
    }

    const data = recipe.toObject()
    const likes = data.likes || []

    const likedByMe = req.user
      ? likes.some(id => id.toString() === req.user.userId)
      : false

    delete data.likes

    res.json({
      ...data,
      likeCount: likes.length,
      likedByMe
    })
  }
  catch {
    res.status(400).json({
      message: "Could not load recipe"
    })
  }
})

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, ingredients, imageUrl } = req.body

    if (!title || !imageUrl || !Array.isArray(ingredients) || !ingredients.length) {
      return res.status(400).json({
        message: "Title, ingredients and image are required"
      })
    }

    const recipe = await createRecipe(
      { title, ingredients, imageUrl },
      req.user.userId
    )

    await recipe.populate("owner", "username")

    res.status(201).json(recipe)
  }
  catch {
    res.status(400).json({
      message: "Could not create recipe"
    })
  }
})

router.post("/:id/like", requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid recipe ID"
    })
  }

  try {
    const recipe = await likeRecipe(
      req.params.id,
      req.user.userId
    )

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found"
      })
    }

    res.json({
      likeCount: recipe.likes.length,
      likedByMe: true
    })
  }
  catch {
    res.status(500).json({
      message: "Could not like recipe"
    })
  }
})

router.delete("/:id/like", requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid recipe ID"
    })
  }

  try {
    const recipe = await unlikeRecipe(
      req.params.id,
      req.user.userId
    )

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found"
      })
    }

    res.json({
      likeCount: recipe.likes.length,
      likedByMe: false
    })
  }
  catch {
    res.status(500).json({
      message: "Could not unlike recipe"
    })
  }
})

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { title, ingredients, imageUrl } = req.body

    if (!title || !imageUrl || !Array.isArray(ingredients) || !ingredients.length) {
      return res.status(400).json({
        message: "Title, ingredients and image are required"
      })
    }

    const recipe = await updateRecipe(
      req.params.id,
      req.user.userId,
      { title, ingredients, imageUrl }
    )

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found"
      })
    }

    res.json(recipe)
  }
  catch {
    res.status(400).json({
      message: "Could not update recipe"
    })
  }
})

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const recipe = await deleteRecipe(
      req.params.id,
      req.user.userId
    )

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found"
      })
    }

    res.json({
      message: "Recipe deleted"
    })
  }
  catch {
    res.status(400).json({
      message: "Could not delete recipe"
    })
  }
})

export default router