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
    }    
);

const Player = model("Player", playerSchema);

module.exports = Player;