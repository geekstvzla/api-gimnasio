const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const subscriptionsModel = require('../models/subscriptions.js');
const emailsModel = require('../models/emails.js');

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        dryRun: false,
        force: false,
        targetDate: null,
        gymId: null,
        testEmail: null
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
        } else if (arg === '--help' || arg === '-h') {
            console.log(`
Uso: node ./scripts/send-subscription-reminders.js [opciones]

Opciones:
  --dry-run               Simula el proceso sin enviar correos ni registrar en base de datos.
  --force                 Envía los correos ignorando si ya se registraron en subscription_email_logs.
  --date=YYYY-MM-DD       Evalúa los vencimientos para una fecha específica (por defecto hoy).
  --gym-id=N              Ejecuta el proceso únicamente para el gimnasio con ID N.
  --test-email=correo     Redirige todos los envíos a esta dirección de correo de prueba.
  --help, -h              Muestra esta ayuda.
            `);
            process.exit(0);
        }
    }

    return options;
}

async function runSubscriptionReminders(options = {}) {
    const startTime = Date.now();
    const dryRun = Boolean(options.dryRun);
    const force = Boolean(options.force);
    const targetDate = options.targetDate || null;
    const gymIdFilter = options.gymId || null;
    const testEmail = options.testEmail || null;

    const refDate = targetDate ? new Date(`${targetDate}T12:00:00`) : new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const executionDate = targetDate || `${refDate.getFullYear()}-${pad(refDate.getMonth() + 1)}-${pad(refDate.getDate())}`;
    const dateFormatted = `${pad(refDate.getDate())}/${pad(refDate.getMonth() + 1)}/${refDate.getFullYear()}`;

    console.log('===============================================================');
    console.log(`[RECORDATORIOS SUSCRIPCIONES] Proceso iniciado - ${new Date().toISOString()}`);
    console.log(`[FECHA EVALUADA] ${executionDate} (${dateFormatted})`);
    if (dryRun) console.log('⚠️  MODO SIMULACIÓN (DRY-RUN): No se enviarán correos ni se grabarán logs.');
    if (force) console.log('⚠️  MODO FORZADO (FORCE): Se enviarán ignorando envíos previos.');
    if (gymIdFilter) console.log(`🏢 FILTRO DE GIMNASIO: ID ${gymIdFilter}`);
    if (testEmail) console.log(`✉️  REDIRECCIÓN DE PRUEBAS: Todos los correos irán a ${testEmail}`);
    console.log('===============================================================');

    // 1. Auto-marcar como vencidas las suscripciones activas cuya end_date sea anterior a la fecha evaluada
    if (!dryRun) {
        try {
            const updatedExpired = await subscriptionsModel.updateExpiredSubscriptions(executionDate);
            if (updatedExpired > 0) {
                console.log(`[INFO] Se actualizaron ${updatedExpired} suscripción(es) activas a estado 'expired'.`);
            }
        } catch (err) {
            console.error('[ERROR] Error al actualizar suscripciones vencidas:', err.message);
        }
    }

    // 2. Obtener suscripciones que requieren recordatorio
    const subscriptions = await subscriptionsModel.getSubscriptionsNeedingReminders({
        targetDate: executionDate,
        gymId: gymIdFilter,
        force: force
    });

    console.log(`[INFO] Suscripciones candidatas encontradas: ${subscriptions.length}`);

    const summary = {
        success: true,
        executionDate,
        totalFound: subscriptions.length,
        totalSent: 0,
        totalFailed: 0,
        details: []
    };

    const appBaseUrl = process.env.APP_URL || 'https://gym.sumandokilometros.com.ve';

    for (const sub of subscriptions) {
        const recipientEmail = testEmail || sub.email;
        const priceFormatted = sub.plan_price != null ? `${sub.currency_symbol || '€'} ${parseFloat(sub.plan_price).toFixed(2)}` : null;
        const gymUrl = `${appBaseUrl}/${sub.gym_slug}`;

        let notifLabel = '';
        if (sub.notification_type === 'EXPIRING_SOON') notifLabel = `⏳ Próximo a vencer en ${sub.diff_days} días`;
        else if (sub.notification_type === 'EXPIRES_TODAY') notifLabel = `🔔 Vence hoy`;
        else notifLabel = `⚠️ Vencido hace ${Math.abs(sub.diff_days)} día(s)`;

        console.log(`\n-> [${sub.notification_type}] ${notifLabel}`);
        console.log(`   Gimnasio: ${sub.gym_name} | Cliente: ${sub.user_name} (${recipientEmail})`);
        console.log(`   Plan: ${sub.plan_name} | Vence: ${sub.end_date_formatted}`);

        const itemResult = {
            userSubscriptionId: sub.user_subscription_id,
            userId: sub.user_id,
            userName: sub.user_name,
            email: recipientEmail,
            gymId: sub.gym_id,
            gymName: sub.gym_name,
            notificationType: sub.notification_type,
            diffDays: sub.diff_days,
            planName: sub.plan_name,
            endDate: sub.end_date,
            status: 'PENDING',
            error: null
        };

        if (dryRun) {
            console.log(`   [DRY-RUN] Simulación de envío exitosa hacia ${recipientEmail}`);
            itemResult.status = 'SIMULATED';
            summary.totalSent++;
            summary.details.push(itemResult);
            continue;
        }

        try {
            const mailParams = {
                email: recipientEmail,
                gymId: sub.gym_id,
                gymName: sub.gym_name,
                gymSlug: sub.gym_slug,
                userName: sub.first_name || sub.user_name,
                notificationType: sub.notification_type,
                diffDays: sub.diff_days,
                endDateFormatted: sub.end_date_formatted,
                planName: sub.plan_name,
                priceFormatted: priceFormatted,
                gymUrl: gymUrl
            };

            const sendResult = await emailsModel.subscriptionReminder(mailParams);

            if (sendResult && sendResult.status === 'error') {
                throw new Error(sendResult.message || 'Error desconocido al enviar el email');
            }

            console.log(`   ✅ Correo enviado con éxito a ${recipientEmail}`);
            itemResult.status = 'SENT';
            summary.totalSent++;

            // Registrar en base de datos para evitar duplicidad
            await subscriptionsModel.logSubscriptionEmail({
                user_subscription_id: sub.user_subscription_id,
                user_id: sub.user_id,
                gym_id: sub.gym_id,
                email: sub.email,
                notification_type: sub.notification_type,
                diff_days: sub.diff_days,
                sent_date: executionDate,
                status: 'SENT',
                error_message: null
            });
        } catch (sendErr) {
            console.error(`   ❌ Falló el envío a ${recipientEmail}:`, sendErr.message);
            itemResult.status = 'FAILED';
            itemResult.error = sendErr.message;
            summary.totalFailed++;

            await subscriptionsModel.logSubscriptionEmail({
                user_subscription_id: sub.user_subscription_id,
                user_id: sub.user_id,
                gym_id: sub.gym_id,
                email: sub.email,
                notification_type: sub.notification_type,
                diff_days: sub.diff_days,
                sent_date: executionDate,
                status: 'FAILED',
                error_message: sendErr.message
            });
        }

        summary.details.push(itemResult);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n===============================================================');
    console.log(`[RESUMEN FINAL] Completado en ${duration}s`);
    console.log(`Encontradas: ${summary.totalFound} | Enviadas: ${summary.totalSent} | Fallidas: ${summary.totalFailed}`);
    console.log('===============================================================');

    return summary;
}

if (require.main === module) {
    const options = parseArgs();
    runSubscriptionReminders(options)
        .then(() => process.exit(0))
        .catch((err) => {
            console.error('[ERROR CRÍTICO]', err);
            process.exit(1);
        });
}

module.exports = {
    runSubscriptionReminders
};
