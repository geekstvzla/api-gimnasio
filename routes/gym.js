var express = require('express');
var router = express.Router();
var gymModel = require('../models/gym.js');
var subsModel = require('../models/subscriptions.js');
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

router.get('/get-roles', async function (req, res, next) {
    let langId = req.query.langId || 'esp';
    let data = await gymModel.getRoles(langId);
    res.send(data);
});

// ==========================================
// RUTAS DE PLANES Y SUSCRIPCIONES
// ==========================================

/**
 * GET /gym/plans
 * Listado de planes disponibles para un gimnasio
 */
router.get('/plans', async function (req, res, next) {
    try {
        const gymId = req.query.gymId || 1;
        const langId = req.query.langId || 1;
        const plans = await subsModel.getPlans(gymId, langId);
        res.send({
            status: 'success',
            statusCode: 1,
            plans
        });
    } catch (err) {
        res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: err.message || 'Error al obtener los planes'
        });
    }
});

/**
 * GET /gym/subscriptions/status
 * Estado de suscripción, asistencias semanales y corte para un usuario
 */
router.get('/subscriptions/status', async function (req, res, next) {
    try {
        const userId = req.query.userId || req.query.user_id;
        const gymId = req.query.gymId || req.query.gym_id || 1;

        if (!userId) {
            return res.status(400).send({
                status: 'error',
                statusCode: 0,
                message: 'userId es requerido'
            });
        }

        const data = await subsModel.getUserSubscriptionStatus(userId, gymId);
        res.send({
            status: 'success',
            statusCode: 1,
            data
        });
    } catch (err) {
        res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: err.message || 'Error al obtener estado de suscripción'
        });
    }
});

/**
 * GET /gym/subscriptions/history
 * Historial de suscripciones de un usuario
 */
router.get('/subscriptions/history', async function (req, res, next) {
    try {
        const userId = req.query.userId || req.query.user_id;
        const gymId = req.query.gymId || req.query.gym_id || 1;

        if (!userId) {
            return res.status(400).send({
                status: 'error',
                statusCode: 0,
                message: 'userId es requerido'
            });
        }

        const history = await subsModel.getUserSubscriptionHistory(userId, gymId);
        res.send({
            status: 'success',
            statusCode: 1,
            history
        });
    } catch (err) {
        res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: err.message || 'Error al obtener historial'
        });
    }
});

/**
 * GET /gym/payment-methods
 * Lista de métodos de pago activos
 */
router.get('/payment-methods', async function (req, res, next) {
    try {
        const langId = req.query.langId || req.query.language_id || 1;
        const methods = await subsModel.getPaymentMethods(langId);
        res.send({
            status: 'success',
            statusCode: 1,
            paymentMethods: methods
        });
    } catch (err) {
        res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: err.message
        });
    }
});

/**
 * POST /gym/subscriptions/subscribe
 * Asignar o renovar suscripción (soporta renovación anticipada)
 */
router.post('/subscriptions/subscribe', async function (req, res, next) {
    try {
        const payload = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
        const userId = payload.userId || payload.user_id;
        const gymId = payload.gymId || payload.gym_id || 1;
        const gymSubPlanId = payload.gymSubPlanId || payload.gym_sub_plan_id;
        const pricePaid = payload.pricePaid !== undefined ? payload.pricePaid : payload.price_paid;
        const billingAnchorDay = payload.billingAnchorDay !== undefined ? payload.billingAnchorDay : payload.billing_anchor_day;
        const joinedAt = payload.joinedAt || payload.joined_at;
        const notes = payload.notes || null;
        const paymentMethodId = payload.paymentMethodId || payload.payment_method_id || null;

        if (!userId || !gymSubPlanId) {
            return res.status(400).send({
                status: 'error',
                statusCode: 0,
                message: 'userId y gymSubPlanId son requeridos'
            });
        }

        const subscription = await subsModel.subscribeUser({
            userId,
            gymId,
            gymSubPlanId,
            pricePaid,
            billingAnchorDay,
            joinedAt,
            notes,
            paymentMethodId
        });

        res.send({
            status: 'success',
            statusCode: 1,
            message: subscription.isRenewal 
                ? `Renovación anticipada registrada exitosamente. Inicia el ${subscription.startDate} hasta el ${subscription.endDate}.`
                : `Suscripción registrada exitosamente del ${subscription.startDate} al ${subscription.endDate}.`,
            subscription
        });
    } catch (err) {
        res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: err.message || 'Error al registrar suscripción'
        });
    }
});

/**
 * POST /gym/access/validate-and-checkin
 * Validar acceso de un cliente y registrar check-in
 */
router.post('/access/validate-and-checkin', async function (req, res, next) {
    try {
        const payload = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
        const userId = payload.userId || payload.user_id;
        const gymId = payload.gymId || payload.gym_id || 1;
        const notes = payload.notes || null;

        if (!userId) {
            return res.status(400).send({
                status: 'error',
                statusCode: 0,
                message: 'userId es requerido'
            });
        }

        const result = await subsModel.validateAndCheckin({ userId, gymId, notes });
        res.send({
            status: result.allowed ? 'success' : 'denied',
            statusCode: result.allowed ? 1 : 0,
            ...result
        });
    } catch (err) {
        res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: err.message || 'Error al validar acceso'
        });
    }
});

/**
 * GET /gym/access/attendances
 * Historial de asistencias de un cliente
 */
router.get('/access/attendances', async function (req, res, next) {
    try {
        const userId = req.query.userId || req.query.user_id;
        const gymId = req.query.gymId || req.query.gym_id || 1;
        const limit = req.query.limit || 20;

        if (!userId) {
            return res.status(400).send({
                status: 'error',
                statusCode: 0,
                message: 'userId es requerido'
            });
        }

        const attendances = await subsModel.getUserAttendances(userId, gymId, limit);
        res.send({
            status: 'success',
            statusCode: 1,
            attendances
        });
    } catch (err) {
        res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: err.message || 'Error al obtener asistencias'
        });
    }
});

/**
 * ALL /gym/cron/birthday-emails
 * Endpoint para disparar el proceso de cumpleaños vía Webhook / Cron HTTP
 */
const { runBirthdayEmails } = require('../scripts/send-birthday-emails.js');

router.all('/cron/birthday-emails', async function (req, res, next) {
    try {
        const payload = Object.assign({}, req.query, req.body);
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && payload.secret !== cronSecret) {
            return res.status(403).send({
                status: 'error',
                statusCode: 0,
                message: 'No autorizado para ejecutar esta tarea'
            });
        }

        const summary = await runBirthdayEmails({
            dryRun: payload.dryRun === 'true' || payload.dryRun === true,
            force: payload.force === 'true' || payload.force === true,
            targetDate: payload.date || payload.targetDate || null,
            gymId: payload.gymId || payload.gym_id || null,
            testEmail: payload.testEmail || payload.test_email || null,
            skipAdminReport: payload.skipAdminReport === 'true' || payload.skipAdminReport === true
        });

        res.send({
            status: 'success',
            statusCode: 1,
            summary
        });
    } catch (err) {
        res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: err.message || 'Error al procesar correos de cumpleaños'
        });
    }
});

/**
 * ALL /gym/cron/subscription-reminders
 * Endpoint para disparar el proceso de recordatorios de vencimiento vía Webhook / Cron HTTP
 */
const { runSubscriptionReminders } = require('../scripts/send-subscription-reminders.js');

router.all('/cron/subscription-reminders', async function (req, res, next) {
    try {
        const payload = Object.assign({}, req.query, req.body);
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && payload.secret !== cronSecret) {
            return res.status(403).send({
                status: 'error',
                statusCode: 0,
                message: 'No autorizado para ejecutar esta tarea'
            });
        }

        const summary = await runSubscriptionReminders({
            dryRun: payload.dryRun === 'true' || payload.dryRun === true,
            force: payload.force === 'true' || payload.force === true,
            targetDate: payload.date || payload.targetDate || null,
            gymId: payload.gymId || payload.gym_id || null,
            testEmail: payload.testEmail || payload.test_email || null
        });

        res.send({
            status: 'success',
            statusCode: 1,
            summary
        });
    } catch (err) {
        res.status(500).send({
            status: 'error',
            statusCode: 0,
            message: err.message || 'Error al procesar recordatorios de suscripciones'
        });
    }
});

module.exports = router;
