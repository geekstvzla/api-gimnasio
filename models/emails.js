let transporter = require('../config/mail.js');
const Email = require('email-templates');
const path = require('path');
const fs = require('fs');

const getGymInfoForEmail = async (slugOrId) => {
    try {
        const dbConn = require('../config/database.js');
        let query;
        let queryParams;
        if (slugOrId) {
            query = 'SELECT gym_id, name, slug, logo FROM gyms WHERE slug = ? OR gym_id = ? LIMIT 1;';
            queryParams = [slugOrId, slugOrId];
        } else {
            query = 'SELECT gym_id, name, slug, logo FROM gyms LIMIT 1;';
            queryParams = [];
        }
        const [rows] = await dbConn.promise().query(query, queryParams);
        if (rows && rows.length > 0) {
            const gym = rows[0];
            const logoPath = gym.logo ? path.join(__dirname, '..', 'public', 'images', 'gyms', String(gym.gym_id), gym.logo) : null;
            return {
                gymId: gym.gym_id,
                gymName: gym.name,
                gymSlug: gym.slug,
                gymLogoPath: (logoPath && fs.existsSync(logoPath)) ? logoPath : null,
                gymLogoFilename: gym.logo || null
            };
        }
    } catch (e) {
        console.error('Error fetching gym info for email:', e);
    }
    return null;
};

const congratsForEnroll = async (params) => {

    let locale = translation(params.langId);
    params.from = '"Sumando Kilometros" <contacto@sumandokilometros.com.ve>';
    params.lang = locale;
    params.locals = { contacts: params.contacts, eventEdition: params.eventEdition, eventTitle: params.eventTitle, userName: params.userName };
    params.template = 'congratsForEnroll/' + locale;

    let mailRs = await sendEmailTemplate(params);
    return mailRs;

}

const newUserAccount = async (params) => {

    let locale = translation(params.langId);
    params.from = '"Sumando Kilometros" <contacto@sumandokilometros.com.ve>';
    params.lang = locale;
    params.locals = { activationCode: params.activationCode };
    params.template = 'newUserAccount/' + locale;

    let mailRs = await sendEmailTemplate(params);
    return mailRs;

}

const userAccessCode = async (params) => {

    let locale = translation(params.langId);
    params.from = '"Sumando Kilometros" <contacto@sumandokilometros.com.ve>';
    params.lang = locale;
    params.locals = { accessCode: params.accessCode };
    params.template = 'userAccessCode/' + locale;

    let mailRs = await sendEmailTemplate(params);
    return mailRs;

};

const updateUserData = async (params) => {

    let locale = translation(params.langId);
    params.from = '"Sumando Kilometros" <contacto@sumandokilometros.com.ve>';
    params.lang = locale;
    params.template = 'updateUserData/' + locale;

    let mailRs = await sendEmailTemplate(params);
    return mailRs;

};

const newUserEnroll = async (params) => {

    let locale = translation(params.langId);
    params.attachments = (params.voucher) ? params.voucher : [];
    params.from = '"Sumando Kilometros" <contacto@sumandokilometros.com.ve>';
    params.lang = locale;
    params.locals = { eventEdition: params.eventEdition, eventTitle: params.eventTitle };
    params.template = 'newUserEnroll/' + locale;

    let mailRs = await sendEmailTemplate(params);
    return mailRs;

}

const gymWelcomeUser = async (params) => {

    let locale = translation(params.langId || 1);
    let gymName = params.gymName || 'Gimnasio';
    params.from = `"${gymName}" <contacto@sumandokilometros.com.ve>`;
    params.lang = locale;
    params.locals = {
        userName: params.userName,
        userEmail: params.userEmail,
        document: params.document,
        userPhone: params.userPhone,
        roleName: params.roleName || 'Cliente',
        gymName: gymName,
        gymUrl: params.gymUrl || ''
    };
    params.template = 'gymWelcomeUser/' + locale;

    let mailRs = await sendEmailTemplate(params);
    return mailRs;

};

const gymNewUserAdmin = async (params) => {

    let locale = translation(params.langId || 1);
    let gymName = params.gymName || 'Gimnasio';
    params.from = `"${gymName}" <contacto@sumandokilometros.com.ve>`;
    params.lang = locale;
    params.locals = {
        adminName: params.adminName || 'Administrador',
        userName: params.userName,
        userEmail: params.userEmail,
        document: params.document,
        userPhone: params.userPhone,
        emergencyPhone: params.emergencyPhone,
        roleName: params.roleName || 'Cliente',
        gymName: gymName,
        registrationDate: params.registrationDate || '',
        dashboardUrl: params.dashboardUrl || ''
    };
    params.template = 'gymNewUserAdmin/' + locale;

    let mailRs = await sendEmailTemplate(params);
    return mailRs;

};

const sendEmailTemplate = (params) => {

    return new Promise(async function (resolve, reject) {

        const gymInfo = await getGymInfoForEmail(params.gymSlug || params.gymId);
        const gymName = (gymInfo && gymInfo.gymName) ? gymInfo.gymName : (params.gymName || null);

        if (gymName) {
            params.from = `"${gymName}" <contacto@sumandokilometros.com.ve>`;
        } else if (!params.from) {
            params.from = '"Sumando Kilometros" <contacto@sumandokilometros.com.ve>';
        }

        params.gymName = gymName;
        if (!params.locals) params.locals = {};
        params.locals.gymName = gymName;

        // Asegurar que el logo del encabezado esté siempre adjunto
        let attachments = [];
        if (params.attachments) {
            attachments = Array.isArray(params.attachments) ? [...params.attachments] : [params.attachments];
        }

        const hasLogo = attachments.some(att => att.cid === 'logo');
        if (!hasLogo) {
            let logoPath = (gymInfo && gymInfo.gymLogoPath) ? gymInfo.gymLogoPath : null;
            let logoFilename = (gymInfo && gymInfo.gymLogoFilename) ? gymInfo.gymLogoFilename : 'logo-menu-letras-negras.jpg';

            if (!logoPath || !fs.existsSync(logoPath)) {
                logoPath = path.join(__dirname, '..', 'public', 'images', 'logo-menu-letras-negras.jpg');
                logoFilename = 'logo-menu-letras-negras.jpg';
            }

            if (fs.existsSync(logoPath)) {
                attachments.push({
                    filename: logoFilename,
                    path: logoPath,
                    cid: 'logo'
                });
            }
        }

        const maxRetries = parseInt(process.env.MAIL_RETRIES) || 3;
        const delayMs = parseInt(process.env.MAIL_RETRY_DELAY) || 1500;
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const email = new Email({
                    message: {
                        attachments: attachments,
                        from: params.from,
                        to: params.email
                    },
                    preview: (process.env.MAIL_PREVIEW === "true"),
                    send: true,
                    transport: transporter
                });

                await email.send({
                    template: params.template,
                    locals: Object.assign({}, params, params.locals, { gymName: gymName })
                });

                console.log(`[EMAIL SUCCESS] Correo enviado exitosamente a ${params.email} en el intento ${attempt}/${maxRetries}`);
                return resolve({
                    message: "Email enviado con éxito!",
                    status: "success",
                    statusCode: 1
                });

            } catch (error) {
                lastError = error;
                console.error(`[EMAIL ERROR] Falló intento ${attempt}/${maxRetries} al enviar correo a ${params.email}:`, error.message || error);

                if (attempt < maxRetries) {
                    console.log(`[EMAIL RETRY] Reintentando envío de correo a ${params.email} en ${delayMs}ms (Intento ${attempt + 1}/${maxRetries})...`);
                    await new Promise(r => setTimeout(r, delayMs));
                }
            }
        }

        // Si fallaron todos los intentos de envío
        let message = "Ocurrió un error al tratar de enviar el correo.";
        if (lastError && lastError.code == "EDNS") {
            message = "Error de conexión con el servidor que envia el correo.";
        }

        return resolve({
            error: lastError,
            message: message,
            status: "error",
            statusCode: 4
        });

    }).catch(function (error) {

        reject(error);

    });

}

const translation = (lang) => {

    lang = parseInt(lang)
    var text = {}

    switch (lang) {
        case 1:
            text = 'es'
            break
        case 2:
            text = 'en'
            break
        default:
            text = 'es'
            break
    }

    return text;

}

module.exports = {
    //checkEmail,
    congratsForEnroll,
    newUserAccount,
    userAccessCode,
    updateUserData,
    newUserEnroll,
    gymWelcomeUser,
    gymNewUserAdmin,
    getGymInfoForEmail
}
