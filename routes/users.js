var express = require('express');
var router = express.Router();
var encryption = require('../utils/encryption.js');
var mail = require('../models/emails.js');
var usersModel = require('../models/users.js');
const axios = require('axios');
require('dotenv').config();

const langs = (lang) => {

    let langData = require('../langs/users/'+lang+'.json');
    return langData;

}

router.post('/activate-user-account', async function(req, res, next) 
{

    let langId = req.query.langId;
    let userId = encryption.decrypt(req.query.userId);
    let params = [userId, langId];
    console.log(params);
    return;
    let data = await usersModel.activateAccount(params);
    
    res.send(data);

})

router.get('/check-username', async function(req, res, next) 
{

    let langId = req.query.langId;
    let username = req.query.username;
    let params = [username, langId];
    let data = await usersModel.checkUsername(params);
    
    res.send(data);

});

router.get('/encrypt', async function(req, res, next) {

    let data = encryption.encrypt(req.query.data)
    res.send(data)

})

router.get('/get-access-code', async function(req, res, next) 
{

    let email = req.query.email;
    let langId = req.query.langId;
    let params = {email: email, langId: langId};
    const landData = langs(langId);
   
    axios.get(process.env.API_GEEKST+'/users/get-access-code', { params: params})
    .then( async function (rs) {

        if(rs.data.response.statusCode === 0) {

            var message = landData.accessCode.error.userDoesntExist;

        }else if(rs.data.response.statusCode === 1) {
           
            emailParams = {accessCode: rs.data.response.accessCode, email: email, langId: langId};
            mail.userAccessCode(emailParams);

            var message = landData.accessCode.success.sendEmail;

        } else if(rs.data.response.statusCode === 2) {

            var message = landData.accessCode.warning.userInactive;

        } else if(rs.data.response.statusCode === 3) {

            let url = process.env.APP_URL+":"+process.env.APP_PORT+"/activate-user-account?userId="+rs.data.response.userId+"&langId="+langId;
            emailParams = {url: url, email: email, langId: langId};
            mail.activateUserAccount(emailParams);

            var message = landData.accessCode.warning.userPendingVerification;

        } else {

            var message = rs.data.response.message;

        };

        res.send({
            message: message,
            status: rs.data.response.status,
            statusCode: rs.data.response.statusCode
        });

    })
    .catch(function (error) {

        console.log("<-- ERROR -->");
        console.log(error);
        res.send(error);

    });

});

router.post('/sign-in', async function(req, res, next) {

    let email = req.query.email;
    let langId = req.query.langId;
    let accessCode = req.query.accessCode;
    let params = {accessCode: accessCode, email: email};

    axios.post(process.env.API_GEEKST+'/users/sign-in', null, { params: params})
    .then( async function (response) {

        if(response.data.response.statusCode === 1) {

            let signInParams = [response.data.response.userId, langId];
            let data = await usersModel.signIn(signInParams);

        };

        res.send(response.data);

    })
    .catch(function (error) {
        console.log(error);

        res.send(error);

    });

});

router.post('/sign-up', async function(req, res, next) {

    let email = req.query.email;
    let langId = req.query.langId;
    let username = req.query.username;
    let params = {email: email, langId: langId, username: username};

    axios.post(process.env.API_GEEKST+'/users/sign-up', null, { params: params})
    .then( async function (response) {

        if(response.data.response.statusCode === 1) {

         
        } else {

        }

        res.send(response.data);

    })
    .catch(function (error) {
        console.log(error);

        res.send(error);

    });

    /*if(data.response.statusCode === 1)
    {
        
        let url = process.env.APP_URL+":"+process.env.APP_PORT+"/activate-user-account?userId="+data.response.userId+"&langId="+req.query.langId
        let emailParams = {email: email, url: url, langId: langId}
        mail.newUserAccount(emailParams)

    }

    res.send(data)*/

})

module.exports = router;
