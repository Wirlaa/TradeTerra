import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
    res.render('charts', { showNavbarButtons: true })
})

router.get('/charts', (req, res) => {
    res.render('charts', { showNavbarButtons: true })
})

router.get('/games', (req, res) => {
    res.render('games', { showNavbarButtons: false })
})

export default router