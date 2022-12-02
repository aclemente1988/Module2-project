const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const playerSchema = new Schema (
    {
        playername: String,
        position: String,
        team: String,
    },
    {
        timestamps: true,
    },
    {
        users: [{ type: Schema.Types.ObjectId, ref: "User"}],
    }
    
);

const Player = model("Player", playerSchema);

module.exports = Player;