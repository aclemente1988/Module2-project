const express = require('express');
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
    let userInfo = req.session.currentUser
    res.render("index", {userInfo});  
});

module.exports = router;
