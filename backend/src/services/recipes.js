import { Recipe } from "../db/models/recipe.js"
import { Event } from "../db/models/event.js"

export async function createRecipe(data, userId) {
  return await Recipe.create({
    title: data.title,
    ingredients: data.ingredients,
    imageUrl: data.imageUrl,
    owner: userId
  })
}

export async function listRecipes(sort = "newest") {
  let order = { createdAt: -1 }

  if (sort === "least") {
    order = { likeCount: 1, createdAt: -1 }
  }

  if (sort === "popular") {
    order = { likeCount: -1, createdAt: -1 }
  }

  return await Recipe.aggregate([
    {
      $addFields: {
        likeCount: {
          $size: { $ifNull: ["$likes", []] }
        }
      }
    },
    {
      $sort: order
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerInfo"
      }
    },
    {
      $unwind: {
        path: "$ownerInfo",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        title: 1,
        ingredients: 1,
        imageUrl: 1,
        createdAt: 1,
        likeCount: 1,
        owner: {
          _id: "$ownerInfo._id",
          username: "$ownerInfo.username"
        }
      }
    }
  ])
}

export async function getRecipe(id) {
  return await Recipe.findById(id)
    .populate("owner", "username")
}

export async function updateRecipe(id, userId, data) {
  return await Recipe.findOneAndUpdate(
    {
      _id: id,
      owner: userId
    },
    {
      title: data.title,
      ingredients: data.ingredients,
      imageUrl: data.imageUrl
    },
    {
      new: true,
      runValidators: true
    }
  ).populate("owner", "username")
}

export async function deleteRecipe(id, userId) {
  const recipe = await Recipe.findOneAndDelete({
    _id: id,
    owner: userId
  })

  if (recipe) {
    await Event.deleteMany({ recipe: recipe._id })
  }

  return recipe
}

export async function likeRecipe(id, userId) {
  return await Recipe.findByIdAndUpdate(
    id,
    { $addToSet: { likes: userId } },
    { new: true }
  )
}

export async function unlikeRecipe(id, userId) {
  return await Recipe.findByIdAndUpdate(
    id,
    { $pull: { likes: userId } },
    { new: true }
  )
}