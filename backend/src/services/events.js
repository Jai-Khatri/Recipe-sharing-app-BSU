import mongoose from "mongoose"
import { Event } from "../db/models/event.js"

export async function recordRecipeView(recipeId) {
  return await Event.create({
    recipe: recipeId,
    type: "view"
  })
}

export async function getRecipeViewStats(recipeId) {
  const id = new mongoose.Types.ObjectId(recipeId)

  const [result] = await Event.aggregate([
    {
      $match: {
        recipe: id,
        type: "view"
      }
    },
    {
      $facet: {
        total: [
          {
            $count: "count"
          }
        ],

        daily: [
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: "UTC"
                }
              },
              views: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              views: 1
            }
          }
        ]
      }
    }
  ])

  return {
    totalViews: result.total[0]?.count || 0,
    dailyViews: result.daily
  }
}