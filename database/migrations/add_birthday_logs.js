const db = require('../../config/database.js').promise();

async function run() {
    try {
        await db.query(`
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
        `);
        console.log('✅ Table birthday_email_logs created/verified successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

run();
