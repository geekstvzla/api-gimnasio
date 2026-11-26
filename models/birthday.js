const db = require('../config/database.js').promise();

/**
 * Asegura la existencia de la tabla de logs de correos de cumpleaños
 */
const ensureBirthdayLogsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS birthday_email_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            gym_id INT NOT NULL,
            email VARCHAR(255) NOT NULL,
            birthday DATE NOT NULL,
            year_sent INT NOT NULL,
            sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(20) NOT NULL DEFAULT 'SENT',
            error_message TEXT NULL,
            UNIQUE KEY idx_user_gym_year (user_id, gym_id, year_sent),
            KEY idx_sent_at (sent_at),
            KEY idx_gym_sent (gym_id, year_sent)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await db.query(query);
};

/**
 * Obtiene los gimnasios activos
 */
const getActiveGyms = async (gymId = null) => {
    let query = `
        SELECT gym_id, name, slug, logo, status_id 
        FROM gyms 
        WHERE status_id = 1
    `;
    const params = [];
    if (gymId) {
        query += ' AND gym_id = ?';
        params.push(Number(gymId));
    }
    query += ' ORDER BY gym_id ASC;';
    const [rows] = await db.query(query, params);
    return rows;
};

/**
 * Obtiene los usuarios cumpleañeros del día para un gimnasio específico
 */
const getBirthdayCelebrantsForGym = async ({ gymId, targetDate = null, force = false } = {}) => {
    await ensureBirthdayLogsTable();

    const gId = Number(gymId);
    const targetDateStr = targetDate || new Date().toISOString().slice(0, 10);

    const query = `
        SELECT DISTINCT
            u.user_id,
            u.email,
            u.first_name,
            u.last_name,
            u.username,
            u.country_phone_code,
            u.phone_number,
            DATE_FORMAT(u.birthday, '%Y-%m-%d') AS birthday,
            COALESCE(NULLIF(TRIM(u.first_name), ''), u.username, 'Atleta') AS display_name,
            COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), ''), u.username, 'Atleta') AS full_name,
            (
                SELECT COUNT(*) 
                FROM user_subscriptions us 
                WHERE us.user_id = u.user_id 
                  AND us.gym_id = ? 
                  AND us.status = 'active'
                  AND us.end_date >= ?
            ) > 0 AS has_active_subscription
        FROM users u
        INNER JOIN gym_user_roles gur 
                ON gur.user_id = u.user_id 
               AND gur.gym_id = ? 
               AND gur.status_id = 1
        LEFT JOIN birthday_email_logs bel 
               ON bel.user_id = u.user_id 
              AND bel.gym_id = ? 
              AND bel.year_sent = YEAR(?)
              AND bel.status = 'SENT'
        WHERE u.status_id = 1
          AND u.email IS NOT NULL 
          AND TRIM(u.email) != ''
          AND u.birthday IS NOT NULL
          AND (? = 1 OR bel.id IS NULL)
          AND (
              (MONTH(u.birthday) = MONTH(?) AND DAY(u.birthday) = DAY(?))
              OR (
                  MONTH(u.birthday) = 2 AND DAY(u.birthday) = 29
                  AND MONTH(?) = 2 AND DAY(?) = 28
                  AND DAY(LAST_DAY(?)) = 28
              )
          )
        ORDER BY u.first_name ASC, u.last_name ASC;
    `;

    const params = [
        gId,
        targetDateStr,
        gId,
        gId,
        targetDateStr,
        force ? 1 : 0,
        targetDateStr,
        targetDateStr,
        targetDateStr,
        targetDateStr,
        targetDateStr
    ];

    const [rows] = await db.query(query, params);

    const refDate = targetDate ? new Date(`${targetDate}T12:00:00`) : new Date();
    const currentYear = refDate.getFullYear();

    return (rows || []).map(u => {
        const primerNombre = u.first_name ? u.first_name.trim().split(/\s+/)[0] : '';
        const primerApellido = u.last_name ? u.last_name.trim().split(/\s+/)[0] : '';
        const nombreAmigable = (primerNombre && primerApellido)
            ? `${primerNombre} ${primerApellido}`
            : (primerNombre || primerApellido || u.username || 'Atleta');

        let age = null;
        if (u.birthday) {
            const birthYear = parseInt(u.birthday.split('-')[0], 10);
            if (!isNaN(birthYear) && birthYear > 1900) {
                age = currentYear - birthYear;
            }
        }

        const phoneCode = (u.country_phone_code || '58').replace(/[^0-9]/g, '');
        const phoneNum = (u.phone_number || '').replace(/[^0-9]/g, '');
        const phoneFormatted = (phoneCode && phoneNum) ? `+${phoneCode} ${phoneNum}` : (phoneNum ? phoneNum : null);
        const whatsappClean = (phoneCode && phoneNum) ? `${phoneCode}${phoneNum}` : (phoneNum || '');

        return {
            ...u,
            display_name: nombreAmigable,
            first_and_last_name: nombreAmigable,
            age,
            phone_formatted: phoneFormatted,
            whatsapp_clean: whatsappClean,
            has_active_subscription: Boolean(u.has_active_subscription)
        };
    });
};

/**
 * Obtiene los correos y nombres de los administradores/dueños del gimnasio (rol 1)
 */
const getGymAdmins = async (gymId) => {
    const query = `
        SELECT DISTINCT 
            u.user_id,
            u.email,
            COALESCE(NULLIF(TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))), ''), u.username, 'Administrador') AS name
        FROM users u
        INNER JOIN gym_user_roles gur ON gur.user_id = u.user_id
        WHERE gur.gym_id = ? 
          AND gur.role_id = 1 
          AND gur.status_id = 1
          AND u.status_id = 1
          AND u.email IS NOT NULL 
          AND TRIM(u.email) != '';
    `;
    const [rows] = await db.query(query, [Number(gymId)]);
    return rows;
};

/**
 * Registra o actualiza el log de correo de cumpleaños
 */
const logBirthdayEmail = async ({ userId, gymId, email, birthday, yearSent, targetDate, status = 'SENT', errorMessage = null }) => {
    const year = yearSent || (targetDate ? new Date(targetDate).getFullYear() : new Date().getFullYear());
    const query = `
        INSERT INTO birthday_email_logs (user_id, gym_id, email, birthday, year_sent, status, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            error_message = VALUES(error_message),
            sent_at = CURRENT_TIMESTAMP;
    `;
    await db.query(query, [userId, gymId, email, birthday, year, status, errorMessage]);
};

module.exports = {
    ensureBirthdayLogsTable,
    getActiveGyms,
    getBirthdayCelebrantsForGym,
    getGymAdmins,
    logBirthdayEmail
};
