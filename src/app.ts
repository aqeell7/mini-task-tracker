import express from "express"
import type { Application } from "express"
import cors from "cors"
import authRoutes from "./routes/auth.routes.js"
import taskRoutes from "./routes/task.routes.js"

const app: Application = express()

app.use(express.json())
app.use(cors())

app.use("/api/auth", authRoutes);
app.use("/health",(req,res)=>res.sendStatus(200))
app.use("/api/tasks", taskRoutes)
app.use((err: any, req: any, res: any, next: any) => {
  console.error(" SERVER CRASHED WITH ERROR:", err);
  console.error(" STACK TRACE:", err.stack);
  res.status(500).send("Internal Server Error");
});

export default app;
