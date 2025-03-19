import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import env from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = 5000;

//middleware
app.use(express.json());
app.use(cors());
env.config();

//mongoDb connection
mongoose
    .connect('mongodb+srv://yasersiddiquee:yjeu3vw2ZGKipwL3@cluster0.gk8fn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log("Mongo connection error --->", err));



//routes
app.use('/api/auth', userRoutes);


app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})