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

const formatUserAvatarUrl = (rawAvatar) => {
    if (!rawAvatar || rawAvatar === 'default-avatar.webp') return '';
    if (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://')) return rawAvatar;
    const baseApi = process.env.API_GEEKST || 'http://localhost:3001';
    const clean = rawAvatar.startsWith('/') ? rawAvatar.slice(1) : rawAvatar;
    const finalPath = clean.startsWith('images/users/') ? clean : `images/users/${clean}`;
    return `${baseApi}/${finalPath}`;
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
                    const roleId = registrationType === 'coach' ? 2 : 3;
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

async function getUserGyms(dbConn, geekUserId, email, langId = 'esp') {
    try {
        const langNum = (langId === 'eng' || langId === 'en') ? 2 : 1;
        const apiPublic = process.env.API_PUBLIC || 'http://localhost:3002';

        const [rows] = await dbConn.promise().query(
            `SELECT DISTINCT 
                g.gym_id AS gymId, 
                g.name, 
                g.slug, 
                COALESCE(g.primary_color, '#2563eb') AS primaryColor,
                COALESCE(g.secondary_color, '#1d4ed8') AS secondaryColor,
                COALESCE(g.sidebar_color, '#0f172a') AS sidebarColor,
                IF(g.logo IS NOT NULL AND g.logo != '', 
                   CONCAT('${apiPublic}/images/gyms/', g.gym_id, '/', g.logo), 
                   NULL
                ) AS logo,
                gur.role_id AS roleId,
                COALESCE(grl.description, 'Miembro') AS roleName,
                gur.status_id AS statusId
             FROM gyms g
             INNER JOIN gym_user_roles gur ON gur.gym_id = g.gym_id
             INNER JOIN users u ON u.user_id = gur.user_id
             LEFT JOIN gym_roles_lang grl ON grl.gym_role_id = gur.role_id AND grl.language_id = ?
             WHERE (u.geek_user_id = ? OR (u.email IS NOT NULL AND LOWER(TRIM(u.email)) = LOWER(TRIM(?))))
               AND gur.status_id = 1
             ORDER BY gur.role_id ASC, g.name ASC`,
            [langNum, geekUserId || '', email || '']
        );

        let finalRows = rows;
        if (!finalRows || finalRows.length === 0) {
            const [fallbackRows] = await dbConn.promise().query(
                `SELECT DISTINCT 
                    g.gym_id AS gymId, 
                    g.name, 
                    g.slug, 
                    COALESCE(g.primary_color, '#2563eb') AS primaryColor,
                    COALESCE(g.secondary_color, '#1d4ed8') AS secondaryColor,
                    COALESCE(g.sidebar_color, '#0f172a') AS sidebarColor,
                    IF(g.logo IS NOT NULL AND g.logo != '', 
                       CONCAT('${apiPublic}/images/gyms/', g.gym_id, '/', g.logo), 
                       NULL
                    ) AS logo,
                    gur.role_id AS roleId,
                    COALESCE(grl.description, 'Miembro') AS roleName,
                    gur.status_id AS statusId
                 FROM gyms g
                 INNER JOIN gym_user_roles gur ON gur.gym_id = g.gym_id
                 INNER JOIN users u ON u.user_id = gur.user_id
                 LEFT JOIN gym_roles_lang grl ON grl.gym_role_id = gur.role_id AND grl.language_id = ?
                 WHERE (u.geek_user_id = ? OR (u.email IS NOT NULL AND LOWER(TRIM(u.email)) = LOWER(TRIM(?))))
                 ORDER BY gur.role_id ASC, g.name ASC`,
                [langNum, geekUserId || '', email || '']
            );
            finalRows = fallbackRows;
        }

        const gymsMap = new Map();
        for (const r of (finalRows || [])) {
            if (!gymsMap.has(r.gymId)) {
                gymsMap.set(r.gymId, {
                    gymId: r.gymId,
                    name: r.name,
                    slug: r.slug,
                    logo: r.logo,
                    primaryColor: r.primaryColor,
                    secondaryColor: r.secondaryColor,
                    sidebarColor: r.sidebarColor,
                    roleId: r.roleId,
                    roleName: r.roleName,
                    statusId: r.statusId
                });
            }
        }
        return Array.from(gymsMap.values());
    } catch (err) {
        console.error('Error in getUserGyms:', err);
        return [];
    }
}

router.get('/my-gyms', async function (req, res, next) {
    try {
        const userId = req.query.userId;
        const email = req.query.email;
        const langId = req.query.langId || 'esp';
        const dbConn = require('../config/database.js');
        const gyms = await getUserGyms(dbConn, userId, email, langId);
        return res.send({
            status: 'success',
            statusCode: 1,
            gyms: gyms
        });
    } catch (err) {
        console.error('Error in /my-gyms:', err);
        return res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: 'Error al consultar gimnasios del usuario',
            gyms: []
        });
    }
});

router.post('/google-sign-in', async function (req, res, next) {
    try {
        const credential = req.body?.credential || req.query?.credential;
        const code = req.body?.code || req.query?.code;
        let langId = req.body?.langId || req.query?.langId || 'esp';
        const gymSlug = req.body?.gymSlug || req.query?.gymSlug || '';
        const langData = langs(langId);

        if (!credential && !code) {
            return res.send({
                message: 'No se recibió la credencial de autenticación de Google',
                status: 'error',
                statusCode: 0
            });
        }

        let googlePayload = null;
        if (credential) {
            try {
                const verifyRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
                googlePayload = verifyRes.data;
            } catch (err) {
                console.error('Error validando token de Google:', err.response?.data || err.message);
                return res.send({
                    message: 'Credencial de Google inválida o expirada',
                    status: 'error',
                    statusCode: 0
                });
            }
        } else if (code) {
            try {
                const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
                    code: code,
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    redirect_uri: 'postmessage',
                    grant_type: 'authorization_code'
                });
                const idToken = tokenRes.data.id_token;
                const verifyRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
                googlePayload = verifyRes.data;
            } catch (err) {
                console.error('Error intercambiando código de Google:', err.response?.data || err.message);
                return res.send({
                    message: 'Error al verificar autorización de Google',
                    status: 'error',
                    statusCode: 0
                });
            }
        }

        if (!googlePayload || !googlePayload.email) {
            return res.send({
                message: 'No se pudo obtener información del perfil de Google',
                status: 'error',
                statusCode: 0
            });
        }

        const email = googlePayload.email.toLowerCase().trim();
        const firstName = googlePayload.given_name || (googlePayload.name ? googlePayload.name.split(' ')[0] : 'Usuario');
        const lastName = googlePayload.family_name || (googlePayload.name && googlePayload.name.includes(' ') ? googlePayload.name.split(' ').slice(1).join(' ') : '');
        const googlePicture = googlePayload.picture || null;

        const dbConn = require('../config/database.js');
        const geekSchema = process.env.DB_USER_GEEK_SCHEMA || 'geekst';

        // 1. Verificar si el usuario ya existe en geekst.users
        const [userRows] = await dbConn.promise().query(
            `SELECT u.user_id, u.document_id, u.username, u.first_name, u.avatar, u.status_id, usi.secure_id 
             FROM \`${geekSchema}\`.users u 
             LEFT JOIN \`${geekSchema}\`.user_secure_id usi ON usi.user_id = u.user_id 
             WHERE LOWER(u.email) = ? LIMIT 1`,
            [email]
        );

        let secureId = null;
        let userData = null;

        if (userRows && userRows.length > 0) {
            const existingUser = userRows[0];

            if (existingUser.status_id === 2) {
                return res.send({
                    message: langData.accessCode?.warning?.userInactive || 'Su cuenta está en estado INACTIVO.',
                    status: 'warning',
                    statusCode: 5
                });
            }

            secureId = existingUser.secure_id;
            if (!secureId) {
                const [uuidRes] = await dbConn.promise().query(`SELECT UUID() as uuid`);
                secureId = uuidRes[0].uuid;
                await dbConn.promise().query(
                    `INSERT INTO \`${geekSchema}\`.user_secure_id (user_id, secure_id) VALUES (?, ?)`,
                    [existingUser.user_id, secureId]
                );
            }

            let currentStatus = existingUser.status_id;
            if (currentStatus === 3) {
                await dbConn.promise().query(
                    `UPDATE \`${geekSchema}\`.users SET status_id = 1 WHERE user_id = ?`,
                    [existingUser.user_id]
                );
                currentStatus = 1;
            }

            let userAvatar = existingUser.avatar;
            if ((!userAvatar || userAvatar === 'default-avatar.webp' || userAvatar === '') && googlePicture) {
                await dbConn.promise().query(
                    `UPDATE \`${geekSchema}\`.users SET avatar = ? WHERE user_id = ?`,
                    [googlePicture, existingUser.user_id]
                );
                userAvatar = googlePicture;
            }

            await usersModel.signIn([secureId, langId]);

            userData = {
                avatar: formatUserAvatarUrl(userAvatar || googlePicture) || 'default-avatar.webp',
                documentId: existingUser.document_id || '',
                email: email,
                id: secureId,
                name: existingUser.first_name || existingUser.username,
                username: existingUser.username,
                userStatusId: currentStatus
            };

        } else {
            // 2. Nuevo usuario -> auto-registro en geekst
            let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase().substring(0, 18);
            if (!baseUsername || baseUsername.length < 3) baseUsername = 'user';
            let finalUsername = baseUsername;
            let counter = 1;

            while (true) {
                const [existing] = await dbConn.promise().query(
                    `SELECT user_id FROM \`${geekSchema}\`.users WHERE username = ? LIMIT 1`,
                    [finalUsername]
                );
                if (existing.length === 0) break;
                finalUsername = `${baseUsername.substring(0, 14)}${Math.floor(100 + Math.random() * 900)}`;
                counter++;
                if (counter > 10) {
                    finalUsername = `${baseUsername.substring(0, 10)}${Date.now().toString().slice(-6)}`;
                    break;
                }
            }

            const [insertRes] = await dbConn.promise().query(
                `INSERT INTO \`${geekSchema}\`.users 
                 (email, username, first_name, last_name, avatar, system_id_referred, status_id) 
                 VALUES (?, ?, ?, ?, ?, 2, 1)`,
                [email, finalUsername, firstName, lastName, googlePicture || 'default-avatar.webp']
            );
            const newUserId = insertRes.insertId;

            const [uuidRes] = await dbConn.promise().query(`SELECT UUID() as uuid`);
            secureId = uuidRes[0].uuid;

            await dbConn.promise().query(
                `INSERT INTO \`${geekSchema}\`.user_secure_id (user_id, secure_id) VALUES (?, ?)`,
                [newUserId, secureId]
            );

            await usersModel.signIn([secureId, langId]);

            userData = {
                avatar: googlePicture || 'default-avatar.webp',
                documentId: '',
                email: email,
                id: secureId,
                name: firstName || finalUsername,
                username: finalUsername,
                userStatusId: 1
            };
        }

        // 3. Sincronizar / registrar en gimnasio.users
        try {
            const [gymUserRows] = await dbConn.promise().query(
                `SELECT user_id FROM users WHERE geek_user_id = ? OR (email IS NOT NULL AND LOWER(TRIM(email)) = ?) LIMIT 1`,
                [secureId, email]
            );

            let localUserId = null;
            if (gymUserRows && gymUserRows.length > 0) {
                localUserId = gymUserRows[0].user_id;
                await dbConn.promise().query(
                    `UPDATE users SET 
                        geek_user_id = ?, 
                        login_date = NOW(),
                        avatar = COALESCE(NULLIF(avatar, ''), ?) 
                     WHERE user_id = ?`,
                    [secureId, googlePicture || 'default-avatar.webp', localUserId]
                );
            } else {
                const [insertGymUserRes] = await dbConn.promise().query(
                    `INSERT INTO users (
                        geek_user_id,
                        first_name,
                        last_name,
                        email,
                        username,
                        avatar,
                        status_id,
                        login_date
                     ) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
                    [
                        secureId,
                        firstName,
                        lastName,
                        email,
                        userData.username,
                        googlePicture || 'default-avatar.webp'
                    ]
                );
                localUserId = insertGymUserRes.insertId;

                let targetGymId = 1;
                if (gymSlug) {
                    const [targetGym] = await dbConn.promise().query(
                        `SELECT gym_id FROM gyms WHERE slug = ? LIMIT 1`,
                        [gymSlug]
                    );
                    if (targetGym && targetGym.length > 0) {
                        targetGymId = targetGym[0].gym_id;
                    }
                }

                if (localUserId && targetGymId) {
                    await dbConn.promise().query(
                        `INSERT INTO gym_user_roles (gym_id, user_id, role_id, status_id) VALUES (?, ?, 2, 1)`,
                        [targetGymId, localUserId]
                    );
                }
            }
        } catch (gymSyncErr) {
            console.error('Error sincronizando usuario de Google en gimnasio.users:', gymSyncErr);
        }

        userData.gyms = await getUserGyms(dbConn, userData.id, userData.email, langId);

        return res.send({
            message: langData.signIn?.success || 'Bienvenid@, pronto será redireccionad@',
            status: 'success',
            statusCode: 1,
            userData: userData
        });

    } catch (err) {
        console.error('Error in /google-sign-in:', err);
        return res.send({
            message: 'Error interno del servidor al autenticar con Google',
            status: 'error',
            statusCode: 0
        });
    }
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
                    avatar: formatUserAvatarUrl(rs.data.response.avatar) || 'default-avatar.webp',
                    documentId: rs.data.response.documentId,
                    email: email,
                    id: rs.data.response.userId,
                    name: rs.data.response.name,
                    username: rs.data.response.username,
                    userStatusId: rs.data.userStatusId
                };

                const dbConn = require('../config/database.js');
                userData.gyms = await getUserGyms(dbConn, userData.id, userData.email, langId);

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
    let roleId = (registration === 'coach') ? 2 : 3;
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

    const payload = Object.keys(req.body || {}).length > 0 ? req.body : req.query;
    const email = payload.email;
    const langId = payload.langId;
    const userId = payload.userId;

    let params = {
        userId: userId,
        firstName: payload.firstName,
        middleName: payload.middleName,
        lastName: payload.lastName,
        secondLastName: payload.secondLastName,
        nickname: payload.nickname,
        documentTypeId: payload.documentTypeId,
        document: payload.document,
        birthday: payload.birthday,
        genderId: payload.genderId,
        bloodTypeId: payload.bloodTypeId,
        countryPhoneCode: payload.countryPhoneCode,
        phoneNumber: payload.phoneNumber,
        countryEmergencyPhoneCode: payload.countryEmergencyPhoneCode,
        emergencyPhoneNumber: payload.emergencyPhoneNumber,
        medicalCondition: payload.medicalCondition,
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

                // Actualizar inmediatamente en gimnasio.users localmente
                try {
                    const dbConn = require('../config/database.js').promise();
                    await dbConn.query(
                        `UPDATE users SET
                            first_name = COALESCE(?, first_name),
                            middle_name = ?,
                            last_name = COALESCE(?, last_name),
                            second_last_name = ?,
                            nickname = ?,
                            document_type_id = COALESCE(?, document_type_id),
                            document_id = COALESCE(?, document_id),
                            birthday = COALESCE(?, birthday),
                            gender_id = COALESCE(?, gender_id),
                            blood_type_id = COALESCE(?, blood_type_id),
                            country_phone_code = COALESCE(?, country_phone_code),
                            phone_number = COALESCE(?, phone_number),
                            country_emergency_phone_code = COALESCE(?, country_emergency_phone_code),
                            emergency_phone_number = COALESCE(?, emergency_phone_number),
                            medical_condition = COALESCE(?, medical_condition)
                         WHERE geek_user_id = ? OR user_id = ?`,
                        [
                            payload.firstName, payload.middleName || null,
                            payload.lastName, payload.secondLastName || null,
                            payload.nickname !== undefined ? payload.nickname : null,
                            payload.documentTypeId, payload.document,
                            payload.birthday || null, payload.genderId || null,
                            payload.bloodTypeId || null, payload.countryPhoneCode,
                            payload.phoneNumber, payload.countryEmergencyPhoneCode,
                            payload.emergencyPhoneNumber, payload.medicalCondition || null,
                            userId, userId
                        ]
                    );
                } catch (localUpdateErr) {
                    console.error('Error actualizando gimnasio.users local:', localUpdateErr);
                }

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
            ? (registration === 'coach' ? 2 : 3)
            : (parseInt(payload.roleId, 10) || 3);
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
                const avatarFile = req.files.avatar || req.files.photo || req.files.image;
                const fd = new FormData();
                const blob = new Blob([avatarFile.data], { type: avatarFile.mimetype || 'application/octet-stream' });
                fd.append('avatar', blob, avatarFile.name || 'avatar.jpg');
                fd.append('userId', geekUserId || masterUserId);

                const uploadUrl = `${process.env.API_GEEKST || 'http://localhost:3001'}/users/upload-avatar`;
                const uploadRs = await axios.post(uploadUrl, fd, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'application/json, text/plain, */*'
                    }
                });

                if (uploadRs.data && uploadRs.data.avatar) {
                    const avatarRelativePath = uploadRs.data.avatar;
                    await dbConn.promise().query(
                        `UPDATE users SET avatar = ? WHERE user_id = ?`,
                        [avatarRelativePath, gymUserId]
                    );
                }
            } catch (avatarErr) {
                console.error('Error enviando avatar a api-users desde api-gimnasio:', avatarErr.response?.data || avatarErr.message);
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
            const roleDescription = (roleId === 2 || registration === 'coach') ? 'Entrenador' : 'Cliente';
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
            gymRole = isPublicReg ? (regType === 'coach' ? 2 : 3) : null;
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
        const geekSchema = process.env.DB_USER_GEEK_SCHEMA || 'geekst';

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
                    u.blood_type_id,
                    u.gender_id,
                    u.region_id,
                    u.locality,
                    DATE_FORMAT(u.birthday, "%Y-%m-%d") AS birthday,
                    u.country_phone_code,
                    u.phone_number,
                    u.country_emergency_phone_code,
                    u.emergency_phone_number,
                    u.medical_condition,
                    COALESCE(NULLIF(u.avatar, ''), NULLIF(u.avatar, 'default-avatar.webp'), gu.avatar) AS avatar,
                    u.status_id,
                    u.login_date,
                    DATE_FORMAT(u.joined_at, "%Y-%m-%d") AS joined_at,
                    u.billing_anchor_day,
                    u.gym_role_id,
                    (
                        SELECT GROUP_CONCAT(DISTINCT gur.role_id ORDER BY gur.role_id ASC SEPARATOR ',')
                        FROM gym_user_roles gur
                        WHERE gur.user_id = u.user_id
                    ) AS assigned_role_ids
             FROM users u
             LEFT JOIN \`${geekSchema}\`.user_secure_id usi ON usi.secure_id = u.geek_user_id
             LEFT JOIN \`${geekSchema}\`.users gu ON gu.user_id = usi.user_id
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

        const [bloodRows] = await dbConn.promise().query(
            `SELECT blood_type_id, description FROM \`${geekSchema}\`.blood_type`
        ).catch(() => [[]]);
        const bloodMap = {};
        for (const b of (bloodRows || [])) {
            bloodMap[Number(b.blood_type_id)] = b.description;
        }

        const [genderRows] = await dbConn.promise().query(
            `SELECT gender_type_id, description FROM \`${geekSchema}\`.gender_types_lang WHERE language_id = ?`,
            [languageId]
        ).catch(() => [[]]);
        const genderMap = {};
        for (const g of (genderRows || [])) {
            genderMap[Number(g.gender_type_id)] = g.description;
        }

        const [docTypeRows] = await dbConn.promise().query(
            `SELECT document_type_id, description FROM \`${geekSchema}\`.document_type_lang WHERE language_id = ?`,
            [languageId]
        ).catch(() => [[]]);
        const docTypeMap = {};
        for (const d of (docTypeRows || [])) {
            docTypeMap[Number(d.document_type_id)] = d.description;
        }

        const [allRegions] = await dbConn.promise().query(
            `SELECT country_region_id, parent_region_id, description, level FROM \`${geekSchema}\`.country_regions`
        ).catch(() => [[]]);
        const regionById = {};
        for (const reg of (allRegions || [])) {
            regionById[Number(reg.country_region_id)] = reg;
        }

        const resolveLocation = (regionId, locality) => {
            let parts = [];
            if (locality) parts.push(locality);
            let curr = Number(regionId);
            while (curr && regionById[curr]) {
                const item = regionById[curr];
                parts.push(item.description);
                curr = item.parent_region_id ? Number(item.parent_region_id) : null;
            }
            return parts.filter(Boolean).join(', ');
        };

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

            let roleIds = [];
            if (row.assigned_role_ids) {
                roleIds = String(row.assigned_role_ids)
                    .split(',')
                    .map(id => Number(id.trim()))
                    .filter(id => !isNaN(id) && id > 0);
            }
            if (roleIds.length === 0) {
                const fallbackRoleId = Number(row.gym_role_id) || 3;
                roleIds = [fallbackRoleId];
            }

            const roles = roleIds.map(rId => {
                const rName = roleMap[rId] || (rId === 1 ? 'Administrador' : (rId === 2 ? 'Entrenador' : 'Cliente'));
                const rKey = rId === 1 ? 'admin' : (rId === 2 ? 'trainer' : 'client');
                return {
                    id: rId,
                    name: rName,
                    key: rKey
                };
            });

            const primaryRole = roles[0] || { id: 3, name: 'Cliente', key: 'client' };
            const roleId = primaryRole.id;
            const roleName = roles.map(r => r.name).join(', ');
            const roleKey = primaryRole.key;

            const statusId = Number(row.status_id) || 1;
            const statusKey = statusId === 1 ? 'active' : (statusId === 3 ? 'pending' : 'inactive');
            const statusLabel = statusId === 1 ? 'Activo' : (statusId === 3 ? 'Pendiente' : 'Inactivo');

            let rawAvatar = cleanStr(row.avatar);
            if (rawAvatar === 'default-avatar.webp') {
                rawAvatar = '';
            }
            const avatarUrl = rawAvatar 
                ? (rawAvatar.startsWith('http') ? rawAvatar : `${process.env.API_GEEKST || 'http://localhost:3001'}/images/users/${rawAvatar}`) 
                : null;

            const phoneCode = cleanStr(row.country_phone_code);
            const rawPhone = cleanStr(row.phone_number);
            const phone = (phoneCode || rawPhone) ? `${phoneCode} ${rawPhone}`.trim() : '';

            const emergPhoneCode = cleanStr(row.country_emergency_phone_code);
            const rawEmergPhone = cleanStr(row.emergency_phone_number);
            const emergencyPhone = (emergPhoneCode || rawEmergPhone) ? `${emergPhoneCode} ${rawEmergPhone}`.trim() : '';

            let age = null;
            if (row.birthday) {
                const birthDate = new Date(row.birthday);
                if (!isNaN(birthDate.getTime())) {
                    const today = new Date();
                    age = today.getFullYear() - birthDate.getFullYear();
                    const m = today.getMonth() - birthDate.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                }
            }

            const location = resolveLocation(row.region_id, cleanStr(row.locality));
            const docPrefix = row.document_type_id === '2' ? 'P-' : 'V-';
            const documentFormatted = row.document_id ? `${docPrefix}${cleanStr(row.document_id)}` : '';

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
                documentType: docTypeMap[Number(row.document_type_id)] || (row.document_type_id === '2' ? 'Pasaporte' : 'Cédula'),
                document: cleanStr(row.document_id),
                documentFormatted,
                genderId: row.gender_id ? Number(row.gender_id) : null,
                gender: genderMap[Number(row.gender_id)] || (Number(row.gender_id) === 1 ? 'Mujer' : (Number(row.gender_id) === 2 ? 'Hombre' : '')),
                bloodTypeId: row.blood_type_id ? Number(row.blood_type_id) : null,
                bloodType: bloodMap[Number(row.blood_type_id)] || '',
                birthday: row.birthday || null,
                age,
                countryPhoneCode: phoneCode,
                phoneNumber: rawPhone,
                phone,
                countryEmergencyPhoneCode: emergPhoneCode,
                emergencyPhoneNumber: rawEmergPhone,
                emergencyPhone,
                medicalCondition: cleanStr(row.medical_condition),
                locality: cleanStr(row.locality),
                regionId: row.region_id,
                location,
                roleId,
                role: roleName,
                roleKey,
                roles,
                statusId,
                status: statusLabel,
                statusKey,
                avatar: avatarUrl,
                loginDate: row.login_date || null,
                joinedAt: row.joined_at || null,
                billingAnchorDay: row.billing_anchor_day ? Number(row.billing_anchor_day) : null
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

router.post('/update-status-role', async function (req, res, next) {
    try {
        const dbConn = require('../config/database.js');
        const geekSchema = process.env.DB_USER_GEEK_SCHEMA || 'geekst';

        const payload = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
        const rawUserId = payload.userId || req.body?.userId || req.query?.userId || payload.id;
        const userId = Number(rawUserId);
        if (!userId) {
            return res.status(400).send({
                status: 'error',
                statusCode: 0,
                message: 'El ID de usuario es requerido'
            });
        }

        // Check if user exists
        const [userRows] = await dbConn.promise().query(
            'SELECT user_id, geek_user_id, status_id, gym_role_id FROM users WHERE user_id = ?',
            [userId]
        );
        if (!userRows || userRows.length === 0) {
            return res.status(404).send({
                status: 'error',
                statusCode: 0,
                message: 'Usuario no encontrado'
            });
        }
        const currentUser = userRows[0];

        // 1. Update status if provided
        const rawStatus = payload.statusId !== undefined ? payload.statusId : (req.body?.statusId !== undefined ? req.body.statusId : req.query?.statusId);
        let newStatusId = rawStatus !== undefined ? Number(rawStatus) : currentUser.status_id;
        if (![1, 2, 3].includes(newStatusId)) {
            newStatusId = currentUser.status_id;
        }

        await dbConn.promise().query(
            'UPDATE users SET status_id = ? WHERE user_id = ?',
            [newStatusId, userId]
        );

        // Also update status in gym_user_roles
        await dbConn.promise().query(
            'UPDATE gym_user_roles SET status_id = ? WHERE user_id = ?',
            [newStatusId, userId]
        );

        // If user has geek_user_id, also update status in geekst.users
        if (currentUser.geek_user_id) {
            await dbConn.promise().query(
                `UPDATE \`${geekSchema}\`.users u
                 INNER JOIN \`${geekSchema}\`.user_secure_id usi ON usi.user_id = u.user_id
                 SET u.status_id = ?
                 WHERE usi.secure_id = ?`,
                [newStatusId, currentUser.geek_user_id]
            ).catch(err => console.error('Error syncing status to geekst.users:', err));
        }

        // 2. Update roles if provided
        let roleIds = [];
        const rawRoles = payload.roleIds || req.body?.roleIds || req.query?.roleIds;
        if (Array.isArray(rawRoles) && rawRoles.length > 0) {
            roleIds = rawRoles.map(id => Number(id)).filter(id => [1, 2, 3].includes(id));
        } else if (typeof rawRoles === 'string') {
            roleIds = rawRoles.split(',').map(id => Number(id.trim())).filter(id => [1, 2, 3].includes(id));
        } else if (payload.roleId || req.body?.roleId || req.query?.roleId) {
            const singleId = Number(payload.roleId || req.body?.roleId || req.query?.roleId);
            if ([1, 2, 3].includes(singleId)) {
                roleIds = [singleId];
            }
        }

        if (roleIds.length > 0) {
            const gymId = 1;

            // Remove roles no longer assigned
            await dbConn.promise().query(
                'DELETE FROM gym_user_roles WHERE user_id = ? AND role_id NOT IN (?)',
                [userId, roleIds]
            );

            // Insert new roles if not already existing
            for (const rId of roleIds) {
                const [existing] = await dbConn.promise().query(
                    'SELECT gym_user_role_id FROM gym_user_roles WHERE user_id = ? AND role_id = ?',
                    [userId, rId]
                );
                if (!existing || existing.length === 0) {
                    await dbConn.promise().query(
                        'INSERT INTO gym_user_roles (gym_id, user_id, role_id, status_id) VALUES (?, ?, ?, ?)',
                        [gymId, userId, rId, newStatusId]
                    );
                }
            }

            // Update primary role in users table
            const primaryRoleId = roleIds[0];
            await dbConn.promise().query(
                'UPDATE users SET gym_role_id = ? WHERE user_id = ?',
                [primaryRoleId, userId]
            );
        }

        // 3. Fetch updated roles and descriptions
        const langId = req.body.langId || 'esp';
        const languageId = (langId === 'eng' || langId === 2 || langId === '2') ? 2 : 1;

        const [rolesRows] = await dbConn.promise().query(
            'SELECT gym_role_id, description FROM gym_roles_lang WHERE language_id = ?',
            [languageId]
        );
        const roleMap = {};
        for (const r of (rolesRows || [])) {
            roleMap[Number(r.gym_role_id)] = r.description;
        }

        const [userGurRows] = await dbConn.promise().query(
            'SELECT DISTINCT role_id FROM gym_user_roles WHERE user_id = ? ORDER BY role_id ASC',
            [userId]
        );
        let finalRoleIds = (userGurRows || []).map(r => Number(r.role_id));
        if (finalRoleIds.length === 0) {
            finalRoleIds = [currentUser.gym_role_id || 3];
        }

        const updatedRoles = finalRoleIds.map(rId => ({
            id: rId,
            name: roleMap[rId] || (rId === 1 ? 'Administrador' : (rId === 2 ? 'Entrenador' : 'Cliente')),
            key: rId === 1 ? 'admin' : (rId === 2 ? 'trainer' : 'client')
        }));

        const statusLabel = newStatusId === 1 ? 'Activo' : (newStatusId === 3 ? 'Pendiente' : 'Inactivo');
        const statusKey = newStatusId === 1 ? 'active' : (newStatusId === 3 ? 'pending' : 'inactive');

        return res.send({
            status: 'success',
            statusCode: 1,
            message: 'Estado y roles actualizados con éxito',
            user: {
                userId,
                statusId: newStatusId,
                status: statusLabel,
                statusKey,
                roleId: updatedRoles[0]?.id || 3,
                role: updatedRoles.map(r => r.name).join(', '),
                roleKey: updatedRoles[0]?.key || 'client',
                roles: updatedRoles
            }
        });
    } catch (error) {
        console.error('Error updating gym user status/role:', error);
        return res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: error.message || 'Error al actualizar el estado y rol del usuario'
        });
    }
});

router.post('/update-billing-profile', async function (req, res, next) {
    try {
        const dbConn = require('../config/database.js').promise();
        const payload = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
        const userId = Number(payload.userId || payload.user_id || payload.id);
        const joinedAt = payload.joinedAt || payload.joined_at;
        const billingAnchorDay = payload.billingAnchorDay !== undefined ? payload.billingAnchorDay : payload.billing_anchor_day;

        if (!userId) {
            return res.status(400).send({
                status: 'error',
                statusCode: 0,
                message: 'userId es requerido'
            });
        }

        const updates = [];
        const params = [];
        if (joinedAt) {
            updates.push('joined_at = ?');
            params.push(joinedAt);
        }
        if (billingAnchorDay !== undefined && billingAnchorDay !== null && billingAnchorDay !== '') {
            updates.push('billing_anchor_day = ?');
            params.push(Number(billingAnchorDay));
        } else if (billingAnchorDay === '' || billingAnchorDay === null) {
            updates.push('billing_anchor_day = NULL');
        }

        if (updates.length > 0) {
            params.push(userId);
            await dbConn.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, params);
        }

        return res.send({
            status: 'success',
            statusCode: 1,
            message: 'Fechas de membresía y cobro actualizadas exitosamente'
        });
    } catch (error) {
        console.error('Error updating billing profile:', error);
        return res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: error.message || 'Error al actualizar el perfil de membresía'
        });
    }
});

/**
 * Webhook de sincronización recibido desde api-users
 * Actualiza los datos del usuario localmente en gimnasio.users
 */
router.post('/sync-profile', async function (req, res, next) {
    try {
        const expectedSecret = process.env.WEBHOOK_SECRET || 'Clickear.2026';
        const incomingSecret = req.headers['x-webhook-secret'];
        if (expectedSecret && incomingSecret && incomingSecret !== expectedSecret) {
            return res.status(403).send({ status: 'error', message: 'Firma o secreto inválido' });
        }

        const { geekUserId, data } = req.body;
        if (!geekUserId || !data) {
            return res.status(400).send({ status: 'error', message: 'Payload de sincronización incompleto' });
        }

        const dbConn = require('../config/database.js').promise();

        // 1. Verificar si el usuario existe en gimnasio.users por geek_user_id o por email
        const [existing] = await dbConn.query(
            `SELECT user_id FROM users WHERE geek_user_id = ? OR (email IS NOT NULL AND LOWER(TRIM(email)) = ?) LIMIT 1`,
            [geekUserId, (data.email || '').toLowerCase().trim()]
        );

        if (existing && existing.length > 0) {
            const localUserId = existing[0].user_id;

            const fields = [];
            const values = [];

            if (data.first_name !== undefined) { fields.push('first_name = ?'); values.push(data.first_name); }
            if (data.middle_name !== undefined) { fields.push('middle_name = ?'); values.push(data.middle_name); }
            if (data.last_name !== undefined) { fields.push('last_name = ?'); values.push(data.last_name); }
            if (data.second_last_name !== undefined) { fields.push('second_last_name = ?'); values.push(data.second_last_name); }
            if (data.email) { fields.push('email = ?'); values.push(data.email); }
            if (data.username) { fields.push('username = ?'); values.push(data.username); }
            if (data.nickname !== undefined) { fields.push('nickname = ?'); values.push(data.nickname); }
            if (data.document_type_id !== undefined) { fields.push('document_type_id = ?'); values.push(data.document_type_id); }
            if (data.document_id !== undefined) { fields.push('document_id = ?'); values.push(data.document_id); }
            if (data.birthday) { fields.push('birthday = ?'); values.push(data.birthday); }
            if (data.gender_id !== undefined) { fields.push('gender_id = ?'); values.push(data.gender_id); }
            if (data.blood_type_id !== undefined) { fields.push('blood_type_id = ?'); values.push(data.blood_type_id); }
            if (data.country_phone_code !== undefined) { fields.push('country_phone_code = ?'); values.push(data.country_phone_code); }
            if (data.phone_number !== undefined) { fields.push('phone_number = ?'); values.push(data.phone_number); }
            if (data.country_emergency_phone_code !== undefined) { fields.push('country_emergency_phone_code = ?'); values.push(data.country_emergency_phone_code); }
            if (data.emergency_phone_number !== undefined) { fields.push('emergency_phone_number = ?'); values.push(data.emergency_phone_number); }
            if (data.medical_condition !== undefined) { fields.push('medical_condition = ?'); values.push(data.medical_condition); }
            if (data.region_id !== undefined) { fields.push('region_id = ?'); values.push(data.region_id); }
            if (data.locality !== undefined) { fields.push('locality = ?'); values.push(data.locality); }
            if (data.avatar) { fields.push('avatar = ?'); values.push(data.avatar); }
            if (geekUserId) { fields.push('geek_user_id = ?'); values.push(geekUserId); }

            if (fields.length > 0) {
                values.push(localUserId);
                await dbConn.query(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, values);
            }

            console.log(`[WEBHOOK SYNC GIMNASIO] Usuario actualizado localmente: user_id ${localUserId} (${geekUserId})`);
            return res.send({ status: 'success', message: 'Usuario sincronizado exitosamente en gimnasio' });
        } else {
            console.log(`[WEBHOOK SYNC GIMNASIO] Usuario ${geekUserId} no pertenece a este gimnasio (ignorado).`);
            return res.send({ status: 'ignored', message: 'Usuario no registrado en este gimnasio' });
        }
    } catch (error) {
        console.error('[WEBHOOK SYNC GIMNASIO ERROR]:', error);
        return res.status(500).send({ status: 'error', message: error.message });
    }
});

module.exports = router;
