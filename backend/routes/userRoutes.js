import { Router } from 'express'
const router = Router()

router.get('/', (req, res) => {
    res.send('this is userRoutes');
})

// module.exports = router
export default router