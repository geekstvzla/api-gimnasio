var express = require('express');
var router = express.Router();
var gymModel = require('../models/gym.js');
const axios = require('axios');
require('dotenv').config();

const langs = (lang) => {

    let langData = require('../langs/users/' + lang + '.json');
    return langData;

};

router.get('/get-gym-info', async function (req, res, next) {

    let langId = req.query.langId;
    let slug = req.query.slug;

    let data = await gymModel.gymInfo(slug);
    res.send(data);

});

module.exports = router;
