const db = require('../../config/database.js');

async function run() {
    console.log('Iniciando migración de colores personalizados para gimnasios...');

    const columnsCheck = await db.promise().query(
        "SHOW COLUMNS FROM `gyms` LIKE 'primary_color'"
    );

    if (columnsCheck[0].length === 0) {
        console.log('Agregando columnas primary_color y secondary_color a gyms...');
        await db.promise().query(`
            ALTER TABLE \`gyms\`
            ADD COLUMN \`primary_color\` VARCHAR(20) NOT NULL DEFAULT '#2563eb' COMMENT 'Color primario de acento para la interfaz' AFTER \`week_start_day\`,
            ADD COLUMN \`secondary_color\` VARCHAR(20) NOT NULL DEFAULT '#1d4ed8' COMMENT 'Color secundario / hover' AFTER \`primary_color\`;
        `);
        console.log('Columnas agregadas con éxito.');
    } else {
        console.log('Las columnas de colores ya existen en gyms.');
    }

    // Configurar color para Del Valle Fitness (#7c3aed = violeta/púrpura elegante como su logo)
    await db.promise().query(`
        UPDATE \`gyms\`
        SET \`primary_color\` = '#7c3aed', \`secondary_color\` = '#6d28d9'
        WHERE \`gym_id\` = 1 AND (\`primary_color\` = '#2563eb' OR \`primary_color\` IS NULL);
    `);
    console.log('Color configurado para gimnasio 1 (Del Valle Fitness).');

    process.exit(0);
}

run().catch(err => {
    console.error('Error en migración:', err);
    process.exit(1);
});
