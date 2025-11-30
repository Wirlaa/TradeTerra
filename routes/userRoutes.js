import { Router } from 'express'
const router = Router()

router.get('/', (req, res) => {
    res.send('this is userRoutes');
})

export default router