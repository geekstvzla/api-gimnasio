const db = require('../config/database.js').promise();

/**
 * Calcula la ventana semanal [inicio, fin] según el corte configurado en el gimnasio.
 * @param {Date|string} referenceDate - Fecha de referencia (por defecto hoy)
 * @param {number} weekStartDay - 1 (Lunes), 2 (Martes), ..., 7 (Domingo)
 */
const getGymWeekWindow = (referenceDate = new Date(), weekStartDay = 1) => {
    const date = new Date(referenceDate);
    // JS getDay(): 0=Dom, 1=Lun, ..., 6=Sab -> Convertir a 1=Lun ... 7=Dom
    const currentDay = date.getDay() === 0 ? 7 : date.getDay();

    let diff = currentDay - Number(weekStartDay);
    if (diff < 0) {
        diff += 7;
    }

    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const pad = (n) => String(n).padStart(2, '0');
    const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    return {
        startDate: toYMD(startOfWeek),
        endDate: toYMD(endOfWeek),
        startDateTime: startOfWeek,
        endDateTime: endOfWeek
    };
};

/**
 * Obtener los planes de suscripción de un gimnasio
 */
const getPlans = async (gymId = 1, langId = 1) => {
    const languageId = (langId === 'eng' || langId === 2 || langId === '2') ? 2 : 1;
    const [rows] = await db.query(
        `SELECT gsp.gym_sub_plan_id,
                gsp.gym_id,
                gsp.name,
                gsp.billing_period_id,
                bpl.description AS billing_period_name,
                gsp.weekly_attendance_limit,
                gsp.duration_days,
                CAST(gsp.price AS DECIMAL(10,2)) AS price,
                gsp.description,
                gsp.status_id,
                COALESCE(g.currency_id, 3) AS currency_id,
                COALESCE(c.symbol, '€') AS currency_symbol,
                COALESCE(c.abbreviation, 'EUR') AS currency_abbreviation,
                COALESCE(cl.description, 'Euros') AS currency_name
         FROM gym_sub_plans gsp
         LEFT JOIN billing_period_lang bpl ON bpl.billing_period_id = gsp.billing_period_id AND bpl.language_id = ?
         LEFT JOIN gyms g ON g.gym_id = gsp.gym_id
         LEFT JOIN currencies c ON c.currency_id = g.currency_id
         LEFT JOIN currencies_lang cl ON cl.currency_id = c.currency_id AND cl.language_id = 1
         WHERE gsp.gym_id = ? AND gsp.status_id = 1
         ORDER BY gsp.price ASC`,
        [languageId, gymId]
    );
    return rows;
};

/**
 * Obtener estado de suscripción y asistencias de la semana de un usuario
 */
const getUserSubscriptionStatus = async (userId, gymId = 1) => {
    // 1. Obtener info del gimnasio (corte semanal y moneda base)
    const [gymRows] = await db.query(
        `SELECT g.gym_id, 
                g.name, 
                g.week_start_day,
                COALESCE(g.currency_id, 3) AS currency_id,
                COALESCE(c.symbol, '€') AS currency_symbol,
                COALESCE(c.abbreviation, 'EUR') AS currency_abbreviation,
                COALESCE(cl.description, 'Euros') AS currency_name
         FROM gyms g
         LEFT JOIN currencies c ON c.currency_id = g.currency_id
         LEFT JOIN currencies_lang cl ON cl.currency_id = c.currency_id AND cl.language_id = 1
         WHERE g.gym_id = ?`,
        [gymId]
    );
    const gym = gymRows[0] || { 
        week_start_day: 1, 
        currency_id: 3, 
        currency_symbol: '€', 
        currency_abbreviation: 'EUR', 
        currency_name: 'Euros' 
    };
    const weekStartDay = gym.week_start_day || 1;

    // 2. Info de fechas del usuario (joined_at, billing_anchor_day)
    const [userRows] = await db.query(
        `SELECT user_id, 
                first_name, 
                last_name, 
                DATE_FORMAT(joined_at, "%Y-%m-%d") AS joined_at,
                billing_anchor_day
         FROM users WHERE user_id = ?`,
        [userId]
    );
    const userProfile = userRows[0] || null;

    // 3. Suscripción activa o última programada
    const [subs] = await db.query(
        `SELECT us.user_subscription_id,
                us.user_id,
                us.gym_id,
                us.gym_sub_plan_id,
                us.payment_method_id,
                pml.description AS payment_method,
                gsp.name AS plan_name,
                gsp.billing_period_id,
                gsp.weekly_attendance_limit,
                gsp.duration_days,
                CAST(us.price_paid AS DECIMAL(10,2)) AS price_paid,
                DATE_FORMAT(us.payment_date, "%Y-%m-%d %H:%i:%s") AS payment_date,
                DATE_FORMAT(us.start_date, "%Y-%m-%d") AS start_date,
                DATE_FORMAT(us.end_date, "%Y-%m-%d") AS end_date,
                us.status,
                us.notes,
                DATEDIFF(us.end_date, CURDATE()) AS days_remaining
         FROM user_subscriptions us
         INNER JOIN gym_sub_plans gsp ON gsp.gym_sub_plan_id = us.gym_sub_plan_id
         LEFT JOIN payment_methods_lang pml ON pml.payment_method_id = us.payment_method_id AND pml.language_id = 1
         WHERE us.user_id = ? AND us.gym_id = ? AND us.status IN ('active', 'scheduled')
         ORDER BY us.end_date DESC
         LIMIT 1`,
        [userId, gymId]
    );

    const activeSub = subs[0] || null;
    const hasActiveSubscription = !!activeSub && (activeSub.status === 'active' || activeSub.status === 'scheduled') && activeSub.days_remaining >= 0;

    // 4. Calcular ventana semanal actual
    const weekWindow = getGymWeekWindow(new Date(), weekStartDay);

    // 5. Asistencias en la semana actual
    const [attRows] = await db.query(
        `SELECT COUNT(DISTINCT DATE(checkin_date)) AS days_attended_this_week,
                COUNT(gym_attendance_id) AS total_checkins_this_week,
                MAX(checkin_date) AS last_checkin
         FROM gym_attendances
         WHERE user_id = ? AND gym_id = ? AND status = 'granted'
           AND checkin_date >= ? AND checkin_date <= ?`,
        [userId, gymId, `${weekWindow.startDate} 00:00:00`, `${weekWindow.endDate} 23:59:59`]
    );

    // 6. Verificar si asistió hoy
    const [todayRows] = await db.query(
        `SELECT COUNT(*) AS checkins_today
         FROM gym_attendances
         WHERE user_id = ? AND gym_id = ? AND status = 'granted'
           AND DATE(checkin_date) = CURDATE()`,
        [userId, gymId]
    );

    const daysAttendedThisWeek = Number(attRows[0]?.days_attended_this_week || 0);
    const attendedToday = Number(todayRows[0]?.checkins_today || 0) > 0;
    const weeklyLimit = activeSub?.weekly_attendance_limit || null;

    let canAccessToday = false;
    let accessReason = '';

    if (!hasActiveSubscription) {
        canAccessToday = false;
        accessReason = 'Sin suscripción activa o plan vencido';
    } else if (activeSub.duration_days === 1) {
        // Plan diario: 1 solo día
        canAccessToday = !attendedToday;
        accessReason = attendedToday ? 'Pase diario ya utilizado hoy' : 'Pase diario disponible para hoy';
    } else if (weeklyLimit) {
        if (attendedToday) {
            canAccessToday = true;
            accessReason = 'Ya ingresaste hoy (reingreso permitido)';
        } else if (daysAttendedThisWeek < weeklyLimit) {
            canAccessToday = true;
            accessReason = `Disponible (${daysAttendedThisWeek}/${weeklyLimit} días usados en la semana)`;
        } else {
            canAccessToday = false;
            accessReason = `Límite semanal alcanzado (${weeklyLimit}/${weeklyLimit} días). Se reinicia el próximo Lunes.`;
        }
    } else {
        canAccessToday = true;
        accessReason = 'Plan ilimitado activo';
    }

    return {
        gym: {
            gym_id: gym.gym_id,
            name: gym.name,
            week_start_day: gym.week_start_day,
            currency_id: Number(gym.currency_id) || 3,
            currency_symbol: gym.currency_symbol || '€',
            currency_abbreviation: gym.currency_abbreviation || 'EUR',
            currency_name: gym.currency_name || 'Euros'
        },
        userProfile,
        subscription: activeSub,
        hasActiveSubscription,
        weekWindow: {
            ...weekWindow,
            weekStartDayName: weekStartDay === 1 ? 'Lunes' : (weekStartDay === 7 ? 'Domingo' : `Día ${weekStartDay}`)
        },
        daysAttendedThisWeek,
        weeklyLimit,
        attendedToday,
        canAccessToday,
        accessReason
    };
};

/**
 * Suscribir / Renovar a un usuario
 * Maneja renovación anticipada (fecha inicio = fin anterior + 1 día)
 */
const subscribeUser = async ({
    userId,
    gymId = 1,
    gymSubPlanId,
    pricePaid,
    billingAnchorDay = null,
    joinedAt = null,
    notes = null,
    paymentMethodId = null
}) => {
    // 1. Obtener detalles del plan
    const [plans] = await db.query(
        'SELECT * FROM gym_sub_plans WHERE gym_sub_plan_id = ? AND gym_id = ?',
        [gymSubPlanId, gymId]
    );
    if (plans.length === 0) {
        throw new Error('Plan de suscripción no encontrado para este gimnasio');
    }
    const plan = plans[0];
    const actualPrice = pricePaid !== undefined && pricePaid !== null ? Number(pricePaid) : Number(plan.price);
    const durationDays = Number(plan.duration_days) || 30;

    // 2. Buscar si tiene suscripción vigente para aplicar renovación anticipada
    const [latestSub] = await db.query(
        `SELECT user_subscription_id, end_date, status
         FROM user_subscriptions
         WHERE user_id = ? AND gym_id = ? AND status IN ('active', 'scheduled') AND end_date >= CURDATE()
         ORDER BY end_date DESC
         LIMIT 1`,
        [userId, gymId]
    );

    const pad = (n) => String(n).padStart(2, '0');
    const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    let startDate;
    let isRenewal = false;

    if (latestSub.length > 0) {
        // RENOVACIÓN ANTICIPADA:
        // Inicia el día siguiente a la fecha de término del plan actual
        isRenewal = true;
        const currentEnd = new Date(latestSub[0].end_date);
        startDate = new Date(currentEnd.getFullYear(), currentEnd.getMonth(), currentEnd.getDate() + 1);
    } else {
        // NUEVA SUSCRIPCIÓN O YA VENCIDA: Inicia hoy
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Calcular end_date sumando durationDays - 1 día
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + durationDays - 1);

    const todayStr = toYMD(new Date());
    const startDateStr = toYMD(startDate);
    const endDateStr = toYMD(endDate);

    const status = startDateStr <= todayStr ? 'active' : 'scheduled';

    // 3. Insertar suscripción
    const [insResult] = await db.query(
        `INSERT INTO user_subscriptions 
         (user_id, gym_id, gym_sub_plan_id, payment_method_id, payment_date, start_date, end_date, price_paid, status, notes)
         VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
        [userId, gymId, gymSubPlanId, paymentMethodId ? Number(paymentMethodId) : null, startDateStr, endDateStr, actualPrice, status, notes]
    );

    // 4. Actualizar billing_anchor_day y/o joined_at en el perfil de usuario si fueron provistos
    const updates = [];
    const updateParams = [];
    if (billingAnchorDay !== null && billingAnchorDay !== undefined && billingAnchorDay !== '') {
        updates.push('billing_anchor_day = ?');
        updateParams.push(Number(billingAnchorDay));
    }
    if (joinedAt) {
        updates.push('joined_at = ?');
        updateParams.push(joinedAt);
    }
    if (updates.length > 0) {
        updateParams.push(userId);
        await db.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, updateParams);
    }

    return {
        userSubscriptionId: insResult.insertId,
        userId,
        gymId,
        gymSubPlanId,
        planName: plan.name,
        isRenewal,
        startDate: startDateStr,
        endDate: endDateStr,
        pricePaid: actualPrice,
        status,
        durationDays
    };
};

/**
 * Validar acceso de un cliente y registrar check-in si es aprobado
 */
const validateAndCheckin = async ({ userId, gymId = 1, notes = null }) => {
    // 1. Obtener estado actual
    const statusInfo = await getUserSubscriptionStatus(userId, gymId);

    if (!statusInfo.hasActiveSubscription) {
        // Registrar intento denegado
        await db.query(
            `INSERT INTO gym_attendances (user_id, gym_id, user_subscription_id, checkin_date, status, reason)
             VALUES (?, ?, NULL, NOW(), 'denied', ?)`,
            [userId, gymId, 'Sin suscripción activa o vencida']
        );
        return {
            allowed: false,
            reason: 'Sin suscripción activa o tu plan ya ha vencido. Por favor renueva tu suscripción.',
            statusInfo
        };
    }

    const sub = statusInfo.subscription;

    // 2. Si es plan diario
    if (sub.duration_days === 1) {
        if (statusInfo.attendedToday) {
            await db.query(
                `INSERT INTO gym_attendances (user_id, gym_id, user_subscription_id, checkin_date, status, reason)
                 VALUES (?, ?, ?, NOW(), 'denied', ?)`,
                [userId, gymId, sub.user_subscription_id, 'Pase diario ya utilizado hoy']
            );
            return {
                allowed: false,
                reason: 'Ya utilizaste tu pase diario correspondiente a la fecha de hoy.',
                statusInfo
            };
        }

        await db.query(
            `INSERT INTO gym_attendances (user_id, gym_id, user_subscription_id, checkin_date, status, reason)
             VALUES (?, ?, ?, NOW(), 'granted', ?)`,
            [userId, gymId, sub.user_subscription_id, 'Acceso pase diario concedido']
        );
        return {
            allowed: true,
            message: `¡Bienvenido! Pase diario registrado exitosamente.`,
            planName: sub.plan_name,
            statusInfo
        };
    }

    // 3. Si tiene límite semanal (4 o 5 días)
    if (sub.weekly_attendance_limit) {
        if (statusInfo.attendedToday) {
            // Reingreso en el mismo día: concedido sin consumir un nuevo día
            await db.query(
                `INSERT INTO gym_attendances (user_id, gym_id, user_subscription_id, checkin_date, status, reason)
                 VALUES (?, ?, ?, NOW(), 'granted', ?)`,
                [userId, gymId, sub.user_subscription_id, 'Reingreso el mismo día']
            );
            return {
                allowed: true,
                message: `¡Bienvenido de nuevo! Reingreso registrado para la sesión de hoy.`,
                planName: sub.plan_name,
                daysAttendedThisWeek: statusInfo.daysAttendedThisWeek,
                weeklyLimit: sub.weekly_attendance_limit,
                statusInfo
            };
        }

        if (statusInfo.daysAttendedThisWeek >= sub.weekly_attendance_limit) {
            await db.query(
                `INSERT INTO gym_attendances (user_id, gym_id, user_subscription_id, checkin_date, status, reason)
                 VALUES (?, ?, ?, NOW(), 'denied', ?)`,
                [userId, gymId, sub.user_subscription_id, 'Límite semanal alcanzado']
            );
            return {
                allowed: false,
                reason: `Has completado tus ${sub.weekly_attendance_limit} días asignados para esta semana. El contador se reinicia el próximo ${statusInfo.weekWindow.weekStartDayName}.`,
                daysAttendedThisWeek: statusInfo.daysAttendedThisWeek,
                weeklyLimit: sub.weekly_attendance_limit,
                statusInfo
            };
        }

        // Acceso concedido (nuevo día de la semana)
        await db.query(
            `INSERT INTO gym_attendances (user_id, gym_id, user_subscription_id, checkin_date, status, reason)
             VALUES (?, ?, ?, NOW(), 'granted', ?)`,
            [userId, gymId, sub.user_subscription_id, `Día ${statusInfo.daysAttendedThisWeek + 1} de ${sub.weekly_attendance_limit}`]
        );
        return {
            allowed: true,
            message: `¡Bienvenido! Día ${statusInfo.daysAttendedThisWeek + 1} de ${sub.weekly_attendance_limit} utilizado en esta semana.`,
            planName: sub.plan_name,
            daysAttendedThisWeek: statusInfo.daysAttendedThisWeek + 1,
            weeklyLimit: sub.weekly_attendance_limit,
            statusInfo
        };
    }

    // 4. Plan Ilimitado
    await db.query(
        `INSERT INTO gym_attendances (user_id, gym_id, user_subscription_id, checkin_date, status, reason)
         VALUES (?, ?, ?, NOW(), 'granted', ?)`,
        [userId, gymId, sub.user_subscription_id, 'Acceso ilimitado']
    );
    return {
        allowed: true,
        message: '¡Bienvenido! Acceso ilimitado concedido.',
        planName: sub.plan_name,
        statusInfo
    };
};

/**
 * Obtener historial de check-ins y asistencias de un usuario
 */
const getUserAttendances = async (userId, gymId = 1, limit = 20) => {
    const [rows] = await db.query(
        `SELECT ga.gym_attendance_id,
                ga.user_id,
                ga.gym_id,
                ga.user_subscription_id,
                DATE_FORMAT(ga.checkin_date, "%Y-%m-%d %H:%i:%s") AS checkin_date,
                ga.status,
                ga.reason,
                gsp.name AS plan_name
         FROM gym_attendances ga
         LEFT JOIN user_subscriptions us ON us.user_subscription_id = ga.user_subscription_id
         LEFT JOIN gym_sub_plans gsp ON gsp.gym_sub_plan_id = us.gym_sub_plan_id
         WHERE ga.user_id = ? AND ga.gym_id = ?
         ORDER BY ga.checkin_date DESC
         LIMIT ?`,
        [userId, gymId, Number(limit)]
    );
    return rows;
};

/**
 * Obtener historial de suscripciones de un usuario
 */
const getUserSubscriptionHistory = async (userId, gymId = 1) => {
    const [rows] = await db.query(
        `SELECT us.user_subscription_id,
                us.user_id,
                us.gym_id,
                us.gym_sub_plan_id,
                us.payment_method_id,
                pml.description AS payment_method,
                gsp.name AS plan_name,
                gsp.weekly_attendance_limit,
                gsp.duration_days,
                CAST(us.price_paid AS DECIMAL(10,2)) AS price_paid,
                DATE_FORMAT(us.payment_date, "%Y-%m-%d %H:%i:%s") AS payment_date,
                DATE_FORMAT(us.start_date, "%Y-%m-%d") AS start_date,
                DATE_FORMAT(us.end_date, "%Y-%m-%d") AS end_date,
                us.status,
                us.notes
         FROM user_subscriptions us
         INNER JOIN gym_sub_plans gsp ON gsp.gym_sub_plan_id = us.gym_sub_plan_id
         LEFT JOIN payment_methods_lang pml ON pml.payment_method_id = us.payment_method_id AND pml.language_id = 1
         WHERE us.user_id = ? AND us.gym_id = ?
         ORDER BY us.user_subscription_id DESC`,
        [userId, gymId]
    );
    return rows;
};

const getPaymentMethods = async (langId = 1) => {
    const [rows] = await db.query(
        `SELECT pm.payment_method_id,
                pml.description AS payment_method
         FROM payment_methods pm
         INNER JOIN payment_methods_lang pml ON pml.payment_method_id = pm.payment_method_id
         WHERE pml.language_id = ? AND pm.status_id = 1
         ORDER BY pm.payment_method_id ASC`,
        [Number(langId) || 1]
    );
    return rows;
};

module.exports = {
    getGymWeekWindow,
    getPlans,
    getUserSubscriptionStatus,
    subscribeUser,
    validateAndCheckin,
    getUserAttendances,
    getUserSubscriptionHistory,
    getPaymentMethods
};
