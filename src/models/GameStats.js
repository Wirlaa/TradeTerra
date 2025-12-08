import { model, Schema } from 'mongoose'

const gameStatsSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    gameTag: { type: String, required: true },
    correctOnFirstGuess: { type: Number, required: true },
    guessCount: { type: Number, default: 1 },
    solvedAt: { type: Date, default: null },
})

const GameStats = model('GameStats', gameStatsSchema)

export default GameStats
