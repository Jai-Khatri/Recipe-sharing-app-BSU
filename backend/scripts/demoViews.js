import "dotenv/config"
import mongoose from "mongoose"

import { Recipe } from "../src/db/models/recipe.js"
import { Event } from "../src/db/models/event.js"

async function main() {
  const recipeId = process.argv[2]

  if (!mongoose.isValidObjectId(recipeId)) {
    throw new Error("Provide a valid recipe ID")
  }

  await mongoose.connect(process.env.MONGODB_URI)

  try {
    const recipe = await Recipe.findById(recipeId)

    if (!recipe) {
      throw new Error("Recipe not found")
    }

    await Event.deleteMany({
      recipe: recipe._id,
      source: "demo"
    })

    const counts = [3,5,2,4]
    const events = []

    for (let i = 0; i < counts.length; i++) {
      const date = new Date()

      date.setUTCHours(12,0,0,0)
      date.setUTCDate(date.getUTCDate() - (counts.length - i))

      for (let j = 0; j < counts[i]; j++) {
        events.push({
          recipe: recipe._id,
          type: "view",
          source: "demo",
          createdAt: date
        })
      }
    }

    await Event.insertMany(events)

    console.log(`Added ${events.length} demo views to ${recipe.title}`)
  }
  finally {
    await mongoose.disconnect()
  }
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})