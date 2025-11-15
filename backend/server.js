import express from 'express';
import cors from 'cors';
import "dotenv/config";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js" 
import { clerkMiddleware } from '@clerk/express'
import workspaceRouter from './routes/workspaceRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import projectRouter from './routes/projectRoutes.js';
import taskRouter from './routes/taskRoutes.js';
import commentRouter from './routes/commentRoutes.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));


app.use('/api/workspaces',protect, workspaceRouter);
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

 app.use("/api/projects", protect, projectRouter)

app.use("/api/tasks", protect, taskRouter)


 app.use("/api/comments", protect, commentRouter)

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});