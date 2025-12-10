import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
    res.render('charts')
})

router.get('/charts', (req, res) => {
    res.render('charts')
})

router.get('/games', (req, res) => {
    res.render('games')
})

export default router