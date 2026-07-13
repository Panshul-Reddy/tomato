import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import riderRoutes from './routes/rider.js'
import { connectRabbitMQ } from './config/rabbitmq.js'
import cors from 'cors'
import { startOrderReadyConsumer } from './config/orderReady.consumer.js'
dotenv.config()
const app=express()

await connectRabbitMQ()
startOrderReadyConsumer()
app.use(express.json());
app.use(cors());
app.use("/api/rider",riderRoutes)

app.listen(process.env.PORT,()=>{
    console.log(`rider service is running on port ${process.env.PORT}`)
    connectDB()
})