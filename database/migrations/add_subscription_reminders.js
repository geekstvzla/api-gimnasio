const db = require('../../config/database.js');

async function run() {
    console.log('Iniciando migración de recordatorios de vencimiento de suscripciones...');

    // 1. Agregar columnas a gym_sub_plans si no existen
    const columnsCheck = await db.promise().query(
        "SHOW COLUMNS FROM `gym_sub_plans` LIKE 'eval_expiration'"
    );

    if (columnsCheck[0].length === 0) {
        console.log('Agregando columnas de configuración a gym_sub_plans...');
        await db.promise().query(`
            ALTER TABLE \`gym_sub_plans\`
            ADD COLUMN \`eval_expiration\` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=Evalúa vencimiento y envía recordatorios, 0=No' AFTER \`duration_days\`,
            ADD COLUMN \`reminder_days_before\` INT NOT NULL DEFAULT 5 COMMENT 'Días previos al vencimiento para notificar' AFTER \`eval_expiration\`,
            ADD COLUMN \`reminder_days_after\` INT NOT NULL DEFAULT 3 COMMENT 'Días posteriores al vencimiento para notificar' AFTER \`reminder_days_before\`;
        `);
        console.log('Columnas agregadas con éxito.');
    } else {
        console.log('Columnas de configuración ya existen en gym_sub_plans.');
    }

    // 2. Ajustar valores iniciales de los planes existentes
    await db.promise().query(`
        UPDATE \`gym_sub_plans\`
        SET \`eval_expiration\` = 0, \`reminder_days_before\` = 0, \`reminder_days_after\` = 0
        WHERE \`duration_days\` <= 1 OR LOWER(\`name\`) LIKE '%diario%';
    `);

    await db.promise().query(`
        UPDATE \`gym_sub_plans\`
        SET \`eval_expiration\` = 1, \`reminder_days_before\` = 5, \`reminder_days_after\` = 3
        WHERE \`duration_days\` > 1 AND LOWER(\`name\`) NOT LIKE '%diario%';
    `);
    console.log('Valores de configuración de planes actualizados.');

    // 3. Crear tabla de logs anti-duplicidad: subscription_email_logs
    console.log('Creando tabla subscription_email_logs si no existe...');
    await db.promise().query(`
        CREATE TABLE IF NOT EXISTS \`subscription_email_logs\` (
          \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          \`user_subscription_id\` BIGINT UNSIGNED NOT NULL,
          \`user_id\` BIGINT UNSIGNED NOT NULL,
          \`gym_id\` INT NOT NULL,
          \`email\` VARCHAR(255) NOT NULL,
          \`notification_type\` ENUM('EXPIRING_SOON', 'EXPIRES_TODAY', 'EXPIRED') NOT NULL,
          \`diff_days\` INT NOT NULL COMMENT 'Diferencia en días (+5, 0, -1, -2, -3)',
          \`sent_date\` DATE NOT NULL,
          \`sent_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`status\` VARCHAR(20) NOT NULL DEFAULT 'SENT',
          \`error_message\` TEXT NULL,
          UNIQUE KEY \`idx_sub_notif_diff\` (\`user_subscription_id\`, \`notification_type\`, \`diff_days\`),
          INDEX \`idx_sub_user_gym\` (\`user_id\`, \`gym_id\`),
          INDEX \`idx_sub_sent_date\` (\`sent_date\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Tabla subscription_email_logs lista.');

    console.log('Migración completada exitosamente.');
    process.exit(0);
}

run().catch(err => {
    console.error('Error durante la migración:', err);
    process.exit(1);
});
