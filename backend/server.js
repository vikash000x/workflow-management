import express from 'express';
import cors from 'cors';
import "dotenv/config";
import { serve } from "inngest/express";
import { inngest, functions } from "./src/inngest"
import { clerkMiddleware } from '@clerk/express'
const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});