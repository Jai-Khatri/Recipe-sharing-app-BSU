import "dotenv/config"
import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"

import { connectDb } from "./db/init.js"

import authRouter from "./routes/auth.js"
import recipesRouter from "./routes/recipes.js"
import eventsRouter from "./routes/events.js"

const app = express()
const server = createServer(app)

const io = new Server(server)

app.set("io",io)

app.use(cors())
app.use(express.json())

app.use("/api/auth",authRouter)
app.use("/api/recipes",eventsRouter)
app.use("/api/recipes",recipesRouter)

app.get("/api/health",(req,res) => {
  res.json({
    message: "Recipe API running"
  })
})

io.on("connection",socket => {
  console.log("Socket connected:",socket.id)

  socket.on("disconnect",() => {
    console.log("Socket disconnected:",socket.id)
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

  server.listen(port,"0.0.0.0",() => {
    console.log(`Server running on port ${port}`)
  })
}

start().catch(error => {
  console.error(error)
  process.exitCode = 1
})