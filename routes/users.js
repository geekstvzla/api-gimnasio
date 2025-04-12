var express = require('express');
var router = express.Router();
var encryption = require('../utils/encryption.js');
var mail = require('../models/emails.js');
var usersModel = require('../models/users.js');
const axios = require('axios');
require('dotenv').config();

router.post('/activate-user-account', async function(req, res, next) 
{

    let langId = req.query.langId
    let userId = encryption.decrypt(req.query.userId)
    let params = [userId, langId]
    let data = await usersModel.activateAccount(params)
    
    res.send(data);

})

router.get('/check-username', async function(req, res, next) 
{

    let langId = req.query.langId
    let username = req.query.username
    let params = [username, langId]
    let data = await usersModel.checkUsername(params)
    
    res.send(data);

})

router.get('/encrypt', async function(req, res, next) {

    let data = encryption.encrypt(req.query.data)
    res.send(data)

})

router.post('/recover-user-password', async function(req, res, next) {

    let email = encryption.decrypt(req.query.email)
    let langId = req.query.langId;
    let params = [email, langId];
    let data = await usersModel.recoverUserPassword(params);

    if(data.response)
    {

        emailParams = {email: email, password: data.response.password};
        mail.recoverUserPassword(emailParams);
        delete data.response.password;
        delete data.response.sendEmail;

    }

    res.send(data);

})

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

        } else {

        }

        res.send(response.data);

    })
    .catch(function (error) {
        console.log(error);

        res.send(error);

    });


    /*let data = await usersModel.signIn(params);
 
    if(data.response.statusCode === 3)
    {
       
        let url = process.env.APP_URL+":"+process.env.APP_PORT+"/activate-user-account?userId="+data.response.userId+"&langId="+req.query.langId;
        let emailParams = {email: email, url: url, langId: langId};
        mail.activateUserAccount(emailParams);
   
    }

    if(data.response.statusCode !== 1)
    {
        delete data.response.userId;
    }

    res.send(data);*/

})

router.post('/sign-up', async function(req, res, next) {

    let email = encryption.decrypt(req.query.email)
    let langId = req.query.langId
    let password = encryption.decrypt(req.query.password)
    let userName = encryption.decrypt(req.query.username)
    let params = [email, password, userName, langId]
    let data = await usersModel.signUp(params)

    if(data.response.statusCode === 1)
    {
        
        let url = process.env.APP_URL+":"+process.env.APP_PORT+"/activate-user-account?userId="+data.response.userId+"&langId="+req.query.langId
        let emailParams = {email: email, url: url, langId: langId}
        mail.newUserAccount(emailParams)

    }

    res.send(data)

})

module.exports = router;
