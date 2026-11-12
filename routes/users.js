var express = require('express');
var router = express.Router();
var mail = require('../models/emails.js');
var usersModel = require('../models/users.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const langs = (lang) => {

    try {

        let langKey = lang || 'esp';
        return require('../langs/users/' + langKey + '.json');

    } catch (e) {

        return require('../langs/users/esp.json');

    }

};

router.post('/activate-user-account', async function (req, res, next) {

    let code = req.query.code;
    const langId = req.query.langId;
    let userId = req.query.userId;
    let params = { userId: userId, code: code, langId: langId };
    const langData = langs(langId);

    axios.post(process.env.API_GEEKST + '/users/activate-user-account', null, { params: params })
        .then(async function (rs) {

            var status = rs.data.response.status;
            var statusCode = rs.data.response.statusCode;
            var userStatusId = (rs.data.response.userStatusId) ? rs.data.response.userStatusId : null;

            if (statusCode === 0) {

                var message = langData.activateUserAccount.error.userDoesntExist;

            } else if (statusCode === 1) {

                let signInParams = [rs.data.response.userId, langId];
                let data = await usersModel.signIn(signInParams);

                // If registered via invitation link (client or coach), keep status_id = 3 (Pendiente) in gimnasio.users
                const registrationType = String(req.query.registration || '').trim().toLowerCase();
                if (registrationType === 'client' || registrationType === 'coach') {
                    const roleId = registrationType === 'coach' ? 3 : 2;
                    const dbConn = require('../config/database.js');
                    await dbConn.promise().query(
                        'UPDATE users SET status_id = 3, gym_role_id = COALESCE(gym_role_id, ?) WHERE geek_user_id = ?',
                        [roleId, rs.data.response.userId]
                    );
                    userStatusId = 3;
                }

                message = langData.activateUserAccount.success;

            } else if (statusCode === 2) {

                message = langData.activateUserAccount.warning.activated;

            } else if (statusCode === 3) {

                message = langData.activateUserAccount.error.technicalSupport;

            } else if (statusCode === 4) {

                const accessCode = rs.data.response.accessCode;

                let emailParams = { accessCode: accessCode, email: userData.email, langId: langId };
                let mailRs = await mail.userAccessCode(emailParams);

                if (mailRs.statusCode === 4) {

                    message = mailRs.message;
                    status = mailRs.status;
                    statusCode = mailRs.statusCode;

                } else {

                    message = langData.activateUserAccount.warning.codeExpired;

                }

            } else if (statusCode === 5) {

                message = langData.activateUserAccount.error.incorrectCode;

            } else {

                message = rs.data.response.message;

            };

            res.send({
                message: message,
                status: status,
                statusCode: statusCode,
                userStatusId: userStatusId
            });

        })
        .catch(function (error) {

            console.log("<-- ERROR -->");
            console.log(error);
            res.send(error);

        });

})

router.get('/check-username', async function (req, res, next) {

    let langId = req.query.langId;
    let username = req.query.username;
    let params = { username: username, langId: langId };

    axios.get(process.env.API_GEEKST + '/users/check-username', { params: params })
        .then(async function (rs) {

            res.send({
                message: rs.data.response.message,
                status: rs.data.response.status,
                statusCode: rs.data.response.statusCode,
                usernameAvailable: rs.data.response.usernameAvailable
            });

        })
        .catch(function (error) {

            console.log("<-- ERROR -->");
            console.log(error);
            res.send(error);

        });

});

router.get('/get-access-code', async function (req, res, next) {

    let email = req.query.email;
    let langId = req.query.langId;
    let gymSlug = req.query.gymSlug || req.query.slug;
    let params = { email: email, langId: langId };
    const langData = langs(langId);
    var message = "";
    var status = "";
    var statusCode = 0;

    axios.get(process.env.API_GEEKST + '/users/get-access-code', { params: params })
        .then(async function (rs) {

            status = rs.data.response.status;
            statusCode = rs.data.response.statusCode;

            if (statusCode === 0) {

                message = langData.accessCode.error.userDoesntExist;

            } else if (statusCode === 1) {

                let emailParams = { accessCode: rs.data.response.accessCode, email: email, langId: langId, gymSlug: gymSlug };
                let mailRs = await mail.userAccessCode(emailParams);

                if (mailRs.statusCode === 4) {

                    message = mailRs.message;
                    status = mailRs.status;
                    statusCode = mailRs.statusCode;

                } else {

                    message = langData.accessCode.success.sendEmail;

                }

            } else if (statusCode === 2) {

                message = langData.accessCode.warning.userInactive;

            } else {

                message = rs.data.response.message;

            };

            res.send({
                message: message,
                status: status,
                statusCode: statusCode
            });

        })
        .catch(function (error) {

            console.log("<-- ERROR -->");
            console.log(error);
            res.send(error);

        });

});

router.get('/get-blood-types', async function (req, res, next) {

    let langId = req.query.langId;
    let params = { langId: langId };
    const langData = langs(langId);
    var message = "";

    axios.get(process.env.API_GEEKST + '/users/get-blood-types', { params: params })
        .then(async function (rs) {

            if (rs.data.response.statusCode === 1) {

                message = langData.getBloodTypes.success;

            } else {

                message = langData.getBloodTypes.error;

            };

            res.send({
                message: message,
                status: rs.data.response.status,
                statusCode: rs.data.response.statusCode,
                bloodTypes: rs.data.response.documentTypes
            });

        })
        .catch(function (error) {

            console.log("<-- ERROR -->");
            console.log(error);
            res.send(error);

        });

});

router.get('/get-countries-phone-codes', async function (req, res, next) {

    let langId = req.query.langId;
    let params = { langId: langId };
    const langData = langs(langId);
    var message = "";

    axios.get(process.env.API_GEEKST + '/users/get-countries-phone-codes', { params: params })
        .then(async function (rs) {

            if (rs.data.response.statusCode === 1) {

                message = langData.getCountriesPhoneCodes.success;

            } else {

                message = langData.getCountriesPhoneCodes.error;

            };

            res.send({
                message: message,
                status: rs.data.response.status,
                statusCode: rs.data.response.statusCode,
                phoneCodes: rs.data.response.phoneCodes
            });

        })
        .catch(function (error) {

            console.log("<-- ERROR -->");
            console.log(error);
            res.send(error);

        });

});

router.get('/get-document-types', async function (req, res, next) {

    let langId = req.query.langId;
    let params = { langId: langId };
    const langData = langs(langId);
    var message = "";

    axios.get(process.env.API_GEEKST + '/users/get-document-types', { params: params })
        .then(async function (rs) {

            if (rs.data.response.statusCode === 1) {

                message = langData.getDocumentTypes.success;

            } else {

                message = langData.getDocumentTypes.error;

            };

            res.send({
                message: message,
                status: rs.data.response.status,
                statusCode: rs.data.response.statusCode,
                documentTypes: rs.data.response.documentTypes
            });

        })
        .catch(function (error) {

            console.log("<-- ERROR -->");
            console.log(error);
            res.send(error);

        });

});

router.get('/get-events-user', async function (req, res, next) {

    let langId = req.query.langId;
    let userId = req.query.userId;
    let params = [userId, userId, userId, langId, userId, langId];

    let data = await usersModel.eventsUser(params);
    res.send({
        events: data
    });

});

router.get('/get-gender-types', async function (req, res, next) {

    let langId = req.query.langId;
    let params = { langId: langId };
    const langData = langs(langId);
    var message = "";

    axios.get(process.env.API_GEEKST + '/users/get-gender-types', { params: params })
        .then(async function (rs) {

            if (rs.data.response.statusCode === 1) {

                message = langData.getGenderTypes.success;

            } else {

                message = langData.getGenderTypes.error;

            };

            res.send({
                message: message,
                status: rs.data.response.status,
                statusCode: rs.data.response.statusCode,
                genderTypes: rs.data.response.genderTypes
            });

        })
        .catch(function (error) {

            console.log("<-- ERROR -->");
            console.log(error);
            res.send(error);

        });

});

router.get('/get-my-event-info-enrollment', async function (req, res, next) {

    let eventEditionId = req.query.eventEditionId;
    let langId = req.query.langId;
    let userId = req.query.userId;
    let params = [eventEditionId, eventEditionId, eventEditionId, userId];

    let data = await usersModel.myEvetInfoEnrollment(params);
    res.send(data);

});

router.get('/get-my-event-info-certificate', async function (req, res, next) {

    let eventEditionId = req.query.eventEditionId;
    let userId = req.query.userId;
    let params = [eventEditionId, userId];

    try {

        let data = await usersModel.myEventCertificateInfo(params);

        if (!data || !data.certificate_image) {
            return res.send(data);
        }

        const participantName = [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
        const pathname = new URL(data.certificate_image).pathname;
        const imagePath = path.join(
            __dirname,
            "../public",
            pathname
        );
        const imageBuffer = fs.readFileSync(imagePath);
        const base64 = imageBuffer.toString("base64");
        const imageHref = `data:image/webp;base64,${base64}`;

        let certificateParams = {
            fontColor: data.font_color,
            fontSize: data.font_size,
            image: imageHref,
            height: data.certificate_height,
            participantName: participantName,
            orientation: data.orientation,
            width: data.certificate_width,
            xNamePosition: data.x_name_position,
            yNamePosition: data.y_name_position
        };

        let svg = await usersModel.svgCertificate(certificateParams);

        return res.send({
            departure_date: data.departure_date,
            svg: {
                image: svg,
                width: data.certificate_width,
                height: data.certificate_height
            }
        });

    } catch (error) {

        console.error('Error generating certificate image:', error);
        res.send(error);

    }

});

router.get('/get-user-data', async function (req, res, next) {

    let userId = req.query.userId;
    let langId = req.query.langId;
    let params = { userId: userId, langId: langId };
    const langData = langs(langId);
    var message = "";

    axios.get(process.env.API_GEEKST + '/users/get-user-data', { params: params })
        .then(async function (rs) {

            if (rs.data.response.statusCode === 1) {

                message = langData.getUserData.success;

            } else {

                message = langData.getUserData.error;

            };

            res.send({
                message: message,
                status: rs.data.response.status,
                statusCode: rs.data.response.statusCode,
                userData: rs.data.response.userData
            });

        })
        .catch(function (error) {

            console.log("<-- ERROR -->");
            console.log(error);
            res.send(error);

        });

});

router.post('/sign-in', async function (req, res, next) {

    const email = req.query.email;
    let langId = req.query.langId;
    let accessCode = req.query.accessCode;
    let params = { accessCode: accessCode, email: email, langId: langId };
    const langData = langs(langId);
    var message = "";
    var status = "";
    var statusCode = 0;

    axios.post(process.env.API_GEEKST + '/users/sign-in', null, { params: params })
        .then(async function (rs) {

            status = rs.data.response.status;
            statusCode = rs.data.response.statusCode;

            if (statusCode === 1) {

                let signInParams = [rs.data.response.userId, langId];
                let data = await usersModel.signIn(signInParams);
                message = langData.signIn.success;
                userData = {
                    avatar: rs.data.response.avatar,
                    documentId: rs.data.response.documentId,
                    email: email,
                    id: rs.data.response.userId,
                    name: rs.data.response.name,
                    username: rs.data.response.username,
                    userStatusId: rs.data.userStatusId
                };

                res.send({
                    message: message,
                    status: rs.data.response.status,
                    statusCode: rs.data.response.statusCode,
                    userData: userData
                });

            } else {

                if (statusCode === 2) {

                    let accessCode = rs.data.response.accessCode.replace(/(\d{3})(\d{3})/, "$1 $2");
                    let emailParams = { accessCode: accessCode, email: email, langId: langId };
                    let mailRs = await mail.userAccessCode(emailParams);

                    if (mailRs.statusCode === 4) {

                        message = mailRs.message;
                        status = mailRs.status;
                        statusCode = mailRs.statusCode;

                    } else {

                        message = langData.signIn.warning.accessCodeHasExpired;

                    }

                } else if (statusCode === 3) {

                    message = langData.signIn.error.accessCodeIsInvalid;

                } else if (statusCode === 5) {

                    message = rs.data.response.message;

                } else {

                    message = langData.signIn.error.other;

                };

                res.send({
                    message: message,
                    status: status,
                    statusCode: statusCode
                });

            }

        })
        .catch(function (error) {
            console.log(error);

            res.send(error);

        });

});

router.post('/sign-up', async function (req, res, next) {

    let email = req.query.email;
    let langId = req.query.langId;
    let username = req.query.username;
    let registration = String(req.query.registration || 'client').trim().toLowerCase();
    let gymSlug = String(req.query.gymSlug || 'delvallefitness').trim();
    let roleId = (registration === 'coach') ? 3 : 2;
    let params = { email: email, langId: langId, username: username };
    const langData = langs(langId);
    var message = "";
    var status = "";
    var statusCode = 0;

    axios.post(process.env.API_GEEKST + '/users/sign-up', null, { params: params })
        .then(async function (rs) {

            status = rs.data.response.status;
            statusCode = rs.data.response.statusCode;
            userId = (rs.data.response.userId) ? rs.data.response.userId : null;
            userAvatar = (rs.data.response.userAvatar) ? rs.data.response.userAvatar : null;
            username = (rs.data.response.username) ? rs.data.response.username : null;
            userStatusId = (rs.data.response.userStatusId) ? rs.data.response.userStatusId : 3;

            if (rs.data.response.statusCode === 1) {

                // Clone newly registered user into gimnasio.users with status_id = 3 (Pendiente) and role (client=2, coach=3)
                try {
                    const dbConn = require('../config/database.js');
                    const geekSchema = process.env.DB_USER_GEEK_SCHEMA || 'geekst';
                    // Indicar origen del usuario en master schema (2 = Gimnasio)
                    await dbConn.promise().query(
                        `UPDATE \`${geekSchema}\`.users u
                         INNER JOIN \`${geekSchema}\`.user_secure_id usi ON usi.user_id = u.user_id
                         SET u.system_id_referred = 2
                         WHERE usi.secure_id = ?`,
                        [userId]
                    );

                    const [gymRows] = await dbConn.promise().query('SELECT gym_id FROM gyms WHERE slug = ? LIMIT 1', [gymSlug]);
                    const gymId = (gymRows && gymRows.length > 0) ? gymRows[0].gym_id : 1;

                    const [existingGymUser] = await dbConn.promise().query(
                        'SELECT user_id FROM users WHERE geek_user_id = ? OR LOWER(TRIM(email)) = LOWER(TRIM(?)) LIMIT 1',
                        [userId, email]
                    );

                    let gymUserId = null;
                    if (existingGymUser && existingGymUser.length > 0) {
                        gymUserId = existingGymUser[0].user_id;
                        await dbConn.promise().query(
                            'UPDATE users SET geek_user_id = ?, gym_role_id = ?, status_id = 3, email = LOWER(TRIM(?)), username = LOWER(TRIM(?)), login_date = NOW() WHERE user_id = ?',
                            [userId, roleId, email, username, gymUserId]
                        );
                    } else {
                        const [insertGymRes] = await dbConn.promise().query(
                            `INSERT INTO users (
                                geek_user_id,
                                gym_role_id,
                                login_date,
                                status_id,
                                email,
                                username
                             ) VALUES (?, ?, NOW(), 3, LOWER(TRIM(?)), LOWER(TRIM(?)))`,
                            [userId, roleId, email, username]
                        );
                        gymUserId = insertGymRes.insertId;
                    }

                    if (gymUserId) {
                        await dbConn.promise().query(
                            'INSERT INTO gym_user_roles (gym_id, user_id, role_id, status_id) VALUES (?, ?, ?, 3)',
                            [gymId, gymUserId, roleId]
                        );
                    }
                } catch (gymInsertErr) {
                    console.error('Error registering pending user in gimnasio.users during sign-up:', gymInsertErr);
                }

                /*let baseUrl = (process.env.NODE_ENV === 'production') ? process.env.APP_URL+":"+process.env.APP_PORT : process.env.APP_URL;
                let url = baseUrl+"/activate-user-account?userId="+rs.data.response.userId+"&langId="+langId;*/
                let emailParams = { activationCode: rs.data.response.activationCode, email: email, langId: langId, gymSlug: gymSlug };
                let mailRs = await mail.newUserAccount(emailParams);

                if (mailRs.statusCode === 4) {

                    message = mailRs.message;
                    status = mailRs.status;
                    statusCode = mailRs.statusCode;

                } else {

                    message = langData.signUp.success;

                }

            } else if (rs.data.response.statusCode === 2) {

                message = langData.signUp.error.alreadyRegisteredEmail;

            } else if (rs.data.response.statusCode === 3) {

                message = langData.signUp.warning.alreadyRegisteredUsername;

            } else {

                message = langData.signUp.error.other;

            };

            res.send({
                avatar: userAvatar,
                message: message,
                status: status,
                statusCode: statusCode,
                userId: userId,
                username: username,
                userStatusId: userStatusId
            });

        })
        .catch(function (error) {
            console.log(error);

            res.send(error);

        });

});

router.post('/update-user-data', async function (req, res, next) {

    const email = req.query.email;
    const langId = req.query.langId

    let params = {
        userId: req.query.userId,
        firstName: req.query.firstName,
        middleName: req.query.middleName,
        lastName: req.query.lastName,
        secondLastName: req.query.secondLastName,
        documentTypeId: req.query.documentTypeId,
        document: req.query.document,
        birthday: req.query.birthday,
        genderId: req.query.genderId,
        bloodTypeId: req.query.bloodTypeId,
        countryPhoneCode: req.query.countryPhoneCode,
        phoneNumber: req.query.phoneNumber,
        countryEmergencyPhoneCode: req.query.countryEmergencyPhoneCode,
        emergencyPhoneNumber: req.query.emergencyPhoneNumber,
        medicalCondition: req.query.medicalCondition,
        langId: langId
    };

    const langData = langs(langId);
    var message = "";
    var status = "";
    var statusCode = 0;

    axios.post(process.env.API_GEEKST + '/users/update-user-data', null, { params: params })
        .then(async function (rs) {

            status = rs.data.response.status;
            statusCode = rs.data.response.statusCode;

            if (rs.data.response.statusCode === 0) {

                message = langData.updateUserData.error.userDoesntExist;

            } else if (rs.data.response.statusCode === 1) {

                let emailParams = { email: email, langId: langId };
                let mailRs = await mail.updateUserData(emailParams);

                if (mailRs.statusCode === 4) {

                    message = mailRs.message;
                    status = mailRs.status;
                    statusCode = mailRs.statusCode;

                } else {

                    message = langData.updateUserData.success;

                }

            } else if (rs.data.response.statusCode === 2) {

                message = langData.updateUserData.error.userInactive;

            } else if (rs.data.response.statusCode === 3) {

                message = langData.updateUserData.error.pendingVerification;

            } else {

                message = langData.updateUserData.error.other;

            };

            res.send({
                message: message,
                status: status,
                statusCode: statusCode
            });

        })
        .catch(function (error) {

            console.log(error);
            res.send(error);

        });

});

router.get('/get-user-region', async function (req, res, next) {

    let params = { userId: req.query.userId };

    axios.get(process.env.API_GEEKST + '/users/get-user-region', { params: params })
        .then(async function (rs) {

            res.send(rs.data);

        })
        .catch(function (error) {

            console.log("<-- ERROR -->");
            console.log(error);
            res.send(error);

        });

});

router.post('/update-user-region', async function (req, res, next) {


    let params = {
        userId: req.query.userId || (req.body && req.body.userId),
        regionId: req.query.regionId || (req.body && req.body.regionId),
        locality: req.query.locality || (req.body && req.body.locality) || ''
    };

    axios.post(process.env.API_GEEKST + '/users/update-user-region', null, { params: params })
        .then(function (rs) {
            res.send(rs.data);
        })
        .catch(function (error) {
            console.log("<-- ERROR -->", error);
            res.send(error);
        });

});

router.get('/check-email', async function (req, res, next) {
    try {
        const email = (req.query.email || '').trim().toLowerCase();
        if (!email) {
            return res.send({ status: 'success', statusCode: 1, exists: false });
        }
        const dbConn = require('../config/database.js');
        const geekSchema = process.env.DB_USER_GEEK_SCHEMA || 'geekst';
        const [rows] = await dbConn.promise().query(
            `SELECT u.user_id
             FROM \`${geekSchema}\`.users u
             WHERE LOWER(TRIM(u.email)) = ?
             UNION
             SELECT gu.user_id
             FROM users gu
             WHERE LOWER(TRIM(gu.email)) = ?
             LIMIT 1`,
            [email, email]
        );
        const exists = rows && rows.length > 0;
        return res.send({
            status: 'success',
            statusCode: 1,
            exists: exists,
            message: exists ? 'El correo electrónico ya se encuentra registrado en el sistema.' : 'Correo disponible.'
        });
    } catch (error) {
        console.error('Error checking email:', error);
        return res.status(500).send({ status: 'error', statusCode: 0, exists: false });
    }
});

router.post('/create-user', async function (req, res, next) {
    try {
        const payload = Object.assign({}, req.query, req.body);
        const email = (payload.email || '').trim().toLowerCase();
        const langId = payload.langId || 'esp';
        const registration = String(payload.registration || '').trim().toLowerCase();
        const isPublicRegistration = (registration === 'client' || registration === 'coach');
        const roleId = isPublicRegistration
            ? (registration === 'coach' ? 3 : 2)
            : (parseInt(payload.roleId, 10) || 2);
        const targetStatusId = isPublicRegistration ? 3 : 1;
        const gymSlug = payload.gymSlug || 'delvallefitness';

        const cleanStr = (val) => {
            if (val === null || val === undefined) return '';
            const s = String(val).trim();
            return (s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') ? '' : s;
        };

        const normalizePhoneCode = (code) => {
            const c = cleanStr(code);
            if (!c) return '+58';
            return c.startsWith('+') ? c : '+' + c;
        };

        const firstName = cleanStr(payload.firstName || payload.first_name);
        const middleName = cleanStr(payload.middleName || payload.middle_name);
        const lastName = cleanStr(payload.lastName || payload.last_name);
        const secondLastName = cleanStr(payload.secondLastName || payload.second_last_name);
        const documentTypeId = payload.documentTypeId || payload.document_type_id || '';
        const document = cleanStr(payload.document || payload.document_id);
        const birthday = cleanStr(payload.birthday) || null;
        const genderId = payload.genderId || payload.gender_id || '';
        const bloodTypeId = payload.bloodTypeId || payload.blood_type_id || '';
        const countryPhoneCode = normalizePhoneCode(payload.countryPhoneCode || payload.country_phone_code);
        const phoneNumber = cleanStr(payload.phoneNumber || payload.phone_number);
        const countryEmergencyPhoneCode = normalizePhoneCode(payload.countryEmergencyPhoneCode || payload.country_emergency_phone_code);
        const emergencyPhoneNumber = cleanStr(payload.emergencyPhoneNumber || payload.emergency_phone_number);
        const medicalCondition = cleanStr(payload.medicalCondition || payload.medical_condition);

        if (!documentTypeId || !document) {
            return res.status(400).send({
                status: 'error',
                statusCode: 0,
                field: 'document',
                message: 'El tipo y número de documento son obligatorios.'
            });
        }

        if (!email) {
            return res.status(400).send({
                status: 'error',
                statusCode: 0,
                field: 'email',
                message: 'El correo electrónico es requerido.'
            });
        }

        let dbConn = require('../config/database.js');

        // 1. Validate that user is not already registered in this gimnasio.users
        const [existingInGym] = await dbConn.promise().query(
            `SELECT user_id, document_id, email
             FROM users
             WHERE (document_type_id = ? AND TRIM(document_id) = ?)
                OR TRIM(document_id) = ?
                OR (email IS NOT NULL AND email <> '' AND LOWER(TRIM(email)) = ?)
             LIMIT 1`,
            [documentTypeId, document, document, email]
        );
        if (existingInGym && existingInGym.length > 0) {
            const isEmailMatch = (existingInGym[0].email || '').trim().toLowerCase() === email;
            return res.send({
                status: 'error',
                statusCode: 0,
                field: isEmailMatch ? 'email' : 'document',
                message: isEmailMatch
                    ? 'El correo electrónico ingresado ya se encuentra registrado en este gimnasio.'
                    : 'La cédula o número de documento ingresado ya se encuentra registrado en este gimnasio.'
            });
        }

        // 2. Check if user already exists in master table geekst.users (api-users)
        const geekSchema = process.env.DB_USER_GEEK_SCHEMA || 'geekst';
        const [existingInGeekst] = await dbConn.promise().query(
            `SELECT u.user_id, usi.secure_id, u.email, u.document_id, u.username
             FROM \`${geekSchema}\`.users u
             LEFT JOIN \`${geekSchema}\`.user_secure_id usi ON usi.user_id = u.user_id
             WHERE (u.document_type_id = ? AND TRIM(u.document_id) = ?)
                OR TRIM(u.document_id) = ?
                OR (u.email IS NOT NULL AND u.email <> '' AND LOWER(TRIM(u.email)) = ?)
             LIMIT 1`,
            [documentTypeId, document, document, email]
        );

        const isNewToGeekst = (!existingInGeekst || existingInGeekst.length === 0);
        let geekUserId = '';
        let username = '';

        if (existingInGeekst && existingInGeekst.length > 0) {
            const eg = existingInGeekst[0];
            username = eg.username || '';
            geekUserId = eg.secure_id || '';

            if (!geekUserId && eg.user_id) {
                const [uuidRows] = await dbConn.promise().query('SELECT UUID() AS uuid');
                geekUserId = uuidRows[0].uuid;
                await dbConn.promise().query(
                    `INSERT INTO \`${geekSchema}\`.user_secure_id (user_id, secure_id) VALUES (?, ?)`,
                    [eg.user_id, geekUserId]
                );
            }
        } else {
            // 3. Brand new user: Determine or generate unique username and sign up in api-users
            let baseUsername = (firstName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (baseUsername.length < 3) baseUsername = 'usr' + baseUsername;

            let signUpRs = null;

            for (let attempt = 0; attempt < 3; attempt++) {
                username = (attempt === 0 && payload.username)
                    ? payload.username
                    : (baseUsername + Math.floor(100 + Math.random() * 9000));

                try {
                    signUpRs = await axios.post(process.env.API_GEEKST + '/users/sign-up', null, {
                        params: { email, username, langId }
                    });

                    if (signUpRs.data && signUpRs.data.response) {
                        if (signUpRs.data.response.statusCode === 1) {
                            geekUserId = signUpRs.data.response.userId;
                            break;
                        } else if (signUpRs.data.response.statusCode === 2) {
                            return res.send({
                                status: 'error',
                                statusCode: 0,
                                field: 'email',
                                message: 'El correo electrónico ingresado ya se encuentra registrado en el sistema.'
                            });
                        }
                    }
                } catch (signUpErr) {
                    console.warn('Fallback direct insert in master users after API_GEEKST sign-up error:', signUpErr.message);
                    break;
                }
            }

            // Direct fallback insert into master users + user_secure_id if geekUserId was not generated by API_GEEKST
            if (!geekUserId) {
                username = baseUsername + Math.floor(100 + Math.random() * 9000);
                const [insertGeekResult] = await dbConn.promise().query(
                    `INSERT INTO \`${geekSchema}\`.users (
                        document_type_id,
                        document_id,
                        blood_type_id,
                        email,
                        username,
                        first_name,
                        middle_name,
                        last_name,
                        second_last_name,
                        gender_id,
                        birthday,
                        country_phone_code,
                        phone_number,
                        country_emergency_phone_code,
                        emergency_phone_number,
                        medical_condition,
                        system_id_referred,
                        status_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 1)`,
                    [
                        documentTypeId,
                        document,
                        bloodTypeId || null,
                        email,
                        username,
                        firstName,
                        middleName || null,
                        lastName,
                        secondLastName || null,
                        genderId || null,
                        birthday,
                        countryPhoneCode,
                        phoneNumber,
                        countryEmergencyPhoneCode,
                        emergencyPhoneNumber,
                        medicalCondition
                    ]
                );
                const newGeekInternalId = insertGeekResult.insertId;
                const [uuidRows] = await dbConn.promise().query('SELECT UUID() AS uuid');
                geekUserId = uuidRows[0].uuid;
                await dbConn.promise().query(
                    `INSERT INTO \`${geekSchema}\`.user_secure_id (user_id, secure_id) VALUES (?, ?)`,
                    [newGeekInternalId, geekUserId]
                );
            }
        }

        // Ensure newly created user is active in master users and record originating system (2 = Gimnasio)
        if (isNewToGeekst) {
            await dbConn.promise().query(
                `UPDATE \`${geekSchema}\`.users u
                 INNER JOIN \`${geekSchema}\`.user_secure_id usi ON usi.user_id = u.user_id
                 SET u.status_id = 1,
                     u.system_id_referred = 2
                 WHERE usi.secure_id = ?`,
                [geekUserId]
            );
        } else {
            await dbConn.promise().query(
                `UPDATE \`${geekSchema}\`.users u
                 INNER JOIN \`${geekSchema}\`.user_secure_id usi ON usi.user_id = u.user_id
                 SET u.status_id = 1
                 WHERE usi.secure_id = ? AND u.status_id = 3`,
                [geekUserId]
            );
        }

        // 4. Save initial personal data in api-users for the newly created user
        const personalDataParams = {
            userId: geekUserId,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            secondLastName: secondLastName,
            documentTypeId: documentTypeId,
            document: document,
            birthday: birthday,
            genderId: genderId,
            bloodTypeId: bloodTypeId,
            countryPhoneCode: countryPhoneCode,
            phoneNumber: phoneNumber,
            countryEmergencyPhoneCode: countryEmergencyPhoneCode,
            emergencyPhoneNumber: emergencyPhoneNumber,
            medicalCondition: medicalCondition,
            langId: langId
        };

        try {
            await axios.post(process.env.API_GEEKST + '/users/update-user-data', null, { params: personalDataParams });
        } catch (updateErr) {
            console.warn('API_GEEKST update-user-data warning (handled by direct SQL update):', updateErr.message);
        }

        // 4. Save initial user region if provided
        const selectedRegionId = payload.parishId || payload.municipalityId || payload.stateId || null;
        const locality = cleanStr(payload.locality);
        if (selectedRegionId) {
            try {
                await axios.post(process.env.API_GEEKST + '/users/update-user-region', null, {
                    params: {
                        userId: geekUserId,
                        regionId: selectedRegionId,
                        locality: locality
                    }
                });
            } catch (regionErr) {
                console.warn('API_GEEKST update-user-region warning (handled by direct SQL update):', regionErr.message);
            }
        }

        // Ensure all personal fields, document_id, and targetStatusId are persisted in master users
        await dbConn.promise().query(
            `UPDATE \`${geekSchema}\`.users u
             INNER JOIN \`${geekSchema}\`.user_secure_id usi ON usi.user_id = u.user_id
             SET u.first_name = ?,
                 u.middle_name = ?,
                 u.last_name = ?,
                 u.second_last_name = ?,
                 u.document_type_id = ?,
                 u.document_id = ?,
                 u.blood_type_id = ?,
                 u.gender_id = ?,
                 u.birthday = ?,
                 u.country_phone_code = ?,
                 u.phone_number = ?,
                 u.country_emergency_phone_code = ?,
                 u.emergency_phone_number = ?,
                 u.medical_condition = ?,
                 u.region_id = COALESCE(?, u.region_id),
                 u.locality = COALESCE(?, u.locality),
                 u.status_id = CASE WHEN u.status_id = 1 THEN 1 ELSE ? END
             WHERE usi.secure_id = ?`,
            [
                firstName,
                middleName || null,
                lastName,
                secondLastName || null,
                documentTypeId,
                document,
                bloodTypeId,
                genderId,
                birthday,
                countryPhoneCode,
                phoneNumber,
                countryEmergencyPhoneCode,
                emergencyPhoneNumber,
                medicalCondition,
                selectedRegionId,
                locality,
                targetStatusId,
                geekUserId
            ]
        );

        // Fetch the authoritative record from master users (api-users) to clone into gimnasio.users
        const [geekUserRows] = await dbConn.promise().query(
            `SELECT u.document_type_id,
                    u.document_id,
                    u.blood_type_id,
                    u.email,
                    u.username,
                    u.first_name,
                    u.middle_name,
                    u.last_name,
                    u.second_last_name,
                    u.gender_id,
                    u.region_id,
                    u.locality,
                    DATE_FORMAT(u.birthday, "%Y-%m-%d") AS birthday,
                    u.avatar,
                    u.country_phone_code,
                    u.phone_number,
                    u.country_emergency_phone_code,
                    u.emergency_phone_number,
                    u.medical_condition,
                    u.status_id
             FROM \`${geekSchema}\`.users u
             INNER JOIN \`${geekSchema}\`.user_secure_id usi ON usi.user_id = u.user_id
             WHERE usi.secure_id = ? LIMIT 1`,
            [geekUserId]
        );
        const gs = (geekUserRows && geekUserRows.length > 0) ? geekUserRows[0] : {};

        // 5. Validate again in gimnasio.users right before inserting (document and email must not exist)
        const [existingGymBeforeInsert] = await dbConn.promise().query(
            `SELECT user_id, document_id, email
             FROM users
             WHERE TRIM(document_id) = ? OR LOWER(TRIM(email)) = ? OR geek_user_id = ?
             LIMIT 1`,
            [document, email, geekUserId]
        );
        if (existingGymBeforeInsert && existingGymBeforeInsert.length > 0) {
            const dup = existingGymBeforeInsert[0];
            const isEmailDup = (dup.email || '').trim().toLowerCase() === email;
            return res.send({
                status: 'error',
                statusCode: 0,
                field: isEmailDup ? 'email' : 'document',
                message: isEmailDup
                    ? 'El correo electrónico ingresado ya se encuentra registrado en el sistema.'
                    : 'La cédula o número de documento ingresado ya se encuentra registrado en el sistema.'
            });
        }

        // 6. Clone record from geekst.users (api-users) into gimnasio.users
        let [gymRows] = await dbConn.promise().query('SELECT gym_id FROM gyms WHERE slug = ? LIMIT 1', [gymSlug]);
        let gymId = (gymRows && gymRows.length > 0) ? gymRows[0].gym_id : 1;

        let [insertUserResult] = await dbConn.promise().query(
            `INSERT INTO users (
                geek_user_id,
                gym_role_id,
                login_date,
                status_id,
                document_type_id,
                document_id,
                blood_type_id,
                email,
                username,
                first_name,
                middle_name,
                last_name,
                second_last_name,
                gender_id,
                region_id,
                locality,
                birthday,
                avatar,
                country_phone_code,
                phone_number,
                country_emergency_phone_code,
                emergency_phone_number,
                medical_condition
             ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                geekUserId,
                roleId,
                targetStatusId,
                gs.document_type_id || documentTypeId || null,
                gs.document_id || document || null,
                gs.blood_type_id || bloodTypeId || null,
                gs.email || email,
                gs.username || username || null,
                gs.first_name !== undefined ? gs.first_name : firstName,
                gs.middle_name !== undefined ? gs.middle_name : (middleName || null),
                gs.last_name !== undefined ? gs.last_name : lastName,
                gs.second_last_name !== undefined ? gs.second_last_name : (secondLastName || null),
                gs.gender_id || genderId || null,
                gs.region_id || selectedRegionId || null,
                gs.locality !== undefined ? gs.locality : (locality || null),
                gs.birthday || birthday || null,
                gs.avatar || null,
                gs.country_phone_code || countryPhoneCode,
                gs.phone_number !== undefined ? gs.phone_number : phoneNumber,
                gs.country_emergency_phone_code || countryEmergencyPhoneCode,
                gs.emergency_phone_number !== undefined ? gs.emergency_phone_number : emergencyPhoneNumber,
                gs.medical_condition !== undefined ? gs.medical_condition : medicalCondition
            ]
        );
        let gymUserId = insertUserResult.insertId;

        // Insert role in gym_user_roles
        await dbConn.promise().query(
            'INSERT INTO gym_user_roles (gym_id, user_id, role_id, status_id) VALUES (?, ?, ?, ?)',
            [gymId, gymUserId, roleId, targetStatusId]
        );

        // 6.1 Guardar foto de perfil (avatar) en api-users si fue enviada
        let masterUserId = null;
        if (existingInGeekst && existingInGeekst.length > 0 && existingInGeekst[0].user_id) {
            masterUserId = existingInGeekst[0].user_id;
        } else if (typeof newGeekInternalId !== 'undefined' && newGeekInternalId) {
            masterUserId = newGeekInternalId;
        } else if (geekUserId) {
            const [uRows] = await dbConn.promise().query(
                `SELECT u.user_id FROM \`${geekSchema}\`.users u
                 INNER JOIN \`${geekSchema}\`.user_secure_id usi ON usi.user_id = u.user_id
                 WHERE usi.secure_id = ? LIMIT 1`,
                [geekUserId]
            );
            if (uRows && uRows.length > 0) {
                masterUserId = uRows[0].user_id;
            }
        }
        if (!masterUserId) {
            masterUserId = gymUserId;
        }

        if (req.files && (req.files.avatar || req.files.photo || req.files.image)) {
            try {
                const fs = require('fs');
                const path = require('path');
                const avatarFile = req.files.avatar || req.files.photo || req.files.image;

                let baseUsersDir = process.env.USERS_UPLOAD_PATH;
                if (!baseUsersDir || !fs.existsSync(baseUsersDir)) {
                    const candidates = [
                        path.resolve(__dirname, '../../api-users/public/images/users'),
                        path.resolve(__dirname, '../../api-users.geekst.com.ve/public/images/users'),
                        '/home/sofguarc/api-users.geekst.com.ve/public/images/users',
                        path.resolve(__dirname, '../public/images/users')
                    ];
                    for (const cand of candidates) {
                        if (fs.existsSync(cand)) {
                            baseUsersDir = cand;
                            break;
                        }
                    }
                    if (!baseUsersDir) {
                        baseUsersDir = candidates[0];
                    }
                }

                const userFolder = path.join(baseUsersDir, String(masterUserId));
                if (!fs.existsSync(userFolder)) {
                    fs.mkdirSync(userFolder, { recursive: true });
                }

                let ext = path.extname(avatarFile.name || '').toLowerCase();
                if (!ext || ext === '.') {
                    if (avatarFile.mimetype === 'image/webp') ext = '.webp';
                    else if (avatarFile.mimetype === 'image/png') ext = '.png';
                    else ext = '.jpg';
                }

                const avatarFileName = `avatar${ext}`;
                const targetPath = path.join(userFolder, avatarFileName);
                await avatarFile.mv(targetPath);

                // Redimensionar del lado del backend si excede 800px de ancho o alto
                try {
                    const { Jimp } = require('jimp');
                    const img = await Jimp.read(targetPath);
                    if (img && img.bitmap && (img.bitmap.width > 800 || img.bitmap.height > 800)) {
                        img.scaleToFit({ w: 800, h: 800 });
                        await img.write(targetPath);
                    }
                } catch (jimpErr) {
                    console.warn('Advertencia en redimensión backend con Jimp (se mantiene archivo original):', jimpErr.message);
                }

                const avatarRelativePath = `${masterUserId}/${avatarFileName}`;

                // Actualizar avatar en la tabla de usuarios de api-users y en gimnasio.users
                await dbConn.promise().query(
                    `UPDATE \`${geekSchema}\`.users SET avatar = ? WHERE user_id = ?`,
                    [avatarRelativePath, masterUserId]
                );
                await dbConn.promise().query(
                    `UPDATE users SET avatar = ? WHERE user_id = ?`,
                    [avatarRelativePath, gymUserId]
                );
            } catch (avatarErr) {
                console.error('Error guardando avatar de usuario:', avatarErr);
            }
        }

        // 7. Enviar notificaciones por correo electrónico
        try {
            const [gymInfoRows] = await dbConn.promise().query(
                'SELECT gym_id, name, slug, logo FROM gyms WHERE gym_id = ? LIMIT 1',
                [gymId]
            );
            const currentGym = (gymInfoRows && gymInfoRows.length > 0) ? gymInfoRows[0] : { name: 'Del Valle Fitness', slug: gymSlug };
            const gymName = currentGym.name;
            const userFullName = [firstName, middleName, lastName, secondLastName].filter(Boolean).join(' ') || username || 'Nuevo Usuario';
            const documentFormatted = `${documentTypeId === 1 || documentTypeId === '1' ? 'V-' : (documentTypeId === 2 || documentTypeId === '2' ? 'E-' : '')}${document}`;
            const fullPhone = phoneNumber ? `${countryPhoneCode} ${phoneNumber}` : '-';
            const fullEmergencyPhone = emergencyPhoneNumber ? `${countryEmergencyPhoneCode} ${emergencyPhoneNumber}` : '-';
            const roleDescription = (roleId === 3 || registration === 'coach') ? 'Entrenador' : 'Cliente';
            const appBaseUrl = (process.env.APP_URL ? (process.env.APP_URL.includes('localhost') ? `${process.env.APP_URL}:${process.env.APP_PORT || 5173}` : process.env.APP_URL) : 'http://localhost:5173');

            // 7.1 Correo al usuario dando las gracias por registrarse
            if (email) {
                mail.gymWelcomeUser({
                    email: email,
                    userName: userFullName,
                    userEmail: email,
                    document: documentFormatted,
                    userPhone: fullPhone,
                    roleName: roleDescription,
                    gymName: gymName,
                    gymSlug: currentGym.slug || gymSlug,
                    gymUrl: `${appBaseUrl}/${currentGym.slug || gymSlug}`,
                    langId: langId
                }).catch(err => console.error(`Error enviando correo de bienvenida a ${email}:`, err));
            }

            // 7.2 Correo a los administradores del gimnasio notificando nuevo registro
            const [adminRows] = await dbConn.promise().query(
                `SELECT DISTINCT u.email, CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) AS full_name
                 FROM gym_user_roles gur
                 JOIN users u ON u.user_id = gur.user_id
                 WHERE gur.gym_id = ? AND gur.role_id = 1 AND gur.status_id = 1 AND u.email IS NOT NULL AND u.email <> ''`,
                [gymId]
            );

            if (adminRows && adminRows.length > 0) {
                for (const admin of adminRows) {
                    if (admin.email) {
                        mail.gymNewUserAdmin({
                            email: admin.email,
                            adminName: admin.full_name.trim() || 'Administrador',
                            userName: userFullName,
                            userEmail: email,
                            document: documentFormatted,
                            userPhone: fullPhone,
                            emergencyPhone: fullEmergencyPhone,
                            roleName: roleDescription,
                            gymName: gymName,
                            gymSlug: currentGym.slug || gymSlug,
                            registrationDate: new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' }),
                            dashboardUrl: `${appBaseUrl}/${currentGym.slug || gymSlug}/dashboard`,
                            langId: langId
                        }).catch(err => console.error(`Error enviando correo a administrador ${admin.email}:`, err));
                    }
                }
            }
        } catch (mailNotificationErr) {
            console.error('Error enviando correos de notificación de registro:', mailNotificationErr);
        }

        return res.send({
            status: 'success',
            statusCode: 1,
            message: 'Usuario creado exitosamente',
            user: {
                userId: gymUserId,
                geekUserId: geekUserId,
                email: email,
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                secondLastName: secondLastName,
                roleId: roleId
            }
        });

    } catch (error) {
        console.error('Error creating user in gym:', error);
        return res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: error.message || 'Error al crear el usuario en el gimnasio'
        });
    }
});

router.get('/search-by-document', async function (req, res, next) {

    try {
        const documentTypeId = req.query.documentTypeId;
        const document = (req.query.document || '').trim();
        const gymSlug = req.query.gymSlug || 'delvallefitness';

        if (!documentTypeId || !document) {
            return res.status(400).send({
                status: 'error',
                statusCode: 0,
                message: 'El tipo y número de documento son obligatorios.'
            });
        }

        const dbConn = require('../config/database.js');
        const geekSchema = process.env.DB_USER_GEEK_SCHEMA || 'geekst';

        // Always query master user table in master schema (api-users)
        let [rows] = await dbConn.promise().query(
            `SELECT u.user_id,
                    usi.secure_id,
                    u.document_type_id,
                    u.document_id,
                    u.blood_type_id,
                    bt.description AS blood_type,
                    u.email,
                    u.username,
                    u.first_name,
                    u.middle_name,
                    u.last_name,
                    u.second_last_name,
                    u.gender_id,
                    DATE_FORMAT(u.birthday, "%Y-%m-%d") AS birthday,
                    u.avatar,
                    u.country_phone_code,
                    u.phone_number,
                    u.country_emergency_phone_code,
                    u.emergency_phone_number,
                    u.medical_condition,
                    u.status_id,
                    u.region_id,
                    u.locality
             FROM \`${geekSchema}\`.users u
             LEFT JOIN \`${geekSchema}\`.user_secure_id usi ON usi.user_id = u.user_id
             LEFT JOIN \`${geekSchema}\`.blood_type bt ON bt.blood_type_id = u.blood_type_id
             WHERE (u.document_type_id = ? AND TRIM(u.document_id) = ?)
                OR TRIM(u.document_id) = ?
             ORDER BY (u.document_type_id = ?) DESC
             LIMIT 1`,
            [documentTypeId, document, document, documentTypeId]
        );

        if (!rows || rows.length === 0) {
            // Check if user exists directly in local gimnasio.users
            let [localGymRows] = await dbConn.promise().query(
                `SELECT u.* FROM users u
                 WHERE (u.document_type_id = ? AND TRIM(u.document_id) = ?)
                    OR TRIM(u.document_id) = ?
                 LIMIT 1`,
                [documentTypeId, document, document]
            );

            if (localGymRows && localGymRows.length > 0) {
                const gu = localGymRows[0];
                return res.send({
                    status: 'success',
                    statusCode: 1,
                    exists: true,
                    existsInGym: true,
                    existsInCentral: false,
                    isAlreadyGymMember: true,
                    message: 'El usuario ya se encuentra registrado en este gimnasio.',
                    user: {
                        gymUserId: gu.user_id,
                        geekUserId: gu.geek_user_id || null,
                        documentTypeId: gu.document_type_id,
                        document: gu.document_id,
                        firstName: gu.first_name,
                        middleName: gu.middle_name,
                        lastName: gu.last_name,
                        secondLastName: gu.second_last_name,
                        first_name: gu.first_name,
                        middle_name: gu.middle_name,
                        last_name: gu.last_name,
                        second_last_name: gu.second_last_name,
                        bloodTypeId: gu.blood_type_id || '',
                        genderId: gu.gender_id || '',
                        birthday: gu.birthday || '',
                        email: gu.email || '',
                        countryPhoneCode: gu.country_phone_code || '+58',
                        phoneNumber: gu.phone_number || '',
                        countryEmergencyPhoneCode: gu.country_emergency_phone_code || '+58',
                        emergencyPhoneNumber: gu.emergency_phone_number || '',
                        medicalCondition: gu.medical_condition || '',
                        countryId: 1,
                        stateId: '',
                        municipalityId: '',
                        parishId: '',
                        gymRoleId: gu.gym_role_id || ''
                    }
                });
            }

            return res.send({
                status: 'not_found',
                statusCode: 0,
                exists: false,
                existsInGym: false,
                existsInCentral: false,
                isAlreadyGymMember: false,
                message: 'No se encontró ningún usuario con el documento ingresado.'
            });
        }

        const user = rows[0];

        // Ensure the user in master schema has a secure_id in user_secure_id
        if (!user.secure_id && user.user_id) {
            const [uuidRows] = await dbConn.promise().query('SELECT UUID() AS uuid');
            user.secure_id = uuidRows[0].uuid;
            await dbConn.promise().query(
                `INSERT INTO \`${geekSchema}\`.user_secure_id (user_id, secure_id) VALUES (?, ?)`,
                [user.user_id, user.secure_id]
            );
        }

        const cleanStr = (val) => {
            if (val === null || val === undefined) return '';
            const s = String(val).trim();
            return (s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') ? '' : s;
        };

        const normalizePhoneCode = (code) => {
            const c = cleanStr(code);
            if (!c) return '+58';
            return c.startsWith('+') ? c : '+' + c;
        };

        const firstName = cleanStr(user.first_name);
        const middleName = cleanStr(user.middle_name);
        const lastName = cleanStr(user.last_name);
        const secondLastName = cleanStr(user.second_last_name);
        const cleanEmail = cleanStr(user.email);
        const cleanUsername = cleanStr(user.username) || null;
        const cleanPhoneCode = normalizePhoneCode(user.country_phone_code);
        const cleanPhone = cleanStr(user.phone_number);
        const cleanEmergPhoneCode = normalizePhoneCode(user.country_emergency_phone_code);
        const cleanEmergPhone = cleanStr(user.emergency_phone_number);
        const cleanMedical = cleanStr(user.medical_condition);

        // Resolve region hierarchy (parish, municipality, state, country)
        let regionHierarchy = {
            countryId: '',
            stateId: '',
            municipalityId: '',
            parishId: ''
        };

        if (user.region_id) {
            let currentId = Number(user.region_id);
            while (currentId) {
                let [rRows] = await dbConn.promise().query(
                    `SELECT country_region_id, parent_region_id, country_id, level FROM \`${geekSchema}\`.country_regions WHERE country_region_id = ?`,
                    [currentId]
                );
                if (rRows && rRows.length > 0) {
                    let r = rRows[0];
                    regionHierarchy.countryId = Number(r.country_id);
                    const lvl = Number(r.level);
                    if (lvl === 3) regionHierarchy.parishId = Number(r.country_region_id);
                    else if (lvl === 2) regionHierarchy.municipalityId = Number(r.country_region_id);
                    else if (lvl === 1) regionHierarchy.stateId = Number(r.country_region_id);
                    currentId = r.parent_region_id ? Number(r.parent_region_id) : null;
                } else {
                    break;
                }
            }
        }

        // Check if user is already in gimnasio.users (by geek_user_id, document, or email); if not, create the backup record
        let [gymUserRows] = await dbConn.promise().query(
            `SELECT user_id, gym_role_id, status_id
             FROM users
             WHERE geek_user_id = ?
                OR (document_type_id = ? AND TRIM(document_id) = ?)
                OR (email IS NOT NULL AND email <> '' AND LOWER(TRIM(email)) = LOWER(TRIM(?)))
             LIMIT 1`,
            [user.secure_id, user.document_type_id, user.document_id, cleanEmail]
        );
        let gymRole = null;
        let isAlreadyGymMember = false;
        let gymUserId = null;

        if (gymUserRows && gymUserRows.length > 0) {
            isAlreadyGymMember = true;
            gymUserId = gymUserRows[0].user_id;
            gymRole = gymUserRows[0].gym_role_id;

            // Always sync/update gimnasio.users from geekst.users (api-users)
            await dbConn.promise().query(
                `UPDATE users
                 SET geek_user_id = COALESCE(?, geek_user_id),
                     status_id = COALESCE(?, status_id),
                     document_type_id = ?,
                     document_id = ?,
                     blood_type_id = ?,
                     email = ?,
                     username = ?,
                     first_name = ?,
                     middle_name = ?,
                     last_name = ?,
                     second_last_name = ?,
                     gender_id = ?,
                     region_id = ?,
                     locality = ?,
                     birthday = ?,
                     avatar = ?,
                     country_phone_code = ?,
                     phone_number = ?,
                     country_emergency_phone_code = ?,
                     emergency_phone_number = ?,
                     medical_condition = ?
                 WHERE user_id = ?`,
                [
                    user.secure_id || null,
                    user.status_id || 1,
                    user.document_type_id,
                    user.document_id,
                    user.blood_type_id || null,
                    cleanEmail,
                    cleanUsername,
                    firstName,
                    middleName,
                    lastName,
                    secondLastName,
                    user.gender_id || null,
                    user.region_id || null,
                    user.locality || null,
                    user.birthday || null,
                    user.avatar || null,
                    cleanPhoneCode,
                    cleanPhone,
                    cleanEmergPhoneCode,
                    cleanEmergPhone,
                    cleanMedical,
                    gymUserId
                ]
            );
        } else {
            // User exists in master geekst.users (api-users), but NOT yet in local gimnasio.users
            isAlreadyGymMember = false;
            gymUserId = null;
            const regType = String(req.query.registration || '').trim().toLowerCase();
            const isPublicReg = (regType === 'client' || regType === 'coach');
            gymRole = isPublicReg ? (regType === 'coach' ? 3 : 2) : null;
        }

        return res.send({
            status: 'success',
            statusCode: 1,
            exists: true,
            existsInGym: isAlreadyGymMember,
            existsInCentral: true,
            isAlreadyGymMember: isAlreadyGymMember,
            message: isAlreadyGymMember
                ? 'El usuario ya se encuentra registrado en este gimnasio.'
                : 'Usuario encontrado en la plataforma general.',
            user: {
                gymUserId: gymUserId,
                geekUserId: user.secure_id,
                documentTypeId: user.document_type_id,
                document: user.document_id,
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                secondLastName: secondLastName,
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                second_last_name: secondLastName,
                bloodTypeId: user.blood_type_id || '',
                bloodType: user.blood_type || '',
                genderId: user.gender_id || '',
                birthday: user.birthday || '',
                email: cleanEmail,
                countryPhoneCode: cleanPhoneCode,
                phoneNumber: cleanPhone,
                countryEmergencyPhoneCode: cleanEmergPhoneCode,
                emergencyPhoneNumber: cleanEmergPhone,
                medicalCondition: cleanMedical,
                countryId: regionHierarchy.countryId || 1,
                stateId: regionHierarchy.stateId || '',
                municipalityId: regionHierarchy.municipalityId || '',
                parishId: regionHierarchy.parishId || '',
                avatar: user.avatar || '',
                avatarUrl: user.avatar ? `${process.env.API_GEEKST || 'https://api-users.geekst.com.ve'}/images/users/${user.avatar}` : '',
                gymRoleId: gymRole || ''
            }
        });

    } catch (error) {
        console.error('Error searching user by document:', error);
        return res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: error.message || 'Error al buscar el usuario'
        });
    }
});

router.get('/list', async function (req, res, next) {
    try {
        const langId = req.query.langId || 'esp';
        const languageId = (langId === 'eng' || langId === 2 || langId === '2') ? 2 : 1;
        const dbConn = require('../config/database.js');

        const [rows] = await dbConn.promise().query(
            `SELECT u.user_id,
                    u.geek_user_id,
                    u.first_name,
                    u.middle_name,
                    u.last_name,
                    u.second_last_name,
                    u.email,
                    u.username,
                    u.document_type_id,
                    u.document_id,
                    u.avatar,
                    u.status_id,
                    u.login_date,
                    COALESCE(u.gym_role_id, (
                        SELECT gur.role_id
                        FROM gym_user_roles gur
                        WHERE gur.user_id = u.user_id AND gur.status_id = 1
                        ORDER BY gur.gym_user_role_id DESC
                        LIMIT 1
                    ), 2) AS resolved_role_id
             FROM users u
             ORDER BY u.user_id DESC`
        );

        const [rolesRows] = await dbConn.promise().query(
            'SELECT gym_role_id, description FROM gym_roles_lang WHERE language_id = ?',
            [languageId]
        );
        const roleMap = {};
        for (const r of (rolesRows || [])) {
            roleMap[Number(r.gym_role_id)] = r.description;
        }

        const cleanStr = (val) => {
            if (val === null || val === undefined) return '';
            const s = String(val).trim();
            return (s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') ? '' : s;
        };

        const users = (rows || []).map(row => {
            const firstName = cleanStr(row.first_name);
            const middleName = cleanStr(row.middle_name);
            const lastName = cleanStr(row.last_name);
            const secondLastName = cleanStr(row.second_last_name);
            const fullName = [firstName, middleName, lastName, secondLastName].filter(Boolean).join(' ') || cleanStr(row.username) || cleanStr(row.email) || `Usuario #${row.user_id}`;

            const roleId = Number(row.resolved_role_id) || 2;
            const roleName = roleMap[roleId] || (roleId === 1 ? 'Administrador' : (roleId === 3 ? 'Entrenador' : 'Cliente'));
            const roleKey = roleId === 3 ? 'trainer' : (roleId === 1 ? 'admin' : 'client');

            const statusId = Number(row.status_id) || 1;
            const statusKey = statusId === 1 ? 'active' : (statusId === 3 ? 'pending' : 'inactive');
            const statusLabel = statusId === 1 ? 'Activo' : (statusId === 3 ? 'Pendiente' : 'Inactivo');

            let rawAvatar = cleanStr(row.avatar);
            if (rawAvatar === 'default-avatar.webp') {
                rawAvatar = '';
            }

            return {
                id: row.user_id,
                userId: row.user_id,
                geekUserId: cleanStr(row.geek_user_id),
                firstName,
                middleName,
                lastName,
                secondLastName,
                name: fullName,
                email: cleanStr(row.email),
                username: cleanStr(row.username),
                documentTypeId: cleanStr(row.document_type_id),
                document: cleanStr(row.document_id),
                roleId,
                role: roleName,
                roleKey,
                statusId,
                status: statusLabel,
                statusKey,
                avatar: rawAvatar || null,
                loginDate: row.login_date || null
            };
        });

        return res.send({
            status: 'success',
            statusCode: 1,
            users: users
        });
    } catch (error) {
        console.error('Error listing gym users:', error);
        return res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: error.message || 'Error al obtener la lista de usuarios'
        });
    }
});

module.exports = router;
