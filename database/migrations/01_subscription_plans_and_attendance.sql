-- Migración: Sistema de Planes de Suscripción, Cortes Semanales y Asistencias

-- 1. Agregar configuración de día de corte semanal a gyms
ALTER TABLE `gyms` 
ADD COLUMN IF NOT EXISTS `week_start_day` INT NOT NULL DEFAULT 1 COMMENT '1=Lunes, 7=Domingo';

UPDATE `gyms` SET `week_start_day` = 1 WHERE `gym_id` = 1 AND `week_start_day` IS NULL;

-- 2. Agregar fechas clave a users: fecha de ingreso y día acordado de corte/pago
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `joined_at` DATE NULL DEFAULT (CURRENT_DATE) COMMENT 'Fecha de registro/ingreso al gimnasio';

ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `billing_anchor_day` INT NULL DEFAULT NULL COMMENT 'Día pactado de cobro/corte mensual (1-31)';

UPDATE `users` SET `joined_at` = DATE(`login_date`) WHERE `joined_at` IS NULL AND `login_date` IS NOT NULL;

-- 3. Actualizar estructura de gym_sub_plans si no tiene name y duration_days
ALTER TABLE `gym_sub_plans` 
ADD COLUMN IF NOT EXISTS `name` VARCHAR(100) NOT NULL DEFAULT '' AFTER `gym_id`;

ALTER TABLE `gym_sub_plans` 
ADD COLUMN IF NOT EXISTS `duration_days` INT NOT NULL DEFAULT 30 AFTER `weekly_attendance_limit`;

-- 4. Crear tabla de suscripciones de usuarios
CREATE TABLE IF NOT EXISTS `user_subscriptions` (
  `user_subscription_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `gym_id` INT NOT NULL,
  `gym_sub_plan_id` BIGINT NOT NULL,
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
  INDEX `idx_sub_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Crear tabla de asistencias/check-in
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Insertar planes iniciales de Del Valle Fitness (gym_id = 1)
INSERT INTO `gym_sub_plans` (`gym_id`, `name`, `billing_period_id`, `weekly_attendance_limit`, `duration_days`, `price`, `description`, `created_at`, `status_id`)
SELECT 1, 'Pase Diario', 1, 1, 1, 3.00, 'Entrada por día individual. Válido por el día de emisión.', NOW(), 1
WHERE NOT EXISTS (SELECT 1 FROM `gym_sub_plans` WHERE `gym_id` = 1 AND `name` = 'Pase Diario');

INSERT INTO `gym_sub_plans` (`gym_id`, `name`, `billing_period_id`, `weekly_attendance_limit`, `duration_days`, `price`, `description`, `created_at`, `status_id`)
SELECT 1, 'Plan 4 Días Semanales', 3, 4, 30, 20.00, 'Hasta 4 entrenamientos por semana. Corte semanal cada lunes (no acumulable).', NOW(), 1
WHERE NOT EXISTS (SELECT 1 FROM `gym_sub_plans` WHERE `gym_id` = 1 AND `name` = 'Plan 4 Días Semanales');

INSERT INTO `gym_sub_plans` (`gym_id`, `name`, `billing_period_id`, `weekly_attendance_limit`, `duration_days`, `price`, `description`, `created_at`, `status_id`)
SELECT 1, 'Plan 5 Días Semanales', 3, 5, 30, 30.00, 'Hasta 5 entrenamientos por semana. Corte semanal cada lunes (no acumulable).', NOW(), 1
WHERE NOT EXISTS (SELECT 1 FROM `gym_sub_plans` WHERE `gym_id` = 1 AND `name` = 'Plan 5 Días Semanales');
