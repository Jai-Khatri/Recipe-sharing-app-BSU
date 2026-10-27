import { Recipe } from "../db/models/recipe.js"

export async function createRecipe(data,userId) {
  return await Recipe.create({
    title: data.title,
    ingredients: data.ingredients,
    imageUrl: data.imageUrl,
    owner: userId
  })
}

export async function listRecipes() {
  return await Recipe.find()
    .populate("owner","username")
    .sort({createdAt: -1})
}

export async function getRecipe(id) {
  return await Recipe.findById(id)
    .populate("owner","username")
}

export async function updateRecipe(id,userId,data) {
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
  ).populate("owner","username")
}

export async function deleteRecipe(id,userId) {
  return await Recipe.findOneAndDelete({
    _id: id,
    owner: userId
  })
}