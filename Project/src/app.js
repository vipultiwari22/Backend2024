import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/User.routes.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true // Corrected typo here
}));

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Route declaration
app.use('/api/v1/user', router);

export { app };
