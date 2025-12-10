import { Router } from 'express'
import GameStats from "../models/GameStats.js"
import {validate} from "../middleware/validation.js";
import User from "../models/User.js";

const router = Router()

router.post('/submit', validate, async (req, res) => {
    const gameStats = await GameStats.findOne({ userId: req.body.userId, gameTag: req.body.gameTag })
    if (!gameStats) {
        await GameStats.create({
            userId: req.body.userId,
            gameTag: req.body.gameTag,
            correctOnFirstGuess: req.body.correctOnFirstGuess,
        })
        return res.status(201).json("Stats created successfully.")
    }
    if (gameStats.solvedAt) return res.status(200).json("Game already solved.")
    gameStats.guessCount++
    if (req.body.solved) gameStats.solvedAt = new Date()
    await gameStats.save()
    res.status(200).json("Stats updated successfully.")
})

router.get('/:username', validate, async (req, res) => {
    const userId = await User.findOne({ username: req.params.username }).select('_id')
    const userStats = await GameStats.find({ userId: userId })
    res.status(200).json(userStats)
})

export default router