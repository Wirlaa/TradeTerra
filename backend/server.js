import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import router from './routes/userRoutes.js' //must have .js when not using ts

dotenv.config()
const app = express()

app.use(express.json())
app.use(cors({
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}))
app.use("/api/users", router) //my changes, make sure it doesn't break

app.get('/', (req, res) => {
    res.send('Hello World from Express!')
})

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))
