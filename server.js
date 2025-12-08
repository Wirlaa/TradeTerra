import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import { fileURLToPath } from "url"
import userRouter from './src/routes/userRoutes.js'
import viewRouter from './src/routes/viewRoutes.js'
import dataRouter from './src/routes/dataRoutes.js'
import statsRouter from './src/routes/statsRoutes.js'

dotenv.config()

mongoose.connection.once("open", () => {console.log("Connected to MongoDB")})
mongoose.connection.on('error', console.error.bind(console,'MongoDB connection error'))
// mongoose.set('strictQuery', false) //true means that only fields defined in your schema can be used in queries
mongoose.connect(process.env.MONGODB_URI)

const app = express()
app.use(express.json())
// app.use(cors({
//     origin: process.env.ORIGIN,
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
// }))

app.set('view engine', 'ejs')
app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))))
app.use("/", viewRouter)
app.use("/api/users", userRouter)
app.use("/api/data", dataRouter)
app.use("/api/stats", statsRouter)

// app.get('/', (req, res) => {
//     res.send('Hello World from Express!')
// })

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))
