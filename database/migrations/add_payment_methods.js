const db = require('../../config/database.js').promise();

async function run() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS payment_methods (
              payment_method_id INT NOT NULL AUTO_INCREMENT,
              status_id INT NOT NULL DEFAULT 1,
              PRIMARY KEY (payment_method_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS payment_methods_lang (
              payment_methods_lang_id INT NOT NULL AUTO_INCREMENT,
              payment_method_id INT NOT NULL,
              language_id INT NOT NULL DEFAULT 1,
              description VARCHAR(100) NOT NULL,
              status_id INT NOT NULL DEFAULT 1,
              PRIMARY KEY (payment_methods_lang_id),
              KEY idx_pm_lang (payment_method_id, language_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        const [existing] = await db.query('SELECT COUNT(*) as count FROM payment_methods');
        if (existing[0].count === 0) {
            const methods = [
                { id: 1, es: 'Pago Móvil', en: 'Mobile Payment' },
                { id: 2, es: 'Efectivo', en: 'Cash' },
                { id: 3, es: 'Binance', en: 'Binance' },
                { id: 4, es: 'Zelle', en: 'Zelle' },
                { id: 5, es: 'Transferencia Bancaria', en: 'Bank Transfer' }
            ];
            for (const m of methods) {
                await db.query('INSERT INTO payment_methods (payment_method_id, status_id) VALUES (?, 1)', [m.id]);
                await db.query('INSERT INTO payment_methods_lang (payment_method_id, language_id, description, status_id) VALUES (?, 1, ?, 1)', [m.id, m.es]);
                await db.query('INSERT INTO payment_methods_lang (payment_method_id, language_id, description, status_id) VALUES (?, 2, ?, 1)', [m.id, m.en]);
            }
            console.log('Payment methods inserted successfully');
        } else {
            console.log('Payment methods already exist');
        }

        const [cols] = await db.query(`
            SELECT COLUMN_NAME FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_subscriptions' AND COLUMN_NAME = 'payment_method_id'
        `);
        if (cols.length === 0) {
            await db.query('ALTER TABLE user_subscriptions ADD COLUMN payment_method_id INT NULL AFTER gym_sub_plan_id');
            console.log('Added payment_method_id to user_subscriptions');
        } else {
            console.log('payment_method_id already exists in user_subscriptions');
        }

        const [list] = await db.query(`
            SELECT pm.payment_method_id, pml.description AS payment_method
            FROM payment_methods pm
            INNER JOIN payment_methods_lang pml ON pml.payment_method_id = pm.payment_method_id
            WHERE pml.language_id = 1 AND pm.status_id = 1
            ORDER BY pm.payment_method_id ASC
        `);
        console.log('Current payment methods in DB:', list);
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
}

run();
