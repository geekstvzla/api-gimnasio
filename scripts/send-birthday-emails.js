const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const birthdayModel = require('../models/birthday.js');
const emailsModel = require('../models/emails.js');

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        dryRun: false,
        force: false,
        targetDate: null,
        gymId: null,
        testEmail: null,
        skipAdminReport: false
    };

    for (const arg of args) {
        if (arg === '--dry-run') {
            options.dryRun = true;
        } else if (arg === '--force') {
            options.force = true;
        } else if (arg.startsWith('--date=')) {
            options.targetDate = arg.split('=')[1];
        } else if (arg.startsWith('--gym-id=')) {
            options.gymId = parseInt(arg.split('=')[1], 10);
        } else if (arg.startsWith('--test-email=')) {
            options.testEmail = arg.split('=')[1];
        } else if (arg === '--skip-admin-report') {
            options.skipAdminReport = true;
        } else if (arg === '--help' || arg === '-h') {
            console.log(`
Uso: node ./scripts/send-birthday-emails.js [opciones]

Opciones:
  --dry-run               Simula el proceso sin enviar correos ni registrar logs.
  --force                 Envía los correos ignorando si ya se enviaron este año.
  --date=YYYY-MM-DD       Verifica los cumpleañeros de una fecha específica en lugar de hoy.
  --gym-id=N              Ejecuta el proceso únicamente para el gimnasio con ID N.
  --test-email=correo     Redirige todos los envíos (clientes y admin) a esta dirección de prueba.
  --skip-admin-report     Envía solo a los cumpleañeros, omitiendo el reporte a dueños/admins.
  --help, -h              Muestra esta ayuda.
            `);
            process.exit(0);
        }
    }

    return options;
}

async function runBirthdayEmails(options = {}) {
    const startTime = Date.now();
    const dryRun = Boolean(options.dryRun);
    const force = Boolean(options.force);
    const targetDate = options.targetDate || null;
    const gymIdFilter = options.gymId || null;
    const testEmail = options.testEmail || null;
    const skipAdminReport = Boolean(options.skipAdminReport);

    // Para evitar desfases de zona horaria con cadenas YYYY-MM-DD
    const refDate = targetDate ? new Date(`${targetDate}T12:00:00`) : new Date();
    const executionDate = targetDate || refDate.toISOString().slice(0, 10);
    const dateFormatted = refDate.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    console.log('===============================================================');
    console.log(`[CUMPLEAÑOS GIMNASIO] Proceso diario iniciado - ${new Date().toISOString()}`);
    console.log(`[CUMPLEAÑOS GIMNASIO] Fecha evaluada: ${executionDate} (${dateFormatted})`);
    if (dryRun) console.log('⚠️  MODO SIMULACIÓN (DRY-RUN): No se enviarán correos reales ni se grabarán logs.');
    if (force) console.log('⚠️  MODO FORZADO (FORCE): Se enviarán incluso si ya fueron enviados este año.');
    if (gymIdFilter) console.log(`🏢 FILTRO DE GIMNASIO: ID ${gymIdFilter}`);
    if (testEmail) console.log(`✉️  REDIRECCIÓN DE PRUEBAS: Todos los correos irán a ${testEmail}`);
    console.log('===============================================================');

    await birthdayModel.ensureBirthdayLogsTable();

    const gyms = await birthdayModel.getActiveGyms(gymIdFilter);
    console.log(`[INFO] Gimnasios activos encontrados para procesar: ${gyms.length}`);

    const appBaseUrl = process.env.APP_URL || 'http://localhost:5173';

    const overallSummary = {
        success: true,
        executionDate,
        totalGyms: gyms.length,
        totalClientsFound: 0,
        totalClientEmailsSent: 0,
        totalClientEmailsFailed: 0,
        totalAdminReportsSent: 0,
        gymsReport: []
    };

    for (const gym of gyms) {
        console.log(`\n---------------------------------------------------------------`);
        console.log(`🏢 Procesando Gimnasio: [ID: ${gym.gym_id}] ${gym.name} (${gym.slug})`);

        const gymSummary = {
            gymId: gym.gym_id,
            gymName: gym.name,
            gymSlug: gym.slug,
            celebrantsFound: 0,
            celebrantsSent: 0,
            celebrantsFailed: 0,
            adminReportsSent: 0,
            celebrantsList: []
        };

        const celebrants = await birthdayModel.getBirthdayCelebrantsForGym({
            gymId: gym.gym_id,
            targetDate,
            force
        });

        gymSummary.celebrantsFound = celebrants.length;
        overallSummary.totalClientsFound += celebrants.length;

        if (celebrants.length === 0) {
            console.log(`   ℹ️ No hay cumpleañeros pendientes hoy en ${gym.name}.`);
            overallSummary.gymsReport.push(gymSummary);
            continue;
        }

        console.log(`   🎉 Cumpleañeros encontrados: ${celebrants.length}`);

        const gymUrl = `${appBaseUrl}/${gym.slug}`;
        const dashboardUrl = `${appBaseUrl}/${gym.slug}/dashboard`;

        // 1. Enviar correo a cada atleta cumpleañero
        for (let i = 0; i < celebrants.length; i++) {
            const user = celebrants[i];
            const recipient = testEmail || user.email;
            const progress = `[${i + 1}/${celebrants.length}]`;

            console.log(`   ${progress} Atleta: #${user.user_id} ${user.full_name} (${user.email}) | Nacimiento: ${user.birthday}`);

            if (!user.email || !user.email.includes('@')) {
                console.warn(`      ⚠️ Correo inválido omitido: "${user.email}"`);
                gymSummary.celebrantsFailed++;
                overallSummary.totalClientEmailsFailed++;
                continue;
            }

            if (dryRun) {
                console.log(`      [SIMULACIÓN] Correo de felicitación cliente enviado a ${recipient}`);
                gymSummary.celebrantsSent++;
                overallSummary.totalClientEmailsSent++;
                gymSummary.celebrantsList.push({ userId: user.user_id, name: user.full_name, email: recipient, status: 'SIMULATED' });
                continue;
            }

            try {
                const res = await emailsModel.birthdayClient({
                    email: recipient,
                    userName: user.display_name,
                    fullName: user.full_name,
                    gymId: gym.gym_id,
                    gymSlug: gym.slug,
                    gymName: gym.name,
                    gymUrl: gymUrl,
                    langId: 1
                });

                if (res && res.status === 'success') {
                    console.log(`      ✅ Felicitación enviada con éxito a ${recipient}`);
                    await birthdayModel.logBirthdayEmail({
                        userId: user.user_id,
                        gymId: gym.gym_id,
                        email: user.email,
                        birthday: user.birthday,
                        targetDate,
                        status: 'SENT'
                    });
                    gymSummary.celebrantsSent++;
                    overallSummary.totalClientEmailsSent++;
                    gymSummary.celebrantsList.push({ userId: user.user_id, name: user.full_name, email: recipient, status: 'SENT' });
                } else {
                    const errMsg = res?.message || 'Error al enviar correo';
                    console.error(`      ❌ Error al enviar felicitación: ${errMsg}`);
                    await birthdayModel.logBirthdayEmail({
                        userId: user.user_id,
                        gymId: gym.gym_id,
                        email: user.email,
                        birthday: user.birthday,
                        targetDate,
                        status: 'FAILED',
                        errorMessage: errMsg
                    });
                    gymSummary.celebrantsFailed++;
                    overallSummary.totalClientEmailsFailed++;
                }
            } catch (err) {
                console.error(`      ❌ Excepción enviando a ${recipient}:`, err.message || err);
                await birthdayModel.logBirthdayEmail({
                    userId: user.user_id,
                    gymId: gym.gym_id,
                    email: user.email,
                    birthday: user.birthday,
                    targetDate,
                    status: 'FAILED',
                    errorMessage: err.message || String(err)
                });
                gymSummary.celebrantsFailed++;
                overallSummary.totalClientEmailsFailed++;
            }

            // Pausa entre envíos para cuidar el servidor SMTP
            if (!dryRun && i < celebrants.length - 1) {
                await new Promise(r => setTimeout(r, 250));
            }
        }

        // 2. Enviar reporte diario con listado al dueño / administrador del gimnasio
        if (!skipAdminReport && celebrants.length > 0) {
            const admins = await birthdayModel.getGymAdmins(gym.gym_id);
            console.log(`   📬 Administradores/dueños a notificar para ${gym.name}: ${admins.length}`);

            for (const admin of admins) {
                const adminRecipient = testEmail || admin.email;

                if (dryRun) {
                    console.log(`      [SIMULACIÓN] Reporte de cumpleañeros enviado al admin ${admin.name} (${adminRecipient})`);
                    gymSummary.adminReportsSent++;
                    overallSummary.totalAdminReportsSent++;
                    continue;
                }

                try {
                    const repRes = await emailsModel.birthdayAdminReport({
                        email: adminRecipient,
                        adminName: admin.name,
                        gymId: gym.gym_id,
                        gymSlug: gym.slug,
                        gymName: gym.name,
                        todayDate: dateFormatted,
                        celebrants: celebrants,
                        dashboardUrl: dashboardUrl,
                        langId: 1
                    });

                    if (repRes && repRes.status === 'success') {
                        console.log(`      ✅ Reporte diario enviado con éxito al administrador ${admin.name} (${adminRecipient})`);
                        gymSummary.adminReportsSent++;
                        overallSummary.totalAdminReportsSent++;
                    } else {
                        console.error(`      ❌ Error enviando reporte al administrador ${adminRecipient}:`, repRes?.message);
                    }
                } catch (adminErr) {
                    console.error(`      ❌ Excepción enviando reporte al admin ${adminRecipient}:`, adminErr.message || adminErr);
                }
            }
        }

        overallSummary.gymsReport.push(gymSummary);
    }

    overallSummary.elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n===============================================================');
    console.log('[CUMPLEAÑOS GIMNASIO] Resumen Final de Ejecución:');
    console.log(`  - Gimnasios evaluados:           ${overallSummary.totalGyms}`);
    console.log(`  - Cumpleañeros encontrados:      ${overallSummary.totalClientsFound}`);
    console.log(`  - Correos enviados a clientes:   ${overallSummary.totalClientEmailsSent}`);
    console.log(`  - Fallos en correos de clientes: ${overallSummary.totalClientEmailsFailed}`);
    console.log(`  - Reportes enviados a dueños:    ${overallSummary.totalAdminReportsSent}`);
    console.log(`  - Tiempo total de ejecución:     ${overallSummary.elapsedSeconds}s`);
    console.log('===============================================================');

    return overallSummary;
}

async function run() {
    try {
        const options = parseArgs();
        const summary = await runBirthdayEmails(options);
        process.exit(0);
    } catch (err) {
        console.error('Error fatal al ejecutar send-birthday-emails:', err.message || err);
        process.exit(1);
    }
}

if (require.main === module) {
    run();
}

module.exports = {
    runBirthdayEmails
};
