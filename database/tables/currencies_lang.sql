CREATE TABLE IF NOT EXISTS `currencies_lang` (
  `currencies_lang_id` int NOT NULL AUTO_INCREMENT,
  `currency_id` int NOT NULL,
  `language_id` int NOT NULL,
  `description` varchar(45) NOT NULL,
  `status_id` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`currencies_lang_id`),
  KEY `idx_curr_lang` (`currency_id`, `language_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
