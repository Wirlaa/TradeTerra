import { Router } from 'express'
import registerUser from '../controllers/UserController.js'

const router = Router()

router.get('/', (req, res) => {
    res.send('this is userRoutes')
})

router.post("/register", registerUser)

export default router