const db = require('../../config/database.js');

async function run() {
    console.log('Iniciando migración de sidebar_color para gimnasios...');

    const columnsCheck = await db.promise().query(
        "SHOW COLUMNS FROM `gyms` LIKE 'sidebar_color'"
    );

    if (columnsCheck[0].length === 0) {
        console.log('Agregando columna sidebar_color a gyms...');
        await db.promise().query(`
            ALTER TABLE \`gyms\`
            ADD COLUMN \`sidebar_color\` VARCHAR(20) NOT NULL DEFAULT '#0f172a' COMMENT 'Color de fondo del menú lateral (sidebar)' AFTER \`secondary_color\`;
        `);
        console.log('Columna sidebar_color agregada con éxito.');
    } else {
        console.log('La columna sidebar_color ya existe en gyms.');
    }

    // Configurar color negro para el menú lateral de Del Valle Fitness (gym_id = 1)
    await db.promise().query(`
        UPDATE \`gyms\`
        SET \`sidebar_color\` = '#000000'
        WHERE \`gym_id\` = 1;
    `);
    console.log('sidebar_color = #000000 configurado para gimnasio 1 (Del Valle Fitness).');

    process.exit(0);
}

run().catch(err => {
    console.error('Error en migración:', err);
    process.exit(1);
});
