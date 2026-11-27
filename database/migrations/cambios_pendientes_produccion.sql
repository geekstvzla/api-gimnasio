-- ==============================================================================
-- CAMBIOS DIFERENCIALES PENDIENTES PARA PRODUCCIÓN (sofguarc_gym)
-- Generado el: 2026-11-27
-- Comparativa: Local (gimnasio) vs Producción (sofguarc_gym 19:52:44)
-- ==============================================================================

-- 1. AGREGAR COLUMNA 'sidebar_color' EN LA TABLA 'gyms'
-- Permite personalizar el color de fondo del menú lateral (sidebar) por cada gimnasio.
ALTER TABLE `gyms` 
ADD COLUMN `sidebar_color` VARCHAR(20) NOT NULL DEFAULT '#0f172a' 
COMMENT 'Color de fondo del menú lateral (sidebar)' 
AFTER `secondary_color`;

-- Configurar el color negro (#000000) para Del Valle Fitness (gym_id = 1)
UPDATE `gyms` 
SET `sidebar_color` = '#000000' 
WHERE `gym_id` = 1;


-- 2. AGREGAR COLUMNA 'nickname' EN LA TABLA 'users'
-- Soporte para apodo / alias de usuario
ALTER TABLE `users` 
ADD COLUMN `nickname` VARCHAR(50) NULL DEFAULT NULL 
AFTER `username`;


-- 3. CREAR TABLA 'subscription_email_logs'
-- Registra el historial de correos automáticos de vencimiento enviados
-- (evita duplicidad al ejecutar la tarea programada / cron de notificaciones).
CREATE TABLE IF NOT EXISTS `subscription_email_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_subscription_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `gym_id` INT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `notification_type` ENUM('EXPIRING_SOON','EXPIRES_TODAY','EXPIRED') NOT NULL,
  `diff_days` INT NOT NULL COMMENT 'Diferencia en días (+5, 0, -1, -2, -3)',
  `sent_date` DATE NOT NULL,
  `sent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(20) NOT NULL DEFAULT 'SENT',
  `error_message` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_sub_notif_diff` (`user_subscription_id`, `notification_type`, `diff_days`),
  KEY `idx_sub_user_gym` (`user_id`, `gym_id`),
  KEY `idx_sub_sent_date` (`sent_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
