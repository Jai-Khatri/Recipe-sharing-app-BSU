import "dotenv/config"
import express from "express"
import cors from "cors"

import { connectDb } from "./db/init.js"
import authRouter from "./routes/auth.js"
import recipesRouter from "./routes/recipes.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth",authRouter)
app.use("/api/recipes",recipesRouter)

app.get("/api/health",(req,res) => {
  res.json({
    message: "Recipe API running"
  })
})

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing")
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing")
  }

  await connectDb()

  const port = process.env.PORT || 3000

  app.listen(port,"0.0.0.0",() => {
    console.log(`Server running on port ${port}`)
  })
}

start().catch(console.error)