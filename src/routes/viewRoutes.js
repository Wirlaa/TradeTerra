import { Router } from 'express'
import { fileURLToPath } from 'url'

const router = Router()

router.get('/', (req, res) => {
    res.sendFile(fileURLToPath(new URL('../../public/charts.html', import.meta.url)))
})

router.get('/charts', (req, res) => {
    res.sendFile(fileURLToPath(new URL('../../public/charts.html', import.meta.url)))
})

router.get('/games', (req, res) => {
    res.sendFile(fileURLToPath(new URL('../../public/games.html', import.meta.url)))
})

export default router