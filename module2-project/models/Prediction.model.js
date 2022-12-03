const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const predictionSchema = new Schema(
  {
    homeScore: {
      type: Number,
      required: true
    },
    awayScore: {
        type: Number,
        required: true
    },
    matchId: {
      type: String,
      unique: true
    },
    homeflag: String,
    awayFlag: String,
    homeTeam: String,
    awayTeam: String
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Prediction = model("Prediction", predictionSchema);

module.exports = Prediction;
