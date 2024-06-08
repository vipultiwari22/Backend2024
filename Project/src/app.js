import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userrouter from './routes/User.routes.js';
import Subscriberouter from './routes/Subscription.route.js';


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
app.use('/api/v1/user', userrouter);
app.use('/api/v1/subscribe', Subscriberouter)

export { app };
