import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./config/db.js" 
import { connectRedis } from "./config/redis.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async ()=>{
  await connectDB();
  await connectRedis();
}

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`)
})