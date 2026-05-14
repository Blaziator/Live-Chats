import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import {createServer} from 'node:http';

import dotenv from 'dotenv';
dotenv.config();

//Local Import
import connectToSocket from './controllers/socketManager.js';
import router from './routes/users.route.js';

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
const port = app.get("port");

app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

app.use("/api/v1/users", router);

app.get('/', (req, res)=>{
    res.send("Welcome")
})

const start = async()=>{
    const connectionDB = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDB connected to DB Host: ${connectionDB.connection.host}`);
    server.listen(port, ()=>{
        console.log(`Server is listening on port: http://localhost:${port}/`);
    })
}
start();