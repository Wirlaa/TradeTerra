import User from "../models/User.js"
import bcrypt from "bcryptjs"

const registerUser = async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    try {
        if (!username || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const userExists = await User.findOne({ username })
        if (userExists) {
            return res.status(400).json({ message: "User already exists" })
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = await User.create({
            username,
            password: hashedPassword,
        })

        res.status(201).json({
            id: user._id,
            username: user.username,
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export default registerUser