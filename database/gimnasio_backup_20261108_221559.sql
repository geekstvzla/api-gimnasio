-- MySQL dump 10.13  Distrib 8.3.0, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: gimnasio
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `billing_period`
--

DROP TABLE IF EXISTS `billing_period`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_period` (
  `billing_period_id` int NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`billing_period_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing_period`
--

LOCK TABLES `billing_period` WRITE;
/*!40000 ALTER TABLE `billing_period` DISABLE KEYS */;
INSERT INTO `billing_period` VALUES (1,1),(2,1),(3,1),(4,1);
/*!40000 ALTER TABLE `billing_period` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billing_period_lang`
--

DROP TABLE IF EXISTS `billing_period_lang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `billing_period_lang` (
  `billing_period_lang_id` int NOT NULL AUTO_INCREMENT,
  `billing_period_id` int NOT NULL,
  `language_id` int NOT NULL,
  `description` varchar(15) NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`billing_period_lang_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing_period_lang`
--

LOCK TABLES `billing_period_lang` WRITE;
/*!40000 ALTER TABLE `billing_period_lang` DISABLE KEYS */;
INSERT INTO `billing_period_lang` VALUES (1,1,1,'diario',1),(2,1,2,'daily',1),(3,2,1,'semanal',1),(4,2,2,'weekly',1),(5,3,1,'mensual',1),(6,3,2,'monthly',1),(7,4,1,'anual',1),(8,4,2,'annual',1);
/*!40000 ALTER TABLE `billing_period_lang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `country_id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(100) NOT NULL,
  `alpha_2_code` varchar(2) NOT NULL,
  `alpha_3_code` varchar(3) NOT NULL,
  `phone_code` varchar(4) NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`country_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES (1,'Venezuela','VE','VEN','+58',1);
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `country_regions`
--

DROP TABLE IF EXISTS `country_regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `country_regions` (
  `country_region_id` int NOT NULL AUTO_INCREMENT,
  `parent_region_id` int DEFAULT NULL,
  `country_id` int NOT NULL,
  `description` text NOT NULL,
  `level` int NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`country_region_id`)
) ENGINE=MyISAM AUTO_INCREMENT=1504 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `country_regions`
--

LOCK TABLES `country_regions` WRITE;
/*!40000 ALTER TABLE `country_regions` DISABLE KEYS */;
INSERT INTO `country_regions` VALUES (1,NULL,1,'Amazonas',1,1),(2,NULL,1,'Anzoátegui',1,1),(3,NULL,1,'Apure',1,1),(4,NULL,1,'Aragua',1,1),(5,NULL,1,'Barinas',1,1),(6,NULL,1,'Bolívar',1,1),(7,NULL,1,'Carabobo',1,1),(8,NULL,1,'Cojedes',1,1),(9,NULL,1,'Delta Amacuro',1,1),(10,NULL,1,'Falcón',1,1),(11,NULL,1,'Guárico',1,1),(12,NULL,1,'Lara',1,1),(13,NULL,1,'Mérida',1,1),(14,NULL,1,'Miranda',1,1),(15,NULL,1,'Monagas',1,1),(16,NULL,1,'Nueva Esparta',1,1),(17,NULL,1,'Portuguesa',1,1),(18,NULL,1,'Sucre',1,1),(19,NULL,1,'Táchira',1,1),(20,NULL,1,'Trujillo',1,1),(21,NULL,1,'La Guaira',1,1),(22,NULL,1,'Yaracuy',1,1),(23,NULL,1,'Zulia',1,1),(24,NULL,1,'Distrito Capital',1,1),(25,NULL,1,'Dependencias Federales',1,1),(26,1,1,'Alto Orinoco',2,1),(27,1,1,'Atabapo',2,1),(28,1,1,'Atures',2,1),(29,1,1,'Autana',2,1),(30,1,1,'Manapiare',2,1),(31,1,1,'Maroa',2,1),(32,1,1,'Río Negro',2,1),(33,2,1,'Anaco',2,1),(34,2,1,'Aragua',2,1),(35,2,1,'Manuel Ezequiel Bruzual',2,1),(36,2,1,'Diego Bautista Urbaneja',2,1),(37,2,1,'Fernando Peñalver',2,1),(38,2,1,'Francisco Del Carmen Carvajal',2,1),(39,2,1,'General Sir Arthur McGregor',2,1),(40,2,1,'Guanta',2,1),(41,2,1,'Independencia',2,1),(42,2,1,'José Gregorio Monagas',2,1),(43,2,1,'Juan Antonio Sotillo',2,1),(44,2,1,'Juan Manuel Cajigal',2,1),(45,2,1,'Libertad',2,1),(46,2,1,'Francisco de Miranda',2,1),(47,2,1,'Pedro María Freites',2,1),(48,2,1,'Píritu',2,1),(49,2,1,'San José de Guanipa',2,1),(50,2,1,'San Juan de Capistrano',2,1),(51,2,1,'Santa Ana',2,1),(52,2,1,'Simón Bolívar',2,1),(53,2,1,'Simón Rodríguez',2,1),(54,3,1,'Achaguas',2,1),(55,3,1,'Biruaca',2,1),(56,3,1,'Muñóz',2,1),(57,3,1,'Páez',2,1),(58,3,1,'Pedro Camejo',2,1),(59,3,1,'Rómulo Gallegos',2,1),(60,3,1,'San Fernando',2,1),(61,4,1,'Atanasio Girardot',2,1),(62,4,1,'Bolívar',2,1),(63,4,1,'Camatagua',2,1),(64,4,1,'Francisco Linares Alcántara',2,1),(65,4,1,'José Ángel Lamas',2,1),(66,4,1,'José Félix Ribas',2,1),(67,4,1,'José Rafael Revenga',2,1),(68,4,1,'Libertador',2,1),(69,4,1,'Mario Briceño Iragorry',2,1),(70,4,1,'Ocumare de la Costa de Oro',2,1),(71,4,1,'San Casimiro',2,1),(72,4,1,'San Sebastián',2,1),(73,4,1,'Santiago Mariño',2,1),(74,4,1,'Santos Michelena',2,1),(75,4,1,'Sucre',2,1),(76,4,1,'Tovar',2,1),(77,4,1,'Urdaneta',2,1),(78,4,1,'Zamora',2,1),(79,5,1,'Alberto Arvelo Torrealba',2,1),(80,5,1,'Andrés Eloy Blanco',2,1),(81,5,1,'Antonio José de Sucre',2,1),(82,5,1,'Arismendi',2,1),(83,5,1,'Barinas',2,1),(84,5,1,'Bolívar',2,1),(85,5,1,'Cruz Paredes',2,1),(86,5,1,'Ezequiel Zamora',2,1),(87,5,1,'Obispos',2,1),(88,5,1,'Pedraza',2,1),(89,5,1,'Rojas',2,1),(90,5,1,'Sosa',2,1),(91,6,1,'Caroní',2,1),(92,6,1,'Cedeño',2,1),(93,6,1,'El Callao',2,1),(94,6,1,'Gran Sabana',2,1),(95,6,1,'Heres',2,1),(96,6,1,'Piar',2,1),(97,6,1,'Angostura (Raúl Leoni)',2,1),(98,6,1,'Roscio',2,1),(99,6,1,'Sifontes',2,1),(100,6,1,'Sucre',2,1),(101,6,1,'Padre Pedro Chien',2,1),(102,7,1,'Bejuma',2,1),(103,7,1,'Carlos Arvelo',2,1),(104,7,1,'Diego Ibarra',2,1),(105,7,1,'Guacara',2,1),(106,7,1,'Juan José Mora',2,1),(107,7,1,'Libertador',2,1),(108,7,1,'Los Guayos',2,1),(109,7,1,'Miranda',2,1),(110,7,1,'Montalbán',2,1),(111,7,1,'Naguanagua',2,1),(112,7,1,'Puerto Cabello',2,1),(113,7,1,'San Diego',2,1),(114,7,1,'San Joaquín',2,1),(115,7,1,'Valencia',2,1),(116,8,1,'Anzoátegui',2,1),(117,8,1,'Tinaquillo',2,1),(118,8,1,'Girardot',2,1),(119,8,1,'Lima Blanco',2,1),(120,8,1,'Pao de San Juan Bautista',2,1),(121,8,1,'Ricaurte',2,1),(122,8,1,'Rómulo Gallegos',2,1),(123,8,1,'San Carlos',2,1),(124,8,1,'Tinaco',2,1),(125,9,1,'Antonio Díaz',2,1),(126,9,1,'Casacoima',2,1),(127,9,1,'Pedernales',2,1),(128,9,1,'Tucupita',2,1),(129,10,1,'Acosta',2,1),(130,10,1,'Bolívar',2,1),(131,10,1,'Buchivacoa',2,1),(132,10,1,'Cacique Manaure',2,1),(133,10,1,'Carirubana',2,1),(134,10,1,'Colina',2,1),(135,10,1,'Dabajuro',2,1),(136,10,1,'Democracia',2,1),(137,10,1,'Falcón',2,1),(138,10,1,'Federación',2,1),(139,10,1,'Jacura',2,1),(140,10,1,'José Laurencio Silva',2,1),(141,10,1,'Los Taques',2,1),(142,10,1,'Mauroa',2,1),(143,10,1,'Miranda',2,1),(144,10,1,'Monseñor Iturriza',2,1),(145,10,1,'Palmasola',2,1),(146,10,1,'Petit',2,1),(147,10,1,'Píritu',2,1),(148,10,1,'San Francisco',2,1),(149,10,1,'Sucre',2,1),(150,10,1,'Tocópero',2,1),(151,10,1,'Unión',2,1),(152,10,1,'Urumaco',2,1),(153,10,1,'Zamora',2,1),(154,11,1,'Camaguán',2,1),(155,11,1,'Chaguaramas',2,1),(156,11,1,'El Socorro',2,1),(157,11,1,'José Félix Ribas',2,1),(158,11,1,'José Tadeo Monagas',2,1),(159,11,1,'Juan Germán Roscio',2,1),(160,11,1,'Julián Mellado',2,1),(161,11,1,'Las Mercedes',2,1),(162,11,1,'Leonardo Infante',2,1),(163,11,1,'Pedro Zaraza',2,1),(164,11,1,'Ortíz',2,1),(165,11,1,'San Gerónimo de Guayabal',2,1),(166,11,1,'San José de Guaribe',2,1),(167,11,1,'Santa María de Ipire',2,1),(168,11,1,'Sebastián Francisco de Miranda',2,1),(169,12,1,'Andrés Eloy Blanco',2,1),(170,12,1,'Crespo',2,1),(171,12,1,'Iribarren',2,1),(172,12,1,'Jiménez',2,1),(173,12,1,'Morán',2,1),(174,12,1,'Palavecino',2,1),(175,12,1,'Simón Planas',2,1),(176,12,1,'Torres',2,1),(177,12,1,'Urdaneta',2,1),(178,13,1,'Alberto Adriani',2,1),(179,13,1,'Andrés Bello',2,1),(180,13,1,'Antonio Pinto Salinas',2,1),(181,13,1,'Aricagua',2,1),(182,13,1,'Arzobispo Chacón',2,1),(183,13,1,'Campo Elías',2,1),(184,13,1,'Caracciolo Parra Olmedo',2,1),(185,13,1,'Cardenal Quintero',2,1),(186,13,1,'Guaraque',2,1),(187,13,1,'Julio César Salas',2,1),(188,13,1,'Justo Briceño',2,1),(189,13,1,'Libertador',2,1),(190,13,1,'Miranda',2,1),(191,13,1,'Obispo Ramos de Lora',2,1),(192,13,1,'Padre Noguera',2,1),(193,13,1,'Pueblo Llano',2,1),(194,13,1,'Rangel',2,1),(195,13,1,'Rivas Dávila',2,1),(196,13,1,'Santos Marquina',2,1),(197,13,1,'Sucre',2,1),(198,13,1,'Tovar',2,1),(199,13,1,'Tulio Febres Cordero',2,1),(200,13,1,'Zea',2,1),(201,14,1,'Acevedo',2,1),(202,14,1,'Andrés Bello',2,1),(203,14,1,'Baruta',2,1),(204,14,1,'Brión',2,1),(205,14,1,'Buroz',2,1),(206,14,1,'Carrizal',2,1),(207,14,1,'Chacao',2,1),(208,14,1,'Cristóbal Rojas',2,1),(209,14,1,'El Hatillo',2,1),(210,14,1,'Guaicaipuro',2,1),(211,14,1,'Independencia',2,1),(212,14,1,'Lander',2,1),(213,14,1,'Los Salias',2,1),(214,14,1,'Páez',2,1),(215,14,1,'Paz Castillo',2,1),(216,14,1,'Pedro Gual',2,1),(217,14,1,'Plaza',2,1),(218,14,1,'Simón Bolívar',2,1),(219,14,1,'Sucre',2,1),(220,14,1,'Urdaneta',2,1),(221,14,1,'Zamora',2,1),(222,15,1,'Acosta',2,1),(223,15,1,'Aguasay',2,1),(224,15,1,'Bolívar',2,1),(225,15,1,'Caripe',2,1),(226,15,1,'Cedeño',2,1),(227,15,1,'Ezequiel Zamora',2,1),(228,15,1,'Libertador',2,1),(229,15,1,'Maturín',2,1),(230,15,1,'Piar',2,1),(231,15,1,'Punceres',2,1),(232,15,1,'Santa Bárbara',2,1),(233,15,1,'Sotillo',2,1),(234,15,1,'Uracoa',2,1),(235,16,1,'Antolín del Campo',2,1),(236,16,1,'Arismendi',2,1),(237,16,1,'García',2,1),(238,16,1,'Gómez',2,1),(239,16,1,'Maneiro',2,1),(240,16,1,'Marcano',2,1),(241,16,1,'Mariño',2,1),(242,16,1,'Península de Macanao',2,1),(243,16,1,'Tubores',2,1),(244,16,1,'Villalba',2,1),(245,16,1,'Díaz',2,1),(246,17,1,'Agua Blanca',2,1),(247,17,1,'Araure',2,1),(248,17,1,'Esteller',2,1),(249,17,1,'Guanare',2,1),(250,17,1,'Guanarito',2,1),(251,17,1,'Monseñor José Vicente de Unda',2,1),(252,17,1,'Ospino',2,1),(253,17,1,'Páez',2,1),(254,17,1,'Papelón',2,1),(255,17,1,'San Genaro de Boconoíto',2,1),(256,17,1,'San Rafael de Onoto',2,1),(257,17,1,'Santa Rosalía',2,1),(258,17,1,'Sucre',2,1),(259,17,1,'Turén',2,1),(260,18,1,'Andrés Eloy Blanco',2,1),(261,18,1,'Andrés Mata',2,1),(262,18,1,'Arismendi',2,1),(263,18,1,'Benítez',2,1),(264,18,1,'Bermúdez',2,1),(265,18,1,'Bolívar',2,1),(266,18,1,'Cajigal',2,1),(267,18,1,'Cruz Salmerón Acosta',2,1),(268,18,1,'Libertador',2,1),(269,18,1,'Mariño',2,1),(270,18,1,'Mejía',2,1),(271,18,1,'Montes',2,1),(272,18,1,'Ribero',2,1),(273,18,1,'Sucre',2,1),(274,18,1,'Valdéz',2,1),(275,19,1,'Andrés Bello',2,1),(276,19,1,'Antonio Rómulo Costa',2,1),(277,19,1,'Ayacucho',2,1),(278,19,1,'Bolívar',2,1),(279,19,1,'Cárdenas',2,1),(280,19,1,'Córdoba',2,1),(281,19,1,'Fernández Feo',2,1),(282,19,1,'Francisco de Miranda',2,1),(283,19,1,'García de Hevia',2,1),(284,19,1,'Guásimos',2,1),(285,19,1,'Independencia',2,1),(286,19,1,'Jáuregui',2,1),(287,19,1,'José María Vargas',2,1),(288,19,1,'Junín',2,1),(289,19,1,'Libertad',2,1),(290,19,1,'Libertador',2,1),(291,19,1,'Lobatera',2,1),(292,19,1,'Michelena',2,1),(293,19,1,'Panamericano',2,1),(294,19,1,'Pedro María Ureña',2,1),(295,19,1,'Rafael Urdaneta',2,1),(296,19,1,'Samuel Darío Maldonado',2,1),(297,19,1,'San Cristóbal',2,1),(298,19,1,'Seboruco',2,1),(299,19,1,'Simón Rodríguez',2,1),(300,19,1,'Sucre',2,1),(301,19,1,'Torbes',2,1),(302,19,1,'Uribante',2,1),(303,19,1,'San Judas Tadeo',2,1),(304,20,1,'Andrés Bello',2,1),(305,20,1,'Boconó',2,1),(306,20,1,'Bolívar',2,1),(307,20,1,'Candelaria',2,1),(308,20,1,'Carache',2,1),(309,20,1,'Escuque',2,1),(310,20,1,'José Felipe Márquez Cañizalez',2,1),(311,20,1,'Juan Vicente Campos Elías',2,1),(312,20,1,'La Ceiba',2,1),(313,20,1,'Miranda',2,1),(314,20,1,'Monte Carmelo',2,1),(315,20,1,'Motatán',2,1),(316,20,1,'Pampán',2,1),(317,20,1,'Pampanito',2,1),(318,20,1,'Rafael Rangel',2,1),(319,20,1,'San Rafael de Carvajal',2,1),(320,20,1,'Sucre',2,1),(321,20,1,'Trujillo',2,1),(322,20,1,'Urdaneta',2,1),(323,20,1,'Valera',2,1),(324,21,1,'Vargas',2,1),(325,22,1,'Arístides Bastidas',2,1),(326,22,1,'Bolívar',2,1),(327,22,1,'Bruzual',2,1),(328,22,1,'Cocorote',2,1),(329,22,1,'Independencia',2,1),(330,22,1,'José Antonio Páez',2,1),(331,22,1,'La Trinidad',2,1),(332,22,1,'Manuel Monge',2,1),(333,22,1,'Nirgua',2,1),(334,22,1,'Peña',2,1),(335,22,1,'San Felipe',2,1),(336,22,1,'Sucre',2,1),(337,22,1,'Urachiche',2,1),(338,22,1,'José Joaquín Veroes',2,1),(339,23,1,'Almirante Padilla',2,1),(340,23,1,'Baralt',2,1),(341,23,1,'Cabimas',2,1),(342,23,1,'Catatumbo',2,1),(343,23,1,'Colón',2,1),(344,23,1,'Francisco Javier Pulgar',2,1),(345,23,1,'Páez',2,1),(346,23,1,'Jesús Enrique Losada',2,1),(347,23,1,'Jesús María Semprún',2,1),(348,23,1,'La Cañada de Urdaneta',2,1),(349,23,1,'Lagunillas',2,1),(350,23,1,'Machiques de Perijá',2,1),(351,23,1,'Mara',2,1),(352,23,1,'Maracaibo',2,1),(353,23,1,'Miranda',2,1),(354,23,1,'Rosario de Perijá',2,1),(355,23,1,'San Francisco',2,1),(356,23,1,'Santa Rita',2,1),(357,23,1,'Simón Bolívar',2,1),(358,23,1,'Sucre',2,1),(359,23,1,'Valmore Rodríguez',2,1),(360,24,1,'Libertador',2,1),(361,26,1,'La Esmeralda',3,1),(362,26,1,'Huachamacare Acanaña',3,1),(363,26,1,'Marawaka Toky Shamanaña',3,1),(364,26,1,'Mavaka Mavaka',3,1),(365,26,1,'Sierra Parima Parimabé',3,1),(366,27,1,'Atabapo',3,1),(367,27,1,'Ucata Laja Lisa',3,1),(368,27,1,'Yapacana Macuruco',3,1),(369,27,1,'Caname Guarinuma',3,1),(370,28,1,'Fernando Girón Tovar',3,1),(371,28,1,'Luis Alberto Gómez',3,1),(372,28,1,'Pahueña Limón de Parhueña',3,1),(373,28,1,'Platanillal Platanillal',3,1),(374,29,1,'Isla Ratón',3,1),(375,29,1,'Samariapo',3,1),(376,29,1,'Sipapo',3,1),(377,29,1,'Munduapo',3,1),(378,29,1,'Guayapo',3,1),(379,30,1,'Manapiare',3,1),(380,30,1,'Alto Ventuari',3,1),(381,30,1,'Medio Ventuari',3,1),(382,30,1,'Bajo Ventuari',3,1),(383,31,1,'Victorino',3,1),(384,31,1,'Comunidad',3,1),(385,31,1,'Maroa',3,1),(386,32,1,'Casiquiare',3,1),(387,32,1,'Cocuy',3,1),(388,32,1,'San Carlos de Río Negro',3,1),(389,32,1,'Solano',3,1),(390,33,1,'Anaco',3,1),(391,33,1,'San Joaquín',3,1),(392,33,1,'Buenas Vista',3,1),(393,34,1,'Cachipo',3,1),(394,34,1,'Aragua de Barcelona',3,1),(395,35,1,'Clarines',3,1),(396,35,1,'Guanape',3,1),(397,35,1,'Sabana de Uchire',3,1),(398,36,1,'Lechería',3,1),(399,36,1,'El Morro',3,1),(400,37,1,'Puerto Píritu',3,1),(401,37,1,'San Miguel',3,1),(402,37,1,'Sucre',3,1),(403,38,1,'Valle de Guanape',3,1),(404,38,1,'Santa Bárbara',3,1),(405,39,1,'El Chaparro',3,1),(406,39,1,'Tomás Alfaro',3,1),(407,40,1,'Guanta',3,1),(408,40,1,'Chorrerón',3,1),(409,41,1,'Mamo',3,1),(410,41,1,'Soledad',3,1),(411,42,1,'Mapire',3,1),(412,42,1,'Piar',3,1),(413,42,1,'Santa Clara',3,1),(414,42,1,'San Diego de Cabrutica',3,1),(415,42,1,'Uverito',3,1),(416,42,1,'Zuata',3,1),(417,43,1,'Puerto La Cruz',3,1),(418,43,1,'Pozuelos',3,1),(419,44,1,'Onoto',3,1),(420,44,1,'San Pablo',3,1),(421,45,1,'San Mateo',3,1),(422,45,1,'El Carito',3,1),(423,45,1,'Santa Inés',3,1),(424,46,1,'Atapirire',3,1),(425,46,1,'Boca del Pao',3,1),(426,46,1,'El Pao',3,1),(427,46,1,'Pariaguán',3,1),(428,47,1,'Cantaura',3,1),(429,47,1,'Libertador',3,1),(430,47,1,'Santa Rosa',3,1),(431,47,1,'Urica',3,1),(432,48,1,'Píritu',3,1),(433,48,1,'San Francisco',3,1),(434,49,1,'San José de Guanipa',3,1),(435,50,1,'Boca de Uchire',3,1),(436,50,1,'Boca de Chávez',3,1),(437,51,1,'Pueblo Nuevo',3,1),(438,51,1,'Santa Ana',3,1),(439,52,1,'Bergantín',3,1),(440,52,1,'Caigua',3,1),(441,52,1,'El Carmen',3,1),(442,52,1,'El Pilar',3,1),(443,52,1,'Naricual',3,1),(444,52,1,'San Cristóbal',3,1),(445,53,1,'Edmundo Barrios',3,1),(446,53,1,'Miguel Otero Silva',3,1),(447,54,1,'Achaguas',3,1),(448,54,1,'Apurito',3,1),(449,54,1,'El Yagual',3,1),(450,54,1,'Guachara',3,1),(451,54,1,'Mucuritas',3,1),(452,54,1,'Queseras del medio',3,1),(453,55,1,'Biruaca',3,1),(454,56,1,'Bruzual',3,1),(455,56,1,'Mantecal',3,1),(456,56,1,'Quintero',3,1),(457,56,1,'Rincón Hondo',3,1),(458,56,1,'San Vicente',3,1),(459,57,1,'Guasdualito',3,1),(460,57,1,'Aramendi',3,1),(461,57,1,'El Amparo',3,1),(462,57,1,'San Camilo',3,1),(463,57,1,'Urdaneta',3,1),(464,58,1,'San Juan de Payara',3,1),(465,58,1,'Codazzi',3,1),(466,58,1,'Cunaviche',3,1),(467,59,1,'Elorza',3,1),(468,59,1,'La Trinidad',3,1),(469,60,1,'San Fernando',3,1),(470,60,1,'El Recreo',3,1),(471,60,1,'Peñalver',3,1),(472,60,1,'San Rafael de Atamaica',3,1),(473,61,1,'Pedro José Ovalles',3,1),(474,61,1,'Joaquín Crespo',3,1),(475,61,1,'José Casanova Godoy',3,1),(476,61,1,'Madre María de San José',3,1),(477,61,1,'Andrés Eloy Blanco',3,1),(478,61,1,'Los Tacarigua',3,1),(479,61,1,'Las Delicias',3,1),(480,61,1,'Choroní',3,1),(481,62,1,'San Mateo',3,1),(482,63,1,'Camatagua',3,1),(483,63,1,'Carmen de Cura',3,1),(484,64,1,'Santa Rita',3,1),(485,64,1,'Francisco de Miranda',3,1),(486,64,1,'Moseñor Feliciano González',3,1),(487,65,1,'Santa Cruz',3,1),(488,66,1,'Juan Vicente Bolívar y Ponte',3,1),(489,66,1,'Castor Nieves Ríos',3,1),(490,66,1,'Las Guacamayas',3,1),(491,66,1,'Pao de Zárate',3,1),(492,66,1,'Zuata',3,1),(493,67,1,'José Rafael Revenga',3,1),(494,68,1,'Palo Negro',3,1),(495,68,1,'San Martín de Porres',3,1),(496,69,1,'El Limón',3,1),(497,69,1,'Caña de Azúcar',3,1),(498,70,1,'Ocumare de la Costa',3,1),(499,71,1,'San Casimiro',3,1),(500,71,1,'Güiripa',3,1),(501,71,1,'Ollas de Caramacate',3,1),(502,71,1,'Valle Morín',3,1),(503,72,1,'San Sebastían',3,1),(504,73,1,'Turmero',3,1),(505,73,1,'Arevalo Aponte',3,1),(506,73,1,'Chuao',3,1),(507,73,1,'Samán de Güere',3,1),(508,73,1,'Alfredo Pacheco Miranda',3,1),(509,74,1,'Santos Michelena',3,1),(510,74,1,'Tiara',3,1),(511,75,1,'Cagua',3,1),(512,75,1,'Bella Vista',3,1),(513,76,1,'Tovar',3,1),(514,77,1,'Urdaneta',3,1),(515,77,1,'Las Peñitas',3,1),(516,77,1,'San Francisco de Cara',3,1),(517,77,1,'Taguay',3,1),(518,78,1,'Villa de Cura',3,1),(519,78,1,'Magdaleno',3,1),(520,78,1,'San Francisco de Asís',3,1),(521,78,1,'Valles de Tucutunemo',3,1),(522,78,1,'Augusto Mijares',3,1),(523,79,1,'Sabaneta',3,1),(524,79,1,'Juan Antonio Rodríguez Domínguez',3,1),(525,80,1,'El Cantón',3,1),(526,80,1,'Santa Cruz de Guacas',3,1),(527,80,1,'Puerto Vivas',3,1),(528,81,1,'Ticoporo',3,1),(529,81,1,'Nicolás Pulido',3,1),(530,81,1,'Andrés Bello',3,1),(531,82,1,'Arismendi',3,1),(532,82,1,'Guadarrama',3,1),(533,82,1,'La Unión',3,1),(534,82,1,'San Antonio',3,1),(535,83,1,'Barinas',3,1),(536,83,1,'Alberto Arvelo Larriva',3,1),(537,83,1,'San Silvestre',3,1),(538,83,1,'Santa Inés',3,1),(539,83,1,'Santa Lucía',3,1),(540,83,1,'Torumos',3,1),(541,83,1,'El Carmen',3,1),(542,83,1,'Rómulo Betancourt',3,1),(543,83,1,'Corazón de Jesús',3,1),(544,83,1,'Ramón Ignacio Méndez',3,1),(545,83,1,'Alto Barinas',3,1),(546,83,1,'Manuel Palacio Fajardo',3,1),(547,83,1,'Juan Antonio Rodríguez Domínguez',3,1),(548,83,1,'Dominga Ortiz de Páez',3,1),(549,84,1,'Barinitas',3,1),(550,84,1,'Altamira de Cáceres',3,1),(551,84,1,'Calderas',3,1),(552,85,1,'Barrancas',3,1),(553,85,1,'El Socorro',3,1),(554,85,1,'Mazparrito',3,1),(555,86,1,'Santa Bárbara',3,1),(556,86,1,'Pedro Briceño Méndez',3,1),(557,86,1,'Ramón Ignacio Méndez',3,1),(558,86,1,'José Ignacio del Pumar',3,1),(559,87,1,'Obispos',3,1),(560,87,1,'Guasimitos',3,1),(561,87,1,'El Real',3,1),(562,87,1,'La Luz',3,1),(563,88,1,'Ciudad Bolívia',3,1),(564,88,1,'José Ignacio Briceño',3,1),(565,88,1,'José Félix Ribas',3,1),(566,88,1,'Páez',3,1),(567,89,1,'Libertad',3,1),(568,89,1,'Dolores',3,1),(569,89,1,'Santa Rosa',3,1),(570,89,1,'Palacio Fajardo',3,1),(571,89,1,'Simón Rodríguez',3,1),(572,90,1,'Ciudad de Nutrias',3,1),(573,90,1,'El Regalo',3,1),(574,90,1,'Puerto Nutrias',3,1),(575,90,1,'Santa Catalina',3,1),(576,91,1,'Cachamay',3,1),(577,91,1,'Chirica',3,1),(578,91,1,'Dalla Costa',3,1),(579,91,1,'Once de Abril',3,1),(580,91,1,'Simón Bolívar',3,1),(581,91,1,'Unare',3,1),(582,91,1,'Universidad',3,1),(583,91,1,'Vista al Sol',3,1),(584,91,1,'Pozo Verde',3,1),(585,91,1,'Yocoima',3,1),(586,91,1,'5 de Julio',3,1),(587,92,1,'Cedeño',3,1),(588,92,1,'Altagracia',3,1),(589,92,1,'Ascensión Farreras',3,1),(590,92,1,'Guaniamo',3,1),(591,92,1,'La Urbana',3,1),(592,92,1,'Pijiguaos',3,1),(593,93,1,'El Callao',3,1),(594,94,1,'Gran Sabana',3,1),(595,94,1,'Ikabarú',3,1),(596,95,1,'Catedral',3,1),(597,95,1,'Zea',3,1),(598,95,1,'Orinoco',3,1),(599,95,1,'José Antonio Páez',3,1),(600,95,1,'Marhuanta',3,1),(601,95,1,'Agua Salada',3,1),(602,95,1,'Vista Hermosa',3,1),(603,95,1,'La Sabanita',3,1),(604,95,1,'Panapana',3,1),(605,96,1,'Upata',3,1),(606,96,1,'Andrés Eloy Blanco',3,1),(607,96,1,'Pedro Cova',3,1),(608,97,1,'Raúl Leoni',3,1),(609,97,1,'Barceloneta',3,1),(610,97,1,'Santa Bárbara',3,1),(611,97,1,'San Francisco',3,1),(612,98,1,'Guasipati',3,1),(613,98,1,'Salom',3,1),(614,99,1,'Tumeremo',3,1),(615,99,1,'Dalla Costa',3,1),(616,99,1,'San Isidro',3,1),(617,100,1,'Sucre',3,1),(618,100,1,'Aripao',3,1),(619,100,1,'Guarataro',3,1),(620,100,1,'Las Majadas',3,1),(621,100,1,'Moitaco',3,1),(622,101,1,'Padre Pedro Chien',3,1),(623,102,1,'Bejuma',3,1),(624,102,1,'Canoabo',3,1),(625,102,1,'Simón Bolívar',3,1),(626,103,1,'Güigüe',3,1),(627,103,1,'Carabobo',3,1),(628,103,1,'Tacarigua',3,1),(629,104,1,'Mariara',3,1),(630,104,1,'Aguas Calientes',3,1),(631,105,1,'Ciudad Alianza',3,1),(632,105,1,'Guacara',3,1),(633,105,1,'Yagua',3,1),(634,106,1,'Morón',3,1),(635,106,1,'Yagua',3,1),(636,107,1,'Tocuyito',3,1),(637,107,1,'Independencia',3,1),(638,108,1,'Los Guayos',3,1),(639,109,1,'Miranda',3,1),(640,110,1,'Montalbán',3,1),(641,111,1,'Naguanagua',3,1),(642,112,1,'Bartolomé Salóm',3,1),(643,112,1,'Democracia',3,1),(644,112,1,'Fraternidad',3,1),(645,112,1,'Goaigoaza',3,1),(646,112,1,'Juan José Flores',3,1),(647,112,1,'Unión',3,1),(648,112,1,'Borburata',3,1),(649,112,1,'Patanemo',3,1),(650,113,1,'San Diego',3,1),(651,114,1,'San Joaquín',3,1),(652,115,1,'Candelaria',3,1),(653,115,1,'Catedral',3,1),(654,115,1,'El Socorro',3,1),(655,115,1,'Miguel Peña',3,1),(656,115,1,'Rafael Urdaneta',3,1),(657,115,1,'San Blas',3,1),(658,115,1,'San José',3,1),(659,115,1,'Santa Rosa',3,1),(660,116,1,'Cojedes',3,1),(661,116,1,'Juan de Mata Suárez',3,1),(662,117,1,'Tinaquillo',3,1),(663,118,1,'El Baúl',3,1),(664,118,1,'Sucre',3,1),(665,119,1,'La Aguadita',3,1),(666,119,1,'Macapo',3,1),(667,120,1,'El Pao',3,1),(668,121,1,'El Amparo',3,1),(669,121,1,'Libertad de Cojedes',3,1),(670,122,1,'Rómulo Gallegos',3,1),(671,123,1,'San Carlos de Austria',3,1),(672,123,1,'Juan Ángel Bravo',3,1),(673,123,1,'Manuel Manrique',3,1),(674,124,1,'General en Jefe José Laurencio Silva',3,1),(675,125,1,'Curiapo',3,1),(676,125,1,'Almirante Luis Brión',3,1),(677,125,1,'Francisco Aniceto Lugo',3,1),(678,125,1,'Manuel Renaud',3,1),(679,125,1,'Padre Barral',3,1),(680,125,1,'Santos de Abelgas',3,1),(681,126,1,'Imataca',3,1),(682,126,1,'Cinco de Julio',3,1),(683,126,1,'Juan Bautista Arismendi',3,1),(684,126,1,'Manuel Piar',3,1),(685,126,1,'Rómulo Gallegos',3,1),(686,127,1,'Pedernales',3,1),(687,127,1,'Luis Beltrán Prieto Figueroa',3,1),(688,128,1,'San José (Delta Amacuro)',3,1),(689,128,1,'José Vidal Marcano',3,1),(690,128,1,'Juan Millán',3,1),(691,128,1,'Leonardo Ruíz Pineda',3,1),(692,128,1,'Mariscal Antonio José de Sucre',3,1),(693,128,1,'Monseñor Argimiro García',3,1),(694,128,1,'San Rafael (Delta Amacuro)',3,1),(695,128,1,'Virgen del Valle',3,1),(696,129,1,'Capadare',3,1),(697,129,1,'La Pastora',3,1),(698,129,1,'Libertador',3,1),(699,129,1,'San Juan de los Cayos',3,1),(700,130,1,'Aracua',3,1),(701,130,1,'La Peña',3,1),(702,130,1,'San Luis',3,1),(703,131,1,'Bariro',3,1),(704,131,1,'Borojó',3,1),(705,131,1,'Capatárida',3,1),(706,131,1,'Guajiro',3,1),(707,131,1,'Seque',3,1),(708,131,1,'Zazárida',3,1),(709,131,1,'Valle de Eroa',3,1),(710,132,1,'Cacique Manaure',3,1),(711,133,1,'Norte',3,1),(712,133,1,'Carirubana',3,1),(713,133,1,'Santa Ana',3,1),(714,133,1,'Urbana Punta Cardón',3,1),(715,134,1,'La Vela de Coro',3,1),(716,134,1,'Acurigua',3,1),(717,134,1,'Guaibacoa',3,1),(718,134,1,'Las Calderas',3,1),(719,134,1,'Macoruca',3,1),(720,135,1,'Dabajuro',3,1),(721,136,1,'Agua Clara',3,1),(722,136,1,'Avaria',3,1),(723,136,1,'Pedregal',3,1),(724,136,1,'Piedra Grande',3,1),(725,136,1,'Purureche',3,1),(726,137,1,'Adaure',3,1),(727,137,1,'Adícora',3,1),(728,137,1,'Baraived',3,1),(729,137,1,'Buena Vista',3,1),(730,137,1,'Jadacaquiva',3,1),(731,137,1,'El Vínculo',3,1),(732,137,1,'El Hato',3,1),(733,137,1,'Moruy',3,1),(734,138,1,'Churuguara',3,1),(735,138,1,'Agua Larga',3,1),(736,138,1,'El Paují',3,1),(737,138,1,'Independencia',3,1),(738,138,1,'Mapararí',3,1),(739,139,1,'Agua Linda',3,1),(740,139,1,'Araurima',3,1),(741,139,1,'Jacura',3,1),(742,140,1,'Tucacas',3,1),(743,140,1,'Boca de Aroa',3,1),(744,141,1,'Los Taques',3,1),(745,141,1,'Judibana',3,1),(746,142,1,'Mene de Mauroa',3,1),(747,142,1,'San Félix',3,1),(748,142,1,'Casigua',3,1),(749,143,1,'Guzmán Guillermo',3,1),(750,143,1,'Mitare',3,1),(751,143,1,'Río Seco',3,1),(752,143,1,'Sabaneta',3,1),(753,143,1,'San Antonio',3,1),(754,143,1,'San Gabriel',3,1),(755,143,1,'Santa Ana',3,1),(756,144,1,'Boca del Tocuyo',3,1),(757,144,1,'Chichiriviche',3,1),(758,144,1,'Tocuyo de la Costa',3,1),(759,145,1,'Palmasola',3,1),(760,146,1,'Cabure',3,1),(761,146,1,'Colina',3,1),(762,146,1,'Curimagua',3,1),(763,147,1,'San José de la Costa',3,1),(764,147,1,'Píritu',3,1),(765,148,1,'San Francisco',3,1),(766,149,1,'Sucre',3,1),(767,149,1,'Pecaya',3,1),(768,150,1,'Tocópero',3,1),(769,151,1,'El Charal',3,1),(770,151,1,'Las Vegas del Tuy',3,1),(771,151,1,'Santa Cruz de Bucaral',3,1),(772,152,1,'Bruzual',3,1),(773,152,1,'Urumaco',3,1),(774,153,1,'Puerto Cumarebo',3,1),(775,153,1,'La Ciénaga',3,1),(776,153,1,'La Soledad',3,1),(777,153,1,'Pueblo Cumarebo',3,1),(778,153,1,'Zazárida',3,1),(779,154,1,'Camaguán',3,1),(780,154,1,'Puerto Miranda',3,1),(781,154,1,'Uverito',3,1),(782,155,1,'Chaguaramas',3,1),(783,156,1,'El Socorro',3,1),(784,157,1,'Tucupido',3,1),(785,157,1,'San Rafael de Laya',3,1),(786,158,1,'Altagracia de Orituco',3,1),(787,158,1,'San Rafael de Orituco',3,1),(788,158,1,'San Francisco Javier de Lezama',3,1),(789,158,1,'Paso Real de Macaira',3,1),(790,158,1,'Carlos Soublette',3,1),(791,158,1,'San Francisco de Macaira',3,1),(792,158,1,'Libertad de Orituco',3,1),(793,159,1,'Cantaclaro',3,1),(794,159,1,'San Juan de los Morros',3,1),(795,159,1,'Parapara',3,1),(796,160,1,'El Sombrero',3,1),(797,160,1,'Sosa',3,1),(798,161,1,'Las Mercedes',3,1),(799,161,1,'Cabruta',3,1),(800,161,1,'Santa Rita de Manapire',3,1),(801,162,1,'Valle de la Pascua',3,1),(802,162,1,'Espino',3,1),(803,162,1,'Parmana',3,1),(804,163,1,'San José de Unare',3,1),(805,163,1,'Zaraza',3,1),(806,164,1,'San José de Tiznados',3,1),(807,164,1,'San Francisco de Tiznados',3,1),(808,164,1,'San Lorenzo de Tiznados',3,1),(809,164,1,'Ortiz',3,1),(810,165,1,'Guayabal',3,1),(811,165,1,'Cazorla',3,1),(812,166,1,'San José de Guaribe',3,1),(813,167,1,'Santa María de Ipire',3,1),(814,167,1,'Altamira',3,1),(815,168,1,'El Calvario',3,1),(816,168,1,'El Rastro',3,1),(817,168,1,'Guardatinajas',3,1),(818,168,1,'Capital Urbana Calabozo',3,1),(819,169,1,'Quebrada Honda de Guache',3,1),(820,169,1,'Pío Tamayo',3,1),(821,169,1,'Yacambú',3,1),(822,170,1,'Fréitez',3,1),(823,170,1,'José María Blanco',3,1),(824,171,1,'Catedral',3,1),(825,171,1,'Concepción',3,1),(826,171,1,'El Cují',3,1),(827,171,1,'Juan de Villegas',3,1),(828,171,1,'Santa Rosa',3,1),(829,171,1,'Tamaca',3,1),(830,171,1,'Unión',3,1),(831,171,1,'Aguedo Felipe Alvarado',3,1),(832,171,1,'Buena Vista',3,1),(833,171,1,'Juárez',3,1),(834,172,1,'Juan Bautista Rodríguez',3,1),(835,172,1,'Cuara',3,1),(836,172,1,'Diego de Lozada',3,1),(837,172,1,'Paraíso de San José',3,1),(838,172,1,'San Miguel',3,1),(839,172,1,'Tintorero',3,1),(840,172,1,'José Bernardo Dorante',3,1),(841,172,1,'Coronel Mariano Peraza ',3,1),(842,173,1,'Bolívar',3,1),(843,173,1,'Anzoátegui',3,1),(844,173,1,'Guarico',3,1),(845,173,1,'Hilario Luna y Luna',3,1),(846,173,1,'Humocaro Alto',3,1),(847,173,1,'Humocaro Bajo',3,1),(848,173,1,'La Candelaria',3,1),(849,173,1,'Morán',3,1),(850,174,1,'Cabudare',3,1),(851,174,1,'José Gregorio Bastidas',3,1),(852,174,1,'Agua Viva',3,1),(853,175,1,'Sarare',3,1),(854,175,1,'Buría',3,1),(855,175,1,'Gustavo Vegas León',3,1),(856,176,1,'Trinidad Samuel',3,1),(857,176,1,'Antonio Díaz',3,1),(858,176,1,'Camacaro',3,1),(859,176,1,'Castañeda',3,1),(860,176,1,'Cecilio Zubillaga',3,1),(861,176,1,'Chiquinquirá',3,1),(862,176,1,'El Blanco',3,1),(863,176,1,'Espinoza de los Monteros',3,1),(864,176,1,'Lara',3,1),(865,176,1,'Las Mercedes',3,1),(866,176,1,'Manuel Morillo',3,1),(867,176,1,'Montaña Verde',3,1),(868,176,1,'Montes de Oca',3,1),(869,176,1,'Torres',3,1),(870,176,1,'Heriberto Arroyo',3,1),(871,176,1,'Reyes Vargas',3,1),(872,176,1,'Altagracia',3,1),(873,177,1,'Siquisique',3,1),(874,177,1,'Moroturo',3,1),(875,177,1,'San Miguel',3,1),(876,177,1,'Xaguas',3,1),(877,178,1,'Presidente Betancourt',3,1),(878,178,1,'Presidente Páez',3,1),(879,178,1,'Presidente Rómulo Gallegos',3,1),(880,178,1,'Gabriel Picón González',3,1),(881,178,1,'Héctor Amable Mora',3,1),(882,178,1,'José Nucete Sardi',3,1),(883,178,1,'Pulido Méndez',3,1),(884,179,1,'La Azulita',3,1),(885,180,1,'Santa Cruz de Mora',3,1),(886,180,1,'Mesa Bolívar',3,1),(887,180,1,'Mesa de Las Palmas',3,1),(888,181,1,'Aricagua',3,1),(889,181,1,'San Antonio',3,1),(890,182,1,'Canagua',3,1),(891,182,1,'Capurí',3,1),(892,182,1,'Chacantá',3,1),(893,182,1,'El Molino',3,1),(894,182,1,'Guaimaral',3,1),(895,182,1,'Mucutuy',3,1),(896,182,1,'Mucuchachí',3,1),(897,183,1,'Fernández Peña',3,1),(898,183,1,'Matriz',3,1),(899,183,1,'Montalbán',3,1),(900,183,1,'Acequias',3,1),(901,183,1,'Jají',3,1),(902,183,1,'La Mesa',3,1),(903,183,1,'San José del Sur',3,1),(904,184,1,'Tucaní',3,1),(905,184,1,'Florencio Ramírez',3,1),(906,185,1,'Santo Domingo',3,1),(907,185,1,'Las Piedras',3,1),(908,186,1,'Guaraque',3,1),(909,186,1,'Mesa de Quintero',3,1),(910,186,1,'Río Negro',3,1),(911,187,1,'Arapuey',3,1),(912,187,1,'Palmira',3,1),(913,188,1,'San Cristóbal de Torondoy',3,1),(914,188,1,'Torondoy',3,1),(915,189,1,'Antonio Spinetti Dini',3,1),(916,189,1,'Arias',3,1),(917,189,1,'Caracciolo Parra Pérez',3,1),(918,189,1,'Domingo Peña',3,1),(919,189,1,'El Llano',3,1),(920,189,1,'Gonzalo Picón Febres',3,1),(921,189,1,'Jacinto Plaza',3,1),(922,189,1,'Juan Rodríguez Suárez',3,1),(923,189,1,'Lasso de la Vega',3,1),(924,189,1,'Mariano Picón Salas',3,1),(925,189,1,'Milla',3,1),(926,189,1,'Osuna Rodríguez',3,1),(927,189,1,'Sagrario',3,1),(928,189,1,'El Morro',3,1),(929,189,1,'Los Nevados',3,1),(930,190,1,'Andrés Eloy Blanco',3,1),(931,190,1,'La Venta',3,1),(932,190,1,'Piñango',3,1),(933,190,1,'Timotes',3,1),(934,191,1,'Eloy Paredes',3,1),(935,191,1,'San Rafael de Alcázar',3,1),(936,191,1,'Santa Elena de Arenales',3,1),(937,192,1,'Padre Noguer',3,1),(938,193,1,'Pueblo Llano',3,1),(939,194,1,'Cacute',3,1),(940,194,1,'La Toma',3,1),(941,194,1,'Mucuchíes',3,1),(942,194,1,'Mucurubá',3,1),(943,194,1,'San Rafael',3,1),(944,195,1,'Gerónimo Maldonado',3,1),(945,195,1,'Bailadores',3,1),(946,196,1,'Tabay',3,1),(947,197,1,'Chiguará',3,1),(948,197,1,'Estánquez',3,1),(949,197,1,'Lagunillas',3,1),(950,197,1,'La Trampa',3,1),(951,197,1,'Pueblo Nuevo del Sur',3,1),(952,197,1,'San Juan',3,1),(953,198,1,'El Amparo',3,1),(954,198,1,'El Llano',3,1),(955,198,1,'San Francisco',3,1),(956,198,1,'Tovar',3,1),(957,199,1,'Independencia',3,1),(958,199,1,'María de la Concepción Palacios Blanco',3,1),(959,199,1,'Nueva Bolivia',3,1),(960,199,1,'Santa Apolonia',3,1),(961,200,1,'Caño El Tigre',3,1),(962,200,1,'Zea',3,1),(963,201,1,'Aragüita',3,1),(964,201,1,'Arévalo González',3,1),(965,201,1,'Capaya',3,1),(966,201,1,'Caucagua',3,1),(967,201,1,'Panaquire',3,1),(968,201,1,'Ribas',3,1),(969,201,1,'El Café',3,1),(970,201,1,'Marizapa',3,1),(971,202,1,'Cumbo',3,1),(972,202,1,'San José de Barlovento',3,1),(973,203,1,'El Cafetal',3,1),(974,203,1,'Las Minas',3,1),(975,203,1,'Nuestra Señora del Rosario',3,1),(976,204,1,'Higuerote',3,1),(977,204,1,'Curiepe',3,1),(978,204,1,'Tacarigua de Brión',3,1),(979,205,1,'Mamporal',3,1),(980,206,1,'Carrizal',3,1),(981,207,1,'Chacao',3,1),(982,208,1,'Charallave',3,1),(983,208,1,'Las Brisas',3,1),(984,209,1,'El Hatillo',3,1),(985,210,1,'Altagracia de la Montaña',3,1),(986,210,1,'Cecilio Acosta',3,1),(987,210,1,'Los Teques',3,1),(988,210,1,'El Jarillo',3,1),(989,210,1,'San Pedro',3,1),(990,210,1,'Tácata',3,1),(991,210,1,'Paracotos',3,1),(992,211,1,'Cartanal',3,1),(993,211,1,'Santa Teresa del Tuy',3,1),(994,212,1,'La Democracia',3,1),(995,212,1,'Ocumare del Tuy',3,1),(996,212,1,'Santa Bárbara',3,1),(997,213,1,'San Antonio de los Altos',3,1),(998,214,1,'Río Chico',3,1),(999,214,1,'El Guapo',3,1),(1000,214,1,'Tacarigua de la Laguna',3,1),(1001,214,1,'Paparo',3,1),(1002,214,1,'San Fernando del Guapo',3,1),(1003,215,1,'Santa Lucía del Tuy',3,1),(1004,216,1,'Cúpira',3,1),(1005,216,1,'Machurucuto',3,1),(1006,217,1,'Guarenas',3,1),(1007,218,1,'San Antonio de Yare',3,1),(1008,218,1,'San Francisco de Yare',3,1),(1009,219,1,'Leoncio Martínez',3,1),(1010,219,1,'Petare',3,1),(1011,219,1,'Caucagüita',3,1),(1012,219,1,'Filas de Mariche',3,1),(1013,219,1,'La Dolorita',3,1),(1014,220,1,'Cúa',3,1),(1015,220,1,'Nueva Cúa',3,1),(1016,221,1,'Guatire',3,1),(1017,221,1,'Bolívar',3,1),(1018,222,1,'San Antonio de Maturín',3,1),(1019,222,1,'San Francisco de Maturín',3,1),(1020,223,1,'Aguasay',3,1),(1021,224,1,'Caripito',3,1),(1022,225,1,'El Guácharo',3,1),(1023,225,1,'La Guanota',3,1),(1024,225,1,'Sabana de Piedra',3,1),(1025,225,1,'San Agustín',3,1),(1026,225,1,'Teresen',3,1),(1027,225,1,'Caripe',3,1),(1028,226,1,'Areo',3,1),(1029,226,1,'Capital Cedeño',3,1),(1030,226,1,'San Félix de Cantalicio',3,1),(1031,226,1,'Viento Fresco',3,1),(1032,227,1,'El Tejero',3,1),(1033,227,1,'Punta de Mata',3,1),(1034,228,1,'Chaguaramas',3,1),(1035,228,1,'Las Alhuacas',3,1),(1036,228,1,'Tabasca',3,1),(1037,228,1,'Temblador',3,1),(1038,229,1,'Alto de los Godos',3,1),(1039,229,1,'Boquerón',3,1),(1040,229,1,'Las Cocuizas',3,1),(1041,229,1,'La Cruz',3,1),(1042,229,1,'San Simón',3,1),(1043,229,1,'El Corozo',3,1),(1044,229,1,'El Furrial',3,1),(1045,229,1,'Jusepín',3,1),(1046,229,1,'La Pica',3,1),(1047,229,1,'San Vicente',3,1),(1048,229,1,'Maturín',3,1),(1049,230,1,'Aparicio',3,1),(1050,230,1,'Aragua de Maturín',3,1),(1051,230,1,'Chaguamal',3,1),(1052,230,1,'El Pinto',3,1),(1053,230,1,'Guanaguana',3,1),(1054,230,1,'La Toscana',3,1),(1055,230,1,'Taguaya',3,1),(1056,231,1,'Cachipo',3,1),(1057,231,1,'Quiriquire',3,1),(1058,232,1,'Santa Bárbara',3,1),(1059,232,1,'Morón',3,1),(1060,233,1,'Barrancas',3,1),(1061,233,1,'Los Barrancos de Fajardo',3,1),(1062,234,1,'Uracoa',3,1),(1063,235,1,'Antolín del Campo',3,1),(1064,236,1,'La Asunción',3,1),(1065,237,1,'García',3,1),(1066,237,1,'Francisco Fajardo',3,1),(1067,238,1,'Bolívar',3,1),(1068,238,1,'Guevara',3,1),(1069,238,1,'Matasiete',3,1),(1070,238,1,'Santa Ana',3,1),(1071,238,1,'Sucre',3,1),(1072,239,1,'Aguirre',3,1),(1073,239,1,'Maneiro',3,1),(1074,240,1,'Adrián',3,1),(1075,240,1,'Juan Griego',3,1),(1076,241,1,'Porlamar',3,1),(1077,242,1,'San Francisco de Macanao',3,1),(1078,242,1,'Boca de Río',3,1),(1079,243,1,'Tubores',3,1),(1080,243,1,'Los Baleales',3,1),(1081,244,1,'Vicente Fuentes',3,1),(1082,244,1,'San Pedro de Coche',3,1),(1083,245,1,'San Juan Bautista',3,1),(1084,245,1,'Zabala',3,1),(1085,246,1,'Agua Blanca',3,1),(1086,247,1,'Capital Araure',3,1),(1087,247,1,'Río Acarigua',3,1),(1088,248,1,'Píritu',3,1),(1089,248,1,'Uveral',3,1),(1090,249,1,'Guanare',3,1),(1091,249,1,'Córdoba',3,1),(1092,249,1,'San José de la Montaña',3,1),(1093,249,1,'San Juan de Guanaguanare',3,1),(1094,249,1,'Virgen de la Coromoto',3,1),(1095,250,1,'Guanarito',3,1),(1096,250,1,'Trinidad de la Capilla',3,1),(1097,250,1,'Divina Pastora',3,1),(1098,251,1,'Chabasquén',3,1),(1099,251,1,'Peña Blanca',3,1),(1100,252,1,'Capital Ospino',3,1),(1101,252,1,'Aparición',3,1),(1102,252,1,'La Estación',3,1),(1103,253,1,'Páez',3,1),(1104,253,1,'Payara',3,1),(1105,253,1,'Pimpinela',3,1),(1106,253,1,'Ramón Peraza',3,1),(1107,254,1,'Papelón',3,1),(1108,254,1,'Caño Delgadito',3,1),(1109,255,1,'San Genaro de Boconoito',3,1),(1110,255,1,'Antolín Tovar',3,1),(1111,256,1,'San Rafael de Onoto',3,1),(1112,256,1,'Santa Fe',3,1),(1113,256,1,'Thermo Morles',3,1),(1114,257,1,'El Playón',3,1),(1115,257,1,'Florida',3,1),(1116,258,1,'Sucre',3,1),(1117,258,1,'Concepción',3,1),(1118,258,1,'San Rafael de Palo Alzado',3,1),(1119,258,1,'Uvencio Antonio Velásquez',3,1),(1120,258,1,'San José de Saguaz',3,1),(1121,258,1,'Villa Rosa',3,1),(1122,259,1,'Turén',3,1),(1123,259,1,'Canelones',3,1),(1124,259,1,'Santa Cruz',3,1),(1125,259,1,'San Isidro Labrador',3,1),(1126,260,1,'Mariño',3,1),(1127,260,1,'Rómulo Gallegos',3,1),(1128,261,1,'San José de Aerocuar',3,1),(1129,261,1,'Tavera Acosta',3,1),(1130,262,1,'Río Caribe',3,1),(1131,262,1,'Antonio José de Sucre',3,1),(1132,262,1,'El Morro de Puerto Santo',3,1),(1133,262,1,'Puerto Santo',3,1),(1134,262,1,'San Juan de las Galdonas',3,1),(1135,263,1,'El Pilar',3,1),(1136,263,1,'El Rincón',3,1),(1137,263,1,'General Francisco Antonio Váquez',3,1),(1138,263,1,'Guaraúnos',3,1),(1139,263,1,'Tunapuicito',3,1),(1140,263,1,'Unión',3,1),(1141,264,1,'Santa Catalina',3,1),(1142,264,1,'Santa Rosa',3,1),(1143,264,1,'Santa Teresa',3,1),(1144,264,1,'Bolívar',3,1),(1145,264,1,'Maracapana',3,1),(1146,265,1,'Marigüitar',3,1),(1147,266,1,'Libertad',3,1),(1148,266,1,'El Paujil',3,1),(1149,266,1,'Yaguaraparo',3,1),(1150,267,1,'Araya',3,1),(1151,267,1,'Chacopata',3,1),(1152,267,1,'Manicuare',3,1),(1153,268,1,'Tunapuy',3,1),(1154,268,1,'Campo Elías',3,1),(1155,269,1,'Irapa',3,1),(1156,269,1,'Campo Claro',3,1),(1157,269,1,'Maraval',3,1),(1158,269,1,'San Antonio de Irapa',3,1),(1159,269,1,'Soro',3,1),(1160,270,1,'San Antonio del Golfo',3,1),(1161,271,1,'Cumanacoa',3,1),(1162,271,1,'Arenas',3,1),(1163,271,1,'Aricagua',3,1),(1164,271,1,'Cogollar',3,1),(1165,271,1,'San Fernando',3,1),(1166,271,1,'San Lorenzo',3,1),(1167,272,1,'Villa Frontado (Muelle de Cariaco)',3,1),(1168,272,1,'Catuaro',3,1),(1169,272,1,'Rendón',3,1),(1170,272,1,'San Cruz',3,1),(1171,272,1,'Santa María',3,1),(1172,273,1,'Altagracia',3,1),(1173,273,1,'Santa Inés',3,1),(1174,273,1,'Valentín Valiente',3,1),(1175,273,1,'Ayacucho',3,1),(1176,273,1,'San Juan',3,1),(1177,273,1,'Raúl Leoni',3,1),(1178,273,1,'Gran Mariscal',3,1),(1179,274,1,'Cristóbal Colón',3,1),(1180,274,1,'Bideau',3,1),(1181,274,1,'Punta de Piedras',3,1),(1182,274,1,'Güiria',3,1),(1183,275,1,'San Juan de Colón',3,1),(1184,276,1,'Antonio Rómulo Costa',3,1),(1185,277,1,'Ayacucho',3,1),(1186,277,1,'Rivas Berti',3,1),(1187,277,1,'San Pedro del Río',3,1),(1188,278,1,'Bolívar',3,1),(1189,278,1,'Palotal',3,1),(1190,278,1,'General Juan Vicente Gómez',3,1),(1191,278,1,'Isaías Medina Angarita',3,1),(1192,279,1,'Táriba',3,1),(1193,279,1,'Amenodoro Ángel Lamus',3,1),(1194,279,1,'La Florida',3,1),(1195,280,1,'Santa Ana del Táchira',3,1),(1196,281,1,'San Rafael del Piñal',3,1),(1197,281,1,'Alberto Adriani',3,1),(1198,281,1,'Santo Domingo',3,1),(1199,281,1,'Juan Evangelista Labrador Zambrano',3,1),(1200,282,1,'Francisco de Miranda',3,1),(1201,283,1,'La Fría',3,1),(1202,283,1,'Boca de Grita',3,1),(1203,283,1,'José Antonio Páez',3,1),(1204,284,1,'Palmira',3,1),(1205,285,1,'Capacho Nuevo',3,1),(1206,285,1,'Juan Germán Roscio',3,1),(1207,285,1,'Román Cárdenas',3,1),(1208,286,1,'La Grita',3,1),(1209,286,1,'Emilio Constantino Guerrero',3,1),(1210,286,1,'Monseñor Miguel Antonio Salas',3,1),(1211,287,1,'José María Vargas',3,1),(1212,288,1,'Junín',3,1),(1213,288,1,'La Petrólea',3,1),(1214,288,1,'Quinimarí',3,1),(1215,288,1,'Bramón',3,1),(1216,289,1,'Libertad',3,1),(1217,289,1,'Cipriano Castro',3,1),(1218,289,1,'Manuel Felipe Rugeles',3,1),(1219,290,1,'Abejales',3,1),(1220,290,1,'Doradas',3,1),(1221,290,1,'Emeterio Ochoa',3,1),(1222,290,1,'San Joaquín de Navay',3,1),(1223,291,1,'Lobatera',3,1),(1224,291,1,'Constitución',3,1),(1225,292,1,'Michelena',3,1),(1226,293,1,'Panamericano',3,1),(1227,293,1,'La Palmita',3,1),(1228,294,1,'Pedro María Ureña',3,1),(1229,294,1,'Nueva Arcadia',3,1),(1230,295,1,'Delicias',3,1),(1231,296,1,'Boconó',3,1),(1232,296,1,'Hernández',3,1),(1233,297,1,'La Concordia',3,1),(1234,297,1,'San Juan Bautista',3,1),(1235,297,1,'Pedro María Morantes',3,1),(1236,297,1,'San Sebastián',3,1),(1237,297,1,'Dr. Francisco Romero Lobo',3,1),(1238,303,1,'Umuquena',3,1),(1239,298,1,'Seboruco',3,1),(1240,299,1,'San Simón',3,1),(1241,300,1,'Sucre',3,1),(1242,300,1,'Eleazar López Contreras',3,1),(1243,300,1,'San Pablo',3,1),(1244,301,1,'San Josecito',3,1),(1245,302,1,'Pregonero ',3,1),(1246,302,1,'Cárdenas',3,1),(1247,302,1,'Juan Pablo Peñalosa',3,1),(1248,302,1,'Potosí',3,1),(1249,304,1,'Araguaney',3,1),(1250,304,1,'El Jaguito',3,1),(1251,304,1,'La Esperanza',3,1),(1252,304,1,'Santa Isabel',3,1),(1253,305,1,'Boconó',3,1),(1254,305,1,'El Carmen',3,1),(1255,305,1,'Mosquey',3,1),(1256,305,1,'Ayacucho',3,1),(1257,305,1,'Burbusay',3,1),(1258,305,1,'General Ribas',3,1),(1259,305,1,'Guaramacal',3,1),(1260,305,1,'Vega de Guaramacal',3,1),(1261,305,1,'Monseñor Jáuregui',3,1),(1262,305,1,'Rafael Rangel',3,1),(1263,305,1,'San Miguel',3,1),(1264,305,1,'San José',3,1),(1265,306,1,'Sabana Grande',3,1),(1266,306,1,'Cheregüé',3,1),(1267,306,1,'Granados',3,1),(1268,307,1,'Arnoldo Gabaldón',3,1),(1269,307,1,'Bolivia',3,1),(1270,307,1,'Carrillo',3,1),(1271,307,1,'Cegarra',3,1),(1272,307,1,'Chejendé',3,1),(1273,307,1,'Manuel Salvador Ulloa',3,1),(1274,307,1,'San José',3,1),(1275,308,1,'Carache',3,1),(1276,308,1,'La Concepción',3,1),(1277,308,1,'Cuicas',3,1),(1278,308,1,'Panamericana',3,1),(1279,308,1,'Santa Cruz',3,1),(1280,309,1,'Escuque',3,1),(1281,309,1,'La Unión',3,1),(1282,309,1,'Santa Rita',3,1),(1283,309,1,'Sabana Libre',3,1),(1284,310,1,'El Socorro',3,1),(1285,310,1,'Los Caprichos',3,1),(1286,310,1,'Antonio José de Sucre',3,1),(1287,311,1,'Campo Elías',3,1),(1288,311,1,'Arnoldo Gabaldón',3,1),(1289,312,1,'Santa Apolonia',3,1),(1290,312,1,'El Progreso',3,1),(1291,312,1,'La Ceiba',3,1),(1292,312,1,'Tres de Febrero',3,1),(1293,313,1,'El Dividive',3,1),(1294,313,1,'Agua Santa',3,1),(1295,313,1,'Agua Caliente',3,1),(1296,313,1,'El Cenizo',3,1),(1297,313,1,'Valerita',3,1),(1298,314,1,'Monte Carmelo',3,1),(1299,314,1,'Buena Vista',3,1),(1300,314,1,'Santa María del Horcón',3,1),(1301,315,1,'Motatán',3,1),(1302,315,1,'El Baño',3,1),(1303,315,1,'Jalisco',3,1),(1304,316,1,'Pampán',3,1),(1305,316,1,'Flor de Patria',3,1),(1306,316,1,'La Paz',3,1),(1307,316,1,'Santa Ana',3,1),(1308,317,1,'Pampanito',3,1),(1309,317,1,'La Concepción',3,1),(1310,317,1,'Pampanito II',3,1),(1311,318,1,'Betijoque',3,1),(1312,318,1,'José Gregorio Hernández',3,1),(1313,318,1,'La Pueblita',3,1),(1314,318,1,'Los Cedros',3,1),(1315,319,1,'Carvajal',3,1),(1316,319,1,'Campo Alegre',3,1),(1317,319,1,'Antonio Nicolás Briceño',3,1),(1318,319,1,'José Leonardo Suárez',3,1),(1319,320,1,'Sabana de Mendoza',3,1),(1320,320,1,'Junín',3,1),(1321,320,1,'Valmore Rodríguez',3,1),(1322,320,1,'El Paraíso',3,1),(1323,321,1,'Andrés Linares',3,1),(1324,321,1,'Chiquinquirá',3,1),(1325,321,1,'Cristóbal Mendoza',3,1),(1326,321,1,'Cruz Carrillo',3,1),(1327,321,1,'Matriz',3,1),(1328,321,1,'Monseñor Carrillo',3,1),(1329,321,1,'Tres Esquinas',3,1),(1330,322,1,'Cabimbú',3,1),(1331,322,1,'Jajó',3,1),(1332,322,1,'La Mesa de Esnujaque',3,1),(1333,322,1,'Santiago',3,1),(1334,322,1,'Tuñame',3,1),(1335,322,1,'La Quebrada',3,1),(1336,323,1,'Juan Ignacio Montilla',3,1),(1337,323,1,'La Beatriz',3,1),(1338,323,1,'La Puerta',3,1),(1339,323,1,'Mendoza del Valle de Momboy',3,1),(1340,323,1,'Mercedes Díaz',3,1),(1341,323,1,'San Luis',3,1),(1342,324,1,'Caraballeda',3,1),(1343,324,1,'Carayaca',3,1),(1344,324,1,'Carlos Soublette',3,1),(1345,324,1,'Caruao Chuspa',3,1),(1346,324,1,'Catia La Mar',3,1),(1347,324,1,'El Junko',3,1),(1348,324,1,'La Guaira',3,1),(1349,324,1,'Macuto',3,1),(1350,324,1,'Maiquetía',3,1),(1351,324,1,'Naiguatá',3,1),(1352,324,1,'Urimare',3,1),(1353,325,1,'Arístides Bastidas',3,1),(1354,326,1,'Bolívar',3,1),(1355,327,1,'Chivacoa',3,1),(1356,327,1,'Campo Elías',3,1),(1357,328,1,'Cocorote',3,1),(1358,329,1,'Independencia',3,1),(1359,330,1,'José Antonio Páez',3,1),(1360,331,1,'La Trinidad',3,1),(1361,332,1,'Manuel Monge',3,1),(1362,333,1,'Salóm',3,1),(1363,333,1,'Temerla',3,1),(1364,333,1,'Nirgua',3,1),(1365,334,1,'San Andrés',3,1),(1366,334,1,'Yaritagua',3,1),(1367,335,1,'San Javier',3,1),(1368,335,1,'Albarico',3,1),(1369,335,1,'San Felipe',3,1),(1370,336,1,'Sucre',3,1),(1371,337,1,'Urachiche',3,1),(1372,338,1,'El Guayabo',3,1),(1373,338,1,'Farriar',3,1),(1374,339,1,'Isla de Toas',3,1),(1375,339,1,'Monagas',3,1),(1376,340,1,'San Timoteo',3,1),(1377,340,1,'General Urdaneta',3,1),(1378,340,1,'Libertador',3,1),(1379,340,1,'Marcelino Briceño',3,1),(1380,340,1,'Pueblo Nuevo',3,1),(1381,340,1,'Manuel Guanipa Matos',3,1),(1382,341,1,'Ambrosio',3,1),(1383,341,1,'Carmen Herrera',3,1),(1384,341,1,'La Rosa',3,1),(1385,341,1,'Germán Ríos Linares',3,1),(1386,341,1,'San Benito',3,1),(1387,341,1,'Rómulo Betancourt',3,1),(1388,341,1,'Jorge Hernández',3,1),(1389,341,1,'Punta Gorda',3,1),(1390,341,1,'Arístides Calvani',3,1),(1391,342,1,'Encontrados',3,1),(1392,342,1,'Udón Pérez',3,1),(1393,343,1,'Moralito',3,1),(1394,343,1,'San Carlos del Zulia',3,1),(1395,343,1,'Santa Cruz del Zulia',3,1),(1396,343,1,'Santa Bárbara',3,1),(1397,343,1,'Urribarrí',3,1),(1398,344,1,'Carlos Quevedo',3,1),(1399,344,1,'Agustín Codazzi',3,1),(1400,344,1,'Simón Rodríguez',3,1),(1401,344,1,'Los Naranjos',3,1),(1402,346,1,'José Ramón Yépez',3,1),(1403,346,1,'La Concepción',3,1),(1404,346,1,'San José',3,1),(1405,346,1,'Mariano Parra León',3,1),(1406,347,1,'Jesús María Semprún',3,1),(1407,347,1,'Barí',3,1),(1408,348,1,'Concepción',3,1),(1409,348,1,'Andrés Bello',3,1),(1410,348,1,'Chiquinquirá',3,1),(1411,348,1,'El Carmelo',3,1),(1412,348,1,'Potreritos',3,1),(1413,349,1,'Libertad',3,1),(1414,349,1,'Alonso de Ojeda',3,1),(1415,349,1,'Venezuela',3,1),(1416,349,1,'Eleazar López Contreras',3,1),(1417,349,1,'Campo Lara',3,1),(1418,349,1,'El Danto',3,1),(1419,350,1,'Libertad',3,1),(1420,350,1,'Río Negro',3,1),(1421,350,1,'San José de Perijá',3,1),(1422,350,1,'Fray Bartolomé de las Casas',3,1),(1423,351,1,'San Rafael',3,1),(1424,351,1,'La Sierrita',3,1),(1425,351,1,'Las Parcelas',3,1),(1426,351,1,'Luis de Vicente',3,1),(1427,351,1,'Monseñor Marcos Sergio Godoy',3,1),(1428,351,1,'Ricaurte',3,1),(1429,351,1,'Tamare',3,1),(1430,352,1,'Antonio Borjas Romero',3,1),(1431,352,1,'Bolívar',3,1),(1432,352,1,'Cacique Mara',3,1),(1433,352,1,'Carracciolo Parra Pérez',3,1),(1434,352,1,'Cecilio Acosta',3,1),(1435,352,1,'Cristo de Aranza',3,1),(1436,352,1,'Coquivacoa',3,1),(1437,352,1,'Chiquinquirá',3,1),(1438,352,1,'Francisco Eugenio Bustamante',3,1),(1439,352,1,'Idelfonzo Vásquez',3,1),(1440,352,1,'Juana de Ávila',3,1),(1441,352,1,'Luis Hurtado Higuera',3,1),(1442,352,1,'Manuel Dagnino',3,1),(1443,352,1,'Olegario Villalobos',3,1),(1444,352,1,'Raúl Leoni',3,1),(1445,352,1,'Santa Lucía',3,1),(1446,352,1,'Venancio Pulgar',3,1),(1447,352,1,'San Isidro',3,1),(1448,353,1,'Altagracia',3,1),(1449,353,1,'Faría',3,1),(1450,353,1,'Ana María Campos',3,1),(1451,353,1,'San Antonio',3,1),(1452,353,1,'San José',3,1),(1453,354,1,'Donaldo García',3,1),(1454,354,1,'El Rosario',3,1),(1455,354,1,'Sixto Zambrano',3,1),(1456,355,1,'San Francisco',3,1),(1457,355,1,'El Bajo',3,1),(1458,355,1,'Domitila Flores',3,1),(1459,355,1,'Francisco Ochoa',3,1),(1460,355,1,'Los Cortijos',3,1),(1461,355,1,'Marcial Hernández',3,1),(1462,355,1,'José Domingo Rus',3,1),(1463,356,1,'Santa Rita',3,1),(1464,356,1,'El Mene',3,1),(1465,356,1,'Pedro Lucas Urribarrí',3,1),(1466,356,1,'José Cenobio Urribarrí',3,1),(1467,357,1,'Rafael Maria Baralt',3,1),(1468,357,1,'Manuel Manrique',3,1),(1469,357,1,'Rafael Urdaneta',3,1),(1470,358,1,'Bobures',3,1),(1471,358,1,'Gibraltar',3,1),(1472,358,1,'Heras',3,1),(1473,358,1,'Monseñor Arturo Álvarez',3,1),(1474,358,1,'El Batey',3,1),(1475,359,1,'Rafael Urdaneta',3,1),(1476,359,1,'La Victoria',3,1),(1477,359,1,'Raúl Cuenca',3,1),(1478,345,1,'Sinamaica',3,1),(1479,345,1,'Alta Guajira',3,1),(1480,345,1,'Elías Sánchez Rubio',3,1),(1481,345,1,'Guajira',3,1),(1482,360,1,'Altagracia',3,1),(1483,360,1,'Antímano',3,1),(1484,360,1,'Caricuao',3,1),(1485,360,1,'Catedral',3,1),(1486,360,1,'Coche',3,1),(1487,360,1,'El Junquito',3,1),(1488,360,1,'El Paraíso',3,1),(1489,360,1,'El Recreo',3,1),(1490,360,1,'El Valle',3,1),(1491,360,1,'La Candelaria',3,1),(1492,360,1,'La Pastora',3,1),(1493,360,1,'La Vega',3,1),(1494,360,1,'Macarao',3,1),(1495,360,1,'San Agustín',3,1),(1496,360,1,'San Bernardino',3,1),(1497,360,1,'San José',3,1),(1498,360,1,'San Juan',3,1),(1499,360,1,'San Pedro',3,1),(1500,360,1,'Santa Rosalía',3,1),(1501,360,1,'Santa Teresa',3,1),(1502,360,1,'Sucre (Catia)',3,1),(1503,360,1,'23 de enero',3,1);
/*!40000 ALTER TABLE `country_regions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `currencies`
--

DROP TABLE IF EXISTS `currencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `currencies` (
  `currency_id` int unsigned NOT NULL AUTO_INCREMENT,
  `abbreviation` varchar(3) NOT NULL,
  `symbol` varchar(5) DEFAULT NULL,
  `decimals` int NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`currency_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currencies`
--

LOCK TABLES `currencies` WRITE;
/*!40000 ALTER TABLE `currencies` DISABLE KEYS */;
/*!40000 ALTER TABLE `currencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_roles`
--

DROP TABLE IF EXISTS `gym_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_roles` (
  `gym_role_id` int NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`gym_role_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_roles`
--

LOCK TABLES `gym_roles` WRITE;
/*!40000 ALTER TABLE `gym_roles` DISABLE KEYS */;
INSERT INTO `gym_roles` VALUES (1,1),(2,1),(3,1);
/*!40000 ALTER TABLE `gym_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_roles_lang`
--

DROP TABLE IF EXISTS `gym_roles_lang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_roles_lang` (
  `gym_roles_lang_id` int NOT NULL AUTO_INCREMENT,
  `gym_role_id` int NOT NULL,
  `language_id` int NOT NULL,
  `description` varchar(45) NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`gym_roles_lang_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_roles_lang`
--

LOCK TABLES `gym_roles_lang` WRITE;
/*!40000 ALTER TABLE `gym_roles_lang` DISABLE KEYS */;
INSERT INTO `gym_roles_lang` VALUES (1,1,1,'Administrador',1),(2,1,2,'Administrator',1),(3,2,1,'Cliente',1),(4,2,2,'Client',1),(5,3,1,'Entrenador',1),(6,3,2,'Trainer',1);
/*!40000 ALTER TABLE `gym_roles_lang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_sub_plans`
--

DROP TABLE IF EXISTS `gym_sub_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_sub_plans` (
  `gym_sub_plan_id` bigint NOT NULL AUTO_INCREMENT,
  `gym_id` bigint NOT NULL,
  `billing_period_id` int NOT NULL,
  `weekly_attendance_limit` int NOT NULL,
  `price` decimal(30,8) NOT NULL,
  `description` text NOT NULL,
  `created_at` datetime NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`gym_sub_plan_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_sub_plans`
--

LOCK TABLES `gym_sub_plans` WRITE;
/*!40000 ALTER TABLE `gym_sub_plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `gym_sub_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gym_user_roles`
--

DROP TABLE IF EXISTS `gym_user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gym_user_roles` (
  `gym_user_role_id` int NOT NULL AUTO_INCREMENT,
  `gym_id` int NOT NULL,
  `user_id` bigint NOT NULL,
  `role_id` int NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`gym_user_role_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gym_user_roles`
--

LOCK TABLES `gym_user_roles` WRITE;
/*!40000 ALTER TABLE `gym_user_roles` DISABLE KEYS */;
INSERT INTO `gym_user_roles` VALUES (1,1,1,1,1),(2,1,3,2,1),(3,1,4,1,1),(4,1,5,1,1);
/*!40000 ALTER TABLE `gym_user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gyms`
--

DROP TABLE IF EXISTS `gyms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gyms` (
  `gym_id` int NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `logo` varchar(45) DEFAULT NULL,
  `slug` varchar(45) NOT NULL,
  `country_id` int NOT NULL,
  `country_region_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`gym_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gyms`
--

LOCK TABLES `gyms` WRITE;
/*!40000 ALTER TABLE `gyms` DISABLE KEYS */;
INSERT INTO `gyms` VALUES (1,'Del Valle Fitness','logo.webp','delvallefitness',1,623,'2026-07-17 00:00:00','0000-00-00 00:00:00',1);
/*!40000 ALTER TABLE `gyms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `languages` (
  `language_id` int NOT NULL,
  `name` varchar(45) NOT NULL,
  `code` varchar(3) NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`language_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `languages`
--

LOCK TABLES `languages` WRITE;
/*!40000 ALTER TABLE `languages` DISABLE KEYS */;
INSERT INTO `languages` VALUES (1,'Español','ESP',1),(2,'Ingles','ENG',1);
/*!40000 ALTER TABLE `languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_type`
--

DROP TABLE IF EXISTS `message_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_type` (
  `message_type_id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(50) NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`message_type_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_type`
--

LOCK TABLES `message_type` WRITE;
/*!40000 ALTER TABLE `message_type` DISABLE KEYS */;
INSERT INTO `message_type` VALUES (1,'STORED PROCEDURE',1),(2,'EMAIL',1);
/*!40000 ALTER TABLE `message_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `message_type_id` int unsigned NOT NULL,
  `language_id` int unsigned NOT NULL,
  `description` varchar(100) NOT NULL,
  `status_code` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`message_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans` (
  `subscription_plan_id` int NOT NULL AUTO_INCREMENT,
  `billing_interval` varchar(10) NOT NULL,
  `weekly_attendance_limit` int NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`subscription_plan_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans_lang`
--

DROP TABLE IF EXISTS `subscription_plans_lang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans_lang` (
  `subscription_plans_lang_id` int NOT NULL AUTO_INCREMENT,
  `subscription_plan_id` int NOT NULL,
  `language_id` int NOT NULL,
  `description` varchar(45) NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`subscription_plans_lang_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans_lang`
--

LOCK TABLES `subscription_plans_lang` WRITE;
/*!40000 ALTER TABLE `subscription_plans_lang` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_plans_lang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `geek_user_id` text,
  `gym_role_id` int DEFAULT NULL,
  `refered_by` bigint unsigned DEFAULT NULL,
  `login_date` datetime NOT NULL,
  `status_id` bigint unsigned NOT NULL,
  `document_type_id` varchar(30) DEFAULT NULL,
  `document_id` varchar(50) DEFAULT NULL,
  `blood_type_id` int DEFAULT NULL,
  `email` text,
  `username` text,
  `first_name` varchar(45) DEFAULT NULL,
  `middle_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `second_last_name` varchar(45) DEFAULT NULL,
  `gender_id` int DEFAULT NULL,
  `region_id` int DEFAULT NULL,
  `locality` text,
  `birthday` date DEFAULT NULL,
  `avatar` varchar(45) DEFAULT NULL,
  `country_phone_code` varchar(5) DEFAULT '+58',
  `phone_number` varchar(20) DEFAULT NULL,
  `country_emergency_phone_code` varchar(5) DEFAULT '+58',
  `emergency_phone_number` varchar(20) DEFAULT NULL,
  `medical_condition` text,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ad8a22dc-f94b-11f0-bfa6-2a1682103d73',NULL,NULL,'2026-10-26 21:31:00',1,'1','17671371',8,'dmolina101@gmail.com','dmolina101','David','Leonardo','Molina','Ruíz',2,640,'Aguirre centro','1986-08-05',NULL,'+58','4244463739','+58','4121963690','No que yo sepa'),(2,'996d6a03-fae5-11f0-879e-2a1682103d73',1,NULL,'2026-10-28 18:16:40',1,'1','17671373',8,'geekstvzla@gmail.com','geekst','David','Leonardoss','Molina','Ruíz',2,640,NULL,'1986-08-05',NULL,'+58','04121963690','+58','4220101454',''),(3,'48f6f2d0-d33c-11f1-83d8-88ae1d563136',NULL,NULL,'2026-10-28 22:04:05',1,'1','17671378',8,'dmolina101@gmail.comm','david7288','David','Leonardo','Molina','Ruiz',2,640,NULL,'1986-08-05',NULL,'+58','04121963690','+58','4220101454',''),(4,'c35fdd28-fa2c-11f0-879e-2a1682103d73',2,NULL,'2026-11-03 21:01:34',3,'1','13900761',1,'carolina.coronel3@gmail.com','carocoronel','Carolina','','Coronel','',1,623,'Bejuma','1979-07-30',NULL,'+58','04244106840','+58','04121963690','No');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'gimnasio'
--

--
-- Dumping routines for database 'gimnasio'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_sign_in` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE' */ ;
DELIMITER ;;
CREATE  PROCEDURE `sp_sign_in`(IN `p_user_id` TEXT, IN `p_lang_id` INT, OUT `p_response` TEXT)
BEGIN

    SELECT IF(COUNT(1) > 0,TRUE ,FALSE)
    INTO @v_user_exist
    FROM users u
    WHERE u.geek_user_id = p_user_id;
    
    IF @v_user_exist = 1 THEN
		
        UPDATE users u SET u.login_date = NOW() WHERE u.geek_user_id = p_user_id;
        
	ELSE
    
		INSERT INTO users (geek_user_id, refered_by,status_id, login_date) VALUES (p_user_id, null, 1, NOW());
    
    END IF;
    
    SELECT CONCAT('{
		"response" : {
			"message"    : "',@v_message,'",
			"status"     : "success",
			"statusCode" : 1
		}
	}') INTO p_response;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-08 22:16:00
