import jwt from "jsonwebtoken"

export const validate = (req, res, next) => {
    const token = req.header('authorization')?.split(" ")[1]
    if(!token) return res.status(401).json("Access denied, missing token")
    try {
        req.user = jwt.verify(token, process.env.SECRET)
        next()
    } catch (error) {
        res.status(401).json("Access denied, invalid token")
    }
}