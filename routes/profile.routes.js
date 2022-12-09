const express = require('express');
const router = express.Router();
const axios = require('axios')
const Prediction = require('../models/Prediction.model');
const Player = require('../models/Player.model')
const User = require('../models/User.model');

let API_KEY =""

const isLoggedIn = require("../middleware/isLoggedIn")
const isLoggedOut = require("../middleware/isLoggedOut");


// GET /user-dashboard
router.get('/profile/:username', isLoggedIn, (req, res)=>{
    const userId = req.session.currentUser._id
    User.findById(userId)
        .populate('players')
        .then(userData=>{
            res.render("profile/profile", {userData}) 
        })
        .catch(err=>{
            res.render('error')
        })
})  

// GET /user-dashboard-All-Players
router.get('/profile/:username/players',isLoggedIn ,  async (req,res)=>{
    let userInfo = req.session.currentUser
    Player.find()
    .then( allPlayersFromDb =>{
        res.render('players', {allPlayersFromDb, userInfo} )    
    })
    .catch(err=>{
        res.render('error')
    })
})

// POST/Players to user dashboard
router.post('/profile/:id/players/add',isLoggedIn , (req,res)=>{
    const playerId = req.params.id
    const userId = req.session.currentUser._id

    Player.findById(playerId)
        .then (playerData=>{
            User.findById(userId)
                .then (userInfo=>{
                    userInfo.players.push(playerData)
                    userInfo.save()
                    res.redirect(`/profile/${userId}`)
                })
                .catch(err=>{
                    res.render('error')
                })           
           })
    
})

// DELETE/Player in the dashboard
router.post('/profile/:id/players/delete', (req,res)=>{
    let playersId = req.params.id;
    let userId = req.session.currentUser._id
    Player.findByIdAndDelete(playersId)
    .then((x)=>{
        User.findById(userId)
        .then(userInfo=>{
            userInfo.save()
            res.redirect('/profile/:id/')
        })
        .catch(err=>{
            res.render('error')
        })
    })
})

// Update/Player in the dashboard
router.post('/profile/:id/players/update', (req,res)=>{
    let playersId = req.params.id;
    let userId = req.session.currentUser._id
    Player.findByIdAndDelete(playersId)
    .then((x)=>{
        User.findById(userId)
        .then(userInfo=>{
            userInfo.save()
            res.redirect('/profile/:id/players')
        })
        .catch(err=>{
            res.render('error')
        })
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
   
    await axios(loginUserConfig)
        .then (data=>{
            API_KEY = data.data.data.token
            return API_KEY 
  })

    await axios("http://api.cup2022.ir/api/v1/match",  {
        method:'get',
        headers: `Authorization : Bearer ${API_KEY}`
        
    })
        .then( matchesData =>{
            let matchesInfo = matchesData.data.data
            let userInfo = req.session.currentUser
            res.render('matches/matches', {matchesInfo, userInfo})    
        
        })
        .catch(err=>{
            res.render('error', {errorMessage: "The API serices seem to be down at the moment, please try accesing them again in a while"})
        })
});

router.post('/matches/:id/predict',isLoggedIn ,  async (req,res)=>{
    let id = req.params.id
    const userInfo = req.session.currentUser

    await axios(loginUserConfig)
    .then (data=>{
        API_KEY = data.data.data.token
        return API_KEY 
})
    await axios(`http://api.cup2022.ir/api/v1/match/${id}`,  {
        method:'get',
        headers: `Authorization : Bearer ${API_KEY}`
    })
    .then( matchData =>{
        let matchInfo = matchData.data.data
        res.render('matches/match', {matchInfo, userInfo})    
    })
    .catch(err=>{
        res.render('error', {errorMessage: "The API serices seem to be down at the moment, please try accesing them again in a while"})
    })

})

router.post('/matches/:id/predict/winner',isLoggedIn , (req,res)=>{
    const matchId = req.params.id
    const { homeScore, awayScore } = req.body
    const userId = req.session.currentUser._id
    /* Prediction.findOne({matchId: matchId})
    .then(data=>{
        if (!data){ */
            Prediction.create({homeScore, awayScore, matchId:matchId})
                .then (predictionData=>{
                    User.findById(userId)
                        .then (userInfo=>{
                            userInfo.predictions.push(predictionData)
                            userInfo.predictionsCount += 2;
                            userInfo.save()
                            res.redirect(`/profile/${userId}/predictions`)
                        })      
            
            
        })
        /* return */
        /* } else if (data){
            res.redirect('/matches')
        } */  
    
})

let matchesArray = []
router.get('/profile/:id/predictions', isLoggedIn, async (req, res)=>{
    const userId = req.session.currentUser._id
    
    await axios(loginUserConfig)
    .then (data=>{
        API_KEY = data.data.data.token
        return API_KEY 
})

    if(matchesArray.length<=0){
    await axios("http://api.cup2022.ir/api/v1/match",  {
        method:'get',
        headers: `Authorization : Bearer ${API_KEY}`
    })
        .then(matchesData=> {
            matchesArray = matchesData.data.data
            return matchesArray
        })
    }
    User.findById(userId)
        .populate('predictions')
        .then(userData=>{       
            for (i=0;i<userData.predictions.length;i++){
                let data = userData.predictions[i].matchId
                let mappedMatch = matchesArray.filter(matchToFilter=>matchToFilter.id === `${data}`)
                    userData.predictions[i].homeFlag = mappedMatch[0].home_flag
                    userData.predictions[i].awayFlag= mappedMatch[0].away_flag
                    userData.predictions[i].awayTeam= mappedMatch[0].away_team_en
                    userData.predictions[i].homeTeam= mappedMatch[0].home_team_en
         }
            res.render("profile/predictions", {userData}) 
        })
        .catch(err=>{
            res.render('error', {errorMessage: "The API serices seem to be down at the moment, please try accesing them again in a while"})
        })
})
    
router.post('/matches/:id', async (req,res)=>{
    
    let matchId = req.params.id
    if (API_KEY === ""){
        await axios(loginUserConfig)
            .then (data=>{
                API_KEY = data.data.data.token
                return API_KEY 
      })
    }
        await axios(`http://api.cup2022.ir/api/v1/match/${matchId}`,  {
            method:'get',
            headers: `Authorization : Bearer ${API_KEY}`
        })
            .then( matchData =>{
                let matchInfo = matchData.data.data
                res.render('matches/match-no-predict', {matchInfo})    
            })
            .catch(err=>{
                res.render('error', {errorMessage: "The API serices seem to be down at the moment, please try accesing them again in a while"})
            })
    });


router.get('/profile/:username/frequently-asked-questions', isLoggedIn, (req,res)=>{
    let userData = req.session.currentUser
    res.render('profile/frequently-asked-questions', {userData})
})
    
module.exports = router;
