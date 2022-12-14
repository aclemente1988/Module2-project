const { Schema, model } = require("mongoose");

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
      type: String
        },
    homeflag: {
      type : String,
      required:false
    },
    awayFlag: {
      type : String,
      required:false
    },
    homeTeam: {
      type : String,
      required:false
    },
    awayTeam: {
      type : String,
      required:false
    }
  },
  {
    timestamps: true,
  }
);

const Prediction = model("Prediction", predictionSchema);

module.exports = Prediction;
