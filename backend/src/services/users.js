import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../db/models/user.js"

export async function createUser(username,email,password) {
  const existingUser = await User.findOne({
    $or: [
      {email: email.toLowerCase()},
      {username}
    ]
  })

  if (existingUser) return null

  const passwordHash = await bcrypt.hash(password,10)

  const user = await User.create({
    username,
    email: email.toLowerCase(),
    passwordHash
  })

  return {
    id: user._id,
    username: user.username,
    email: user.email
  }
}

export async function loginUser(email,password) {
  const user = await User.findOne({
    email: email.toLowerCase()
  })

  if (!user) return null

  const validPassword = await bcrypt.compare(
    password,
    user.passwordHash
  )

  if (!validPassword) return null

  const token = jwt.sign(
    {userId: user._id.toString()},
    process.env.JWT_SECRET,
    {expiresIn: "7d"}
  )

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  }
}