import { Router } from 'express'
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = Router()

router.post('/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body
    if (!username || !password || !confirmPassword) return res.status(400).json("All fields are required")
    try {
        let user = await User.findOne({ username })
        if (user) return res.status(400).json("User already exists")
        if (password !== confirmPassword) return res.status(400).json("Passwords do not match")

        const salt = await bcrypt.genSaltSync(10)
        const hashedPassword = await bcrypt.hashSync(password, salt)
        user = await User.create({
            username,
            password: hashedPassword,
        })
        res.status(201).json({ id: user._id, username: user.username,})
    } catch (error) {
        res.status(500).json(error.message )
    }
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json("All fields are required")
    try {
        let user = await User.findOne({ username })
        if (!user) return res.status(401).json("Login failed")
        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ username: username}, process.env.SECRET, { expiresIn: "1d"})
            return res.status(200).json({success: true, token})
        }
        return res.status(401).json("Login failed")
    } catch (error) {
        res.status(500).json(error.message )
    }
})

router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('_id')
        if (!user) { return res.status(404).json({ message: 'User not found' }) }
        res.status(200).json(user._id)
    } catch (error) {
        res.status(500).json(error.message )
    }
})

export default router