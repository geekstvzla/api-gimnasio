const db = require('../../config/database.js');

async function run() {
    console.log('Iniciando migración de monedas y tasas de cambio...');

    const queries = [
        `CREATE TABLE IF NOT EXISTS \`currencies\` (
          \`currency_id\` int unsigned NOT NULL AUTO_INCREMENT,
          \`abbreviation\` varchar(3) NOT NULL,
          \`symbol\` varchar(5) DEFAULT NULL,
          \`decimals\` int NOT NULL DEFAULT 2,
          \`status_id\` int NOT NULL DEFAULT 1,
          PRIMARY KEY (\`currency_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

        `CREATE TABLE IF NOT EXISTS \`currencies_lang\` (
          \`currencies_lang_id\` int NOT NULL AUTO_INCREMENT,
          \`currency_id\` int NOT NULL,
          \`language_id\` int NOT NULL,
          \`description\` varchar(45) NOT NULL,
          \`status_id\` int NOT NULL DEFAULT 1,
          PRIMARY KEY (\`currencies_lang_id\`),
          KEY \`idx_curr_lang\` (\`currency_id\`, \`language_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

        `CREATE TABLE IF NOT EXISTS \`currencies_exchange\` (
          \`currencies_exchange_id\` int NOT NULL AUTO_INCREMENT,
          \`from_currency_id\` int NOT NULL,
          \`to_currency_id\` int NOT NULL,
          \`rate\` decimal(20,8) NOT NULL,
          \`status_id\` int NOT NULL DEFAULT 1,
          PRIMARY KEY (\`currencies_exchange_id\`),
          KEY \`idx_from_to\` (\`from_currency_id\`, \`to_currency_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

        `INSERT INTO \`currencies\` (\`currency_id\`, \`abbreviation\`, \`symbol\`, \`decimals\`, \`status_id\`)
         VALUES 
           (1, 'VES', 'Bs', 2, 1),
           (2, 'USD', '$', 2, 1),
           (3, 'EUR', '€', 2, 1)
         ON DUPLICATE KEY UPDATE 
           \`abbreviation\` = VALUES(\`abbreviation\`),
           \`symbol\` = VALUES(\`symbol\`),
           \`decimals\` = VALUES(\`decimals\`),
           \`status_id\` = VALUES(\`status_id\`);`,

        `INSERT INTO \`currencies_lang\` (\`currencies_lang_id\`, \`currency_id\`, \`language_id\`, \`description\`, \`status_id\`)
         VALUES
           (1, 1, 1, 'Bolívares', 1),
           (2, 1, 2, 'Bolivars', 1),
           (3, 2, 1, 'Dólares', 1),
           (4, 2, 2, 'Dollars', 1),
           (5, 3, 1, 'Euros', 1),
           (6, 3, 2, 'Euros', 1)
         ON DUPLICATE KEY UPDATE 
           \`description\` = VALUES(\`description\`),
           \`status_id\` = VALUES(\`status_id\`);`
    ];

    for (const sql of queries) {
        await new Promise((resolve, reject) => {
            db.query(sql, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    console.log('Migración completada exitosamente.');
    process.exit(0);
}

run().catch(err => {
    console.error('Error en la migración:', err);
    process.exit(1);
});
