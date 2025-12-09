import express from 'express'
import dotenv from 'dotenv'
<<<<<<< Updated upstream
import cors from 'cors'
=======
import mongoose from 'mongoose'
>>>>>>> Stashed changes
import { fileURLToPath } from "url"
import userRouter from './routes/userRoutes.js'
import viewRouter from './routes/viewRoutes.js'
import dataRouter from './routes/dataRoutes.js'

dotenv.config()
const app = express()

app.use(express.json())

app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))))
app.use("/", viewRouter)
app.use("/api/users", userRouter)
app.use("/api/data", dataRouter)

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))
