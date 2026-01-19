import express from 'express';
import dotenv from 'dotenv';
import healthRoutes from "./src/routes/health.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import cors from "cors";


import { connectDB } from './config/db.js';
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors()); 
app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);


app.get('/', (req, res) => {
    res.send("Hello World");
});

connectDB();

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});