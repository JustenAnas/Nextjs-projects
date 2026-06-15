import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import http from "http"
import { Server } from "socket.io"
import User from "./models/user.model.js"

dotenv.config()

const app = express()
app.use(express.json())

const port = process.env.PORT || 5000
const mongodbUrl = process.env.MONGODB_URI

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
    methods: ["GET", "POST"]
  }
})

const connectDb = async () => {
  try {
    await mongoose.connect(mongodbUrl)
    console.log("db connected")
  } catch (error) {
    console.log("db error", error)
  }
}

app.post("/emit",async(req,res)=>{
  const {event,userId,data}=req.body

  try{
    const user = await User.findById(userId)
    if(user.socketId){
      io.to(user.socketId).emit(event,data)
    }
    return res.json({success:true})
  }catch(err){
    return res.json({success:false})
  }
})

io.on("connection", (socket) => {
  console.log("socket connected", socket.id)

  socket.on("identity", async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, {
        socketId: socket.id,
        isOnline: true
      })
      console.log("identity updated")
    } catch (error) {
      console.log(error)
    }
  })

  socket.on("update-location", async ({ userId, latitude, longitude }) => {
    await User.findByIdAndUpdate(userId, {
      location: {
        type: "Point",
        coordinates: [longitude, latitude]
      }
    })
  })

  socket.on("join-ride",(bookingId)=>{
    console.log("join ride",bookingId);
    socket.join(`ride-${bookingId}`)
  })

  socket.on("driver-location-update",(
    {
      bookingId,
      lat,
      lon,
      status
    }
  )=>{
    io.to(`ride-${bookingId}`).emit("driver-location",{
      lat,
      lon
    })
  })

  socket.on("chat-message",(data)=>{
    io.to(`ride-${data.bookingId}`).emit("chat-message",data)
  })
  socket.on("disconnect", () => {
  const disconnectedSocketId = socket.id

  setTimeout(async () => {
    try {
      if (mongoose.connection.readyState !== 1) return

      const user = await User.findOne({
        socketId: disconnectedSocketId
      })

      if (user) {
        await User.updateOne(
          { socketId: disconnectedSocketId },
          {
            $set: {
              socketId: null,
              isOnline: false
            }
          }
        )

        console.log("user disconnected")
      }
    } catch (err) {
      console.error("disconnect error", err)
    }
  }, 10000)
})
})

server.listen(port, () => {
  console.log("server started")
  connectDb()
})