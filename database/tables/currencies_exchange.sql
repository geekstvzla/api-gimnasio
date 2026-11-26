CREATE TABLE IF NOT EXISTS `currencies_exchange` (
  `currencies_exchange_id` int NOT NULL AUTO_INCREMENT,
  `from_currency_id` int NOT NULL,
  `to_currency_id` int NOT NULL,
  `rate` decimal(20,8) NOT NULL,
  `status_id` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`currencies_exchange_id`),
  KEY `idx_from_to` (`from_currency_id`, `to_currency_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
