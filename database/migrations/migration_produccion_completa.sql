-- =======================================================================
-- SCRIPT DE MIGRACIÓN PARA SERVIDOR DE PRODUCCIÓN / COMPARTIDO (cPanel / phpMyAdmin)
-- Proyecto: api-gimnasio / app-gimnasio
-- =======================================================================

-- 1. ALTERACIONES A TABLAS EXISTENTES
-- -----------------------------------------------------------------------

-- 1.1 Configuración de inicio de semana en gimnasios (1=Lunes, 7=Domingo)
ALTER TABLE `gyms` 
ADD COLUMN `week_start_day` INT NOT NULL DEFAULT 1 COMMENT '1=Lunes, 7=Domingo';

UPDATE `gyms` SET `week_start_day` = 1 WHERE `gym_id` = 1 AND `week_start_day` IS NULL;

-- 1.2 Fechas clave en la tabla de usuarios
ALTER TABLE `users` 
ADD COLUMN `joined_at` DATE NULL DEFAULT NULL COMMENT 'Fecha de registro/ingreso al gimnasio',
ADD COLUMN `billing_anchor_day` INT NULL DEFAULT NULL COMMENT 'Día pactado de cobro/corte mensual (1-31)';

UPDATE `users` SET `joined_at` = DATE(`login_date`) WHERE `joined_at` IS NULL AND `login_date` IS NOT NULL;

-- 1.3 Nombre y duración en días para los planes de suscripción
ALTER TABLE `gym_sub_plans` 
ADD COLUMN `name` VARCHAR(100) NOT NULL DEFAULT '' AFTER `gym_id`,
ADD COLUMN `duration_days` INT NOT NULL DEFAULT 30 AFTER `weekly_attendance_limit`;


-- 2. CREACIÓN DE NUEVAS TABLAS
-- -----------------------------------------------------------------------

-- 2.1 Tabla de Métodos de Pago
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `payment_method_id` INT NOT NULL AUTO_INCREMENT,
  `status_id` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`payment_method_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.2 Tabla de Idiomas / Descripciones de Métodos de Pago
CREATE TABLE IF NOT EXISTS `payment_methods_lang` (
  `payment_methods_lang_id` INT NOT NULL AUTO_INCREMENT,
  `payment_method_id` INT NOT NULL,
  `language_id` INT NOT NULL DEFAULT 1,
  `description` VARCHAR(100) NOT NULL,
  `status_id` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`payment_methods_lang_id`),
  KEY `idx_pm_lang` (`payment_method_id`, `language_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.3 Tabla de Suscripciones de Usuarios (con payment_method_id)
CREATE TABLE IF NOT EXISTS `user_subscriptions` (
  `user_subscription_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `gym_id` INT NOT NULL,
  `gym_sub_plan_id` BIGINT NOT NULL,
  `payment_method_id` INT NULL DEFAULT NULL,
  `payment_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `price_paid` DECIMAL(30,8) NOT NULL,
  `status` ENUM('active', 'expired', 'scheduled', 'cancelled') NOT NULL DEFAULT 'active',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_subscription_id`),
  INDEX `idx_sub_user_gym` (`user_id`, `gym_id`, `status`),
  INDEX `idx_sub_dates` (`start_date`, `end_date`),
  INDEX `idx_sub_pm` (`payment_method_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.4 Tabla de Asistencias (Check-ins)
CREATE TABLE IF NOT EXISTS `gym_attendances` (
  `gym_attendance_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `gym_id` INT NOT NULL,
  `user_subscription_id` BIGINT UNSIGNED NULL,
  `checkin_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('granted', 'denied') NOT NULL DEFAULT 'granted',
  `reason` VARCHAR(255) NULL,
  PRIMARY KEY (`gym_attendance_id`),
  INDEX `idx_att_user_gym_date` (`user_id`, `gym_id`, `checkin_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2.5 Tabla de Logs de Correos de Cumpleaños (Anti-duplicidad de envíos anuales)
CREATE TABLE IF NOT EXISTS `birthday_email_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `gym_id` INT NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `birthday` DATE NOT NULL,
  `year_sent` INT NOT NULL,
  `sent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` VARCHAR(20) NOT NULL DEFAULT 'SENT',
  `error_message` TEXT NULL,
  UNIQUE KEY `idx_user_gym_year` (`user_id`, `gym_id`, `year_sent`),
  KEY `idx_sent_at` (`sent_at`),
  KEY `idx_gym_sent` (`gym_id`, `year_sent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 3. DATOS INICIALES REQUERIDOS (INSERTS)
-- -----------------------------------------------------------------------

-- 3.1 Métodos de Pago base (Pago Móvil, Efectivo, Binance, Zelle, Transferencia Bancaria)
INSERT IGNORE INTO `payment_methods` (`payment_method_id`, `status_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1);

INSERT IGNORE INTO `payment_methods_lang` (`payment_methods_lang_id`, `payment_method_id`, `language_id`, `description`, `status_id`) VALUES
(1, 1, 1, 'Pago Móvil', 1),
(2, 1, 2, 'Mobile Payment', 1),
(3, 2, 1, 'Efectivo', 1),
(4, 2, 2, 'Cash', 1),
(5, 3, 1, 'Binance', 1),
(6, 3, 2, 'Binance', 1),
(7, 4, 1, 'Zelle', 1),
(8, 4, 2, 'Zelle', 1),
(9, 5, 1, 'Transferencia Bancaria', 1),
(10, 5, 2, 'Bank Transfer', 1);

-- 3.2 Planes iniciales de ejemplo para Del Valle Fitness (gym_id = 1)
INSERT INTO `gym_sub_plans` (`gym_id`, `name`, `billing_period_id`, `weekly_attendance_limit`, `duration_days`, `price`, `description`, `created_at`, `status_id`)
SELECT 1, 'Pase Diario', 1, 1, 1, 3.00, 'Entrada por día individual. Válido por el día de emisión.', NOW(), 1
WHERE NOT EXISTS (SELECT 1 FROM `gym_sub_plans` WHERE `gym_id` = 1 AND `name` = 'Pase Diario');

INSERT INTO `gym_sub_plans` (`gym_id`, `name`, `billing_period_id`, `weekly_attendance_limit`, `duration_days`, `price`, `description`, `created_at`, `status_id`)
SELECT 1, 'Plan 4 Días Semanales', 3, 4, 30, 20.00, 'Hasta 4 entrenamientos por semana. Corte semanal cada lunes (no acumulable).', NOW(), 1
WHERE NOT EXISTS (SELECT 1 FROM `gym_sub_plans` WHERE `gym_id` = 1 AND `name` = 'Plan 4 Días Semanales');

INSERT INTO `gym_sub_plans` (`gym_id`, `name`, `billing_period_id`, `weekly_attendance_limit`, `duration_days`, `price`, `description`, `created_at`, `status_id`)
SELECT 1, 'Plan 5 Días Semanales', 3, 5, 30, 30.00, 'Hasta 5 entrenamientos por semana. Corte semanal cada lunes (no acumulable).', NOW(), 1
WHERE NOT EXISTS (SELECT 1 FROM `gym_sub_plans` WHERE `gym_id` = 1 AND `name` = 'Plan 5 Días Semanales');
