// --- Import Dependencies ---
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv'; // ✅ Recommended for environment variables

// --- Import Routes & Handlers ---
import roomHandler from './socket/roomHandler.js';
import authRoutes from './routes/auth.js';

// --- Config ---
dotenv.config(); // ✅ Loads .env variables
const app = express();
const PORT = process.env.PORT || 6001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/video_conferencing_app';



// --- Middleware ---
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(cors());

// --- Routes ---
app.use('/auth', authRoutes);

// --- Create HTTP Server ---
const server = http.createServer(app);

// --- Setup Socket.IO ---
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// --- Socket Event Handling ---
io.on("connection", (socket) => {
    console.log("User connected");

    roomHandler(socket); // ✅ Your socket logic

    socket.on('disconnect', () => {
        console.log("User disconnected");
    });
});

// --- Connect to MongoDB and Start Server ---
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
});
