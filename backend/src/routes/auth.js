import express from "express"
import {
  createUser,
  loginUser
} from "../services/users.js"

const router = express.Router()

router.post("/signup", async (req,res) => {
  try {
    const {username,email,password} = req.body

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      })
    }

    const user = await createUser(
      username.trim(),
      email.trim(),
      password
    )

    if (!user) {
      return res.status(409).json({
        message: "Username or email already exists"
      })
    }

    res.status(201).json(user)
  }
  catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username or email already exists"
      })
    }

    res.status(500).json({
      message: "Could not create account"
    })
  }
})

router.post("/login", async (req,res) => {
  try {
    const {email,password} = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      })
    }

    const result = await loginUser(
      email.trim(),
      password
    )

    if (!result) {
      return res.status(401).json({
        message: "Incorrect email or password"
      })
    }

    res.json(result)
  }
  catch {
    res.status(500).json({
      message: "Could not login"
    })
  }
})

export default router