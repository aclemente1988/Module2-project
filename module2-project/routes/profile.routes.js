const express = require('express');
const router = express.Router();
const axios = require('axios')
const Prediction = require('../models/Prediction.model');
const Player = require('../models/Player.model')

let API_KEY =""

const isLoggedIn = require("../middleware/isLoggedIn")
const isLoggedOut = require("../middleware/isLoggedOut");
const User = require('../models/User.model');


// GET /user-dashboard
router.get('/profile/:id', isLoggedIn, (req, res)=>{
    const userId = req.session.currentUser._id
    User.findById(userId)
        .then(userData=>{
            console.log(userData)            
            res.render("profile/profile", (userData)) 
        })
})

// GET /user-dashboard-All-Players
router.get('/profile/:id/players',isLoggedIn ,  async (req,res)=>{
    let id = req.params;
    Player.find(id)
    .then( allPlayersFromDb =>{
        console.log(allPlayersFromDb)
        res.render('players', {allPlayersFromDb})    
    
    })
})

// POST/Players to user dashboard
router.post('/profile/:id/players/add',isLoggedIn , (req,res)=>{
    const usersId = req.params.id
    const { playername, position, team,  } = req.body
    const userId = req.session.currentUser._id

    Player.create({playername, position, team, userIds:usersId})
        .then (playerData=>{
            User.findById(userId)
                .then (userInfo=>{
                    userInfo.players.push(playerData)
                    userInfo.save()
                })
            res.redirect(`/profile`)
        })
    
})



//To Log In with Email and Password on the API => response will give back a Token to access all the APIs services, this token is autogenerated every time you login
let loginUserConfig = {
    method: 'post',
    url: 'http://api.cup2022.ir/api/v1/user/login',
    headers: "Content-Type: application/json",
    data: { //replace Date here by your personal information
        "email": `${process.env.API_EMAIL}`,
        "password": `${process.env.API_PASS}`
    }
};

//To send a GET request to API using the token from login
let tokenAcessGETConfig = {
    method:'get',
    headers: `Authorization : Bearer ${API_KEY}`
}



//Display all the Information on the incoming Matches on the "MATCHES.HBS" file
router.get("/matches", async (req, res, next) => {
    if (API_KEY === ""){
    await axios(loginUserConfig)
        .then (data=>{
            console.log(API_KEY)
            API_KEY = data.data.data.token
            return API_KEY 
            //console.log(API_KEY)
  })
}
    await axios("http://api.cup2022.ir/api/v1/match",  {
        method:'get',
        headers: `Authorization : Bearer ${API_KEY}`
    })
        .then( matchesData =>{
            let matchesInfo = matchesData.data.data
            //STILL TO CONSTRUCT: FOR LOOP that checks for outdated matches and remove them from being listed
            res.render('matches/matches', {matchesInfo})    
        
        })
        console.log(API_KEY)
});

router.post('/matches/:id/predict',isLoggedIn ,  async (req,res)=>{
    let id = req.params.id
    await axios(loginUserConfig)
    .then (data=>{
        API_KEY = data.data.data.token
        return API_KEY 
        //console.log(API_KEY)
})
    await axios(`http://api.cup2022.ir/api/v1/match/${id}`,  {
        method:'get',
        headers: `Authorization : Bearer ${API_KEY}`
    })
    .then( matchData =>{
        let matchInfo = matchData.data.data
        res.render('matches/match', {matchInfo})    
    
    })

})

router.post('/matches/:id/predict/winner',isLoggedIn , (req,res)=>{
    const matchId = req.params.id
    const { homeScore, awayScore } = req.body
    const userId = req.session.currentUser._id

    Prediction.create({homeScore, awayScore, matchId:matchId})
        .then (predictionData=>{
            User.findById(userId)
                .then (userInfo=>{
                    userInfo.predictions.push(predictionData)
                    userInfo.predictionsCount += 1;
                    userInfo.save()
                })
            res.redirect(`/profile/${userId}/predictions`)
        })
    
})

router.get('/profile/:id/predictions', isLoggedIn, (req, res)=>{
    const userId = req.session.currentUser._id
    User.findById(userId)
        .populate('predictions')
        .then(userData=>{            
            res.render("profile/predictions", {userData}) 
        })
})
    
router.post('/matches/:id', async (req,res)=>{
    
    let matchId = req.params.id
    if (API_KEY === ""){
        await axios(loginUserConfig)
            .then (data=>{
                console.log(API_KEY)
                API_KEY = data.data.data.token
                return API_KEY 
      })
    }
        await axios(`http://api.cup2022.ir/api/v1/match/${matchId}`,  {
            method:'get',
            headers: `Authorization : Bearer ${API_KEY}`
        })
            .then( matchData =>{
                console.log(matchData.data.data)
                let matchInfo = matchData.data.data
                res.render('matches/match-no-predict', {matchInfo})    
            
            })
    });



// DEVELOP !!!!!!! TEST!!!!!!

module.exports = router;
