const db = require('../../config/database.js').promise();

async function run() {
  async function addCol(table, col, def) {
    const [chk] = await db.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, col]
    );
    if (chk.length === 0) {
      console.log(`Adding ${col} to ${table}...`);
      await db.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    } else {
      console.log(`Column ${col} already exists in ${table}.`);
    }
  }

  await addCol('gyms', 'week_start_day', "INT NOT NULL DEFAULT 1 COMMENT '1=Lunes, 7=Domingo'");
  await db.query('UPDATE gyms SET week_start_day = 1 WHERE gym_id = 1');

  await addCol('users', 'joined_at', 'DATE NULL');
  await addCol('users', 'billing_anchor_day', "INT NULL COMMENT 'Día acordado de corte/pago mensual (1-31)'");
  await db.query('UPDATE users SET joined_at = DATE(login_date) WHERE joined_at IS NULL AND login_date IS NOT NULL');

  await addCol('gym_sub_plans', 'name', "VARCHAR(100) NOT NULL DEFAULT '' AFTER gym_id");
  await addCol('gym_sub_plans', 'duration_days', 'INT NOT NULL DEFAULT 30 AFTER weekly_attendance_limit');

  await db.query(`
    CREATE TABLE IF NOT EXISTS user_subscriptions (
      user_subscription_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      gym_id INT NOT NULL,
      gym_sub_plan_id BIGINT NOT NULL,
      payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      price_paid DECIMAL(30,8) NOT NULL,
      status ENUM('active', 'expired', 'scheduled', 'cancelled') NOT NULL DEFAULT 'active',
      notes TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (user_subscription_id),
      INDEX idx_sub_user_gym (user_id, gym_id, status),
      INDEX idx_sub_dates (start_date, end_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS gym_attendances (
      gym_attendance_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      gym_id INT NOT NULL,
      user_subscription_id BIGINT UNSIGNED NULL,
      checkin_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status ENUM('granted', 'denied') NOT NULL DEFAULT 'granted',
      reason VARCHAR(255) NULL,
      PRIMARY KEY (gym_attendance_id),
      INDEX idx_att_user_gym_date (user_id, gym_id, checkin_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `);

  const [existingPlans] = await db.query('SELECT * FROM gym_sub_plans WHERE gym_id = 1');
  if (existingPlans.length === 0) {
    console.log('Inserting default plans for Del Valle Fitness...');
    await db.query(`
      INSERT INTO gym_sub_plans (gym_id, name, billing_period_id, weekly_attendance_limit, duration_days, price, description, created_at, status_id)
      VALUES 
      (1, 'Pase Diario', 1, 1, 1, 3.00, 'Entrada por día individual. Válido por el día de emisión.', NOW(), 1),
      (1, 'Plan 4 Días Semanales', 3, 4, 30, 20.00, 'Hasta 4 entrenamientos por semana. Corte semanal cada lunes (no acumulable).', NOW(), 1),
      (1, 'Plan 5 Días Semanales', 3, 5, 30, 30.00, 'Hasta 5 entrenamientos por semana. Corte semanal cada lunes (no acumulable).', NOW(), 1);
    `);
  }

  console.log('Migration finished successfully!');
  process.exit(0);
}

run().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
