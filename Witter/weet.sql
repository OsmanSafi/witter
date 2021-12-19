-- Adminer 4.8.0 MySQL 8.0.23 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `follow_list`;
CREATE TABLE `follow_list` (
  `followed` int NOT NULL,
  `followerid` int NOT NULL,
  PRIMARY KEY (`followed`,`followerid`),
  KEY `followerid` (`followerid`),
  KEY `userid` (`followed`),
  CONSTRAINT `follow_list_ibfk_1` FOREIGN KEY (`followed`) REFERENCES `users` (`userid`),
  CONSTRAINT `follow_list_ibfk_2` FOREIGN KEY (`followerid`) REFERENCES `users` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `follow_list` (`followed`, `followerid`) VALUES
(2,	1),
(18,	1),
(19,	1),
(23,	1),
(1,	2),
(18,	2),
(23,	2),
(24,	2),
(2,	18),
(24,	18),
(2,	19),
(18,	19),
(29,	19),
(30,	19),
(31,	19),
(2,	22),
(18,	22),
(24,	22),
(28,	22),
(1,	27),
(1,	28),
(1,	29),
(1,	30),
(1,	31),
(1,	32);

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `userid` int NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `picture` varchar(240) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'https://i.imgur.com/nTxJseA.jpg',
  `username` varchar(25) NOT NULL,
  `displayname` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sex` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(60) NOT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`userid`, `email`, `picture`, `username`, `displayname`, `sex`, `password`) VALUES
(1,	'admin@email.com',	'https://i.imgur.com/nTxJseA.jpg',	'admin',	'Adam (Admin)',	'm',	'$2b$05$vSO3J8JTgylDnmau0hF2bu7KHVkBCwKfpr30tEZkCPm2Rw6GS.ZiW'),
(2,	'al@gmail.com',	'https://i.imgur.com/eDmTHe2.jpeg',	'al',	'Alejandro',	'm',	'$2a$10$CeuW4d5dqfjoKse07byOb.dyn0n8KooiOCAPwl7m9jUuBpC3HY1X.'),
(18,	'myrealemail@csumb.edu',	'https://i.imgur.com/p42LAlD.png',	'DavidS',	'David Saavedra',	'm',	'$2b$05$DN5PkAIFeLOjkn9Qb.9MMerLqdTBQfgK5iFD5tN1tCtDsF.dfg/7.'),
(19,	'osmansafi1027@gmail.com',	'https://i.imgur.com/dQGVuCi.jpg',	'OSMANSAFI ',	'Osman S Safi',	'm',	'$2b$10$33qz5IPw/inrgqBpYpzXHe2v28KBYrkMBR8BSq22PLaH7PWGX8hse'),
(21,	'drakeemail@gmail.com',	'https://i.imgur.com/MdiuwG6.png',	'Drake',	'Drizzy',	'm',	'$2b$10$lQIywwp1XMSwbPFZzgnsUu4v5YeAyoHiQEHBkw/HD94vcalwdZc6q'),
(22,	'realaiden@gmail.com',	'https://i.imgur.com/BzST96U.jpg',	'Aiden',	'Aiden!',	'm',	'$2b$10$ubU..64RavJRicUmrGEfEOetzbch8nSX.sXUU.bKvZxmhRoazDeZi'),
(23,	'otter@gmail.com',	'https://i.imgur.com/S6787KK.jpg',	'Monte Rey',	'Mr. Rey',	'm',	'$2b$10$miNX42dM5S714AhSZ83oGunVAHqdNbXhVyUdFMyDs0E7ZX66evilC'),
(24,	'kenny@gmail.com',	'https://i.imgur.com/h11uhtA.jpg',	'Kendrick Lamar',	'Kendrick Lamar',	'm',	'$2b$10$/Kvq1KxS35dLqAybOjJvgOdPA9Y/3s/QlMqtPkzU3u25eiAJva.0m'),
(27,	'Babubabi@yahoo.com',	'https://i.imgur.com/nTxJseA.jpg',	'TestUser49',	'Testuser49',	'm',	'$2b$10$73rVm2zu0J6tC/ORASwuBOohzRKqQB10eqOLw4GXn9A7XDvphfngW'),
(28,	'osman_safi@yahoo.com',	'https://i.imgur.com/dQGVuCi.jpg',	'kid',	'Osman',	'm',	'$2b$10$1hnUQT3Tl3cWhY/BSL8w4e7XvLvTrtX.7lSc20F8WCQmd6Zv2oKfK'),
(29,	'mrpresident@gmail.com',	'https://i.imgur.com/uwwFhV7.jpg',	'Obama',	'Barack  Obama',	'm',	'$2b$10$9F2Gr0eBgBEXkLc2HIZ/z.kYtdxU6QAXq/7d/P1knbJSO.H2M7Y8u'),
(30,	'swift@gmail.com',	'https://i.imgur.com/DhekXhE.jpg',	'taylor',	'taylorswift13',	'f',	'$2b$10$VoSnCN/lS3JkWU7i1srxVeajcUzzK76RlqTzKN0hfqTGCViMLaeHu'),
(31,	'bee@gmail.com',	'https://i.imgur.com/zYK5ULA.jpg',	'Beyonce',	'Beyonce',	'f',	'$2b$10$2aoAXHTBjeWiMxqT0nXi2eHozjBtVymQtb2dcJpJdGIyQA0r.p3M2'),
(32,	'123@testmail.com',	'https://i.imgur.com/nTxJseA.jpg',	'OSMANSAFI',	'testuser3',	'm',	'$2b$10$GaiYBfk7sAe.jNguY5UjmeUIi5aM.9YWQfEC/XKJLPD2n8vjAbQhy');

DELIMITER ;;

CREATE TRIGGER `autoFollow` AFTER INSERT ON `users` FOR EACH ROW
insert into follow_list (followed, followerid) values (1, new.userid);;

CREATE TRIGGER `deleteFollows` BEFORE DELETE ON `users` FOR EACH ROW
delete from follow_list where followed=old.userid or followerid=old.userid;;

DELIMITER ;

DROP TABLE IF EXISTS `weets`;
CREATE TABLE `weets` (
  `userid` int NOT NULL,
  `weetid` int NOT NULL AUTO_INCREMENT,
  `weet` varchar(200) NOT NULL,
  `time_stamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`weetid`),
  KEY `userid` (`userid`),
  CONSTRAINT `weets_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `weets` (`userid`, `weetid`, `weet`, `time_stamp`) VALUES
(2,	1,	'Weet weet',	'2021-11-27 19:25:28'),
(18,	6,	'Hello this is my first Weet',	'2021-12-04 18:12:26'),
(18,	7,	'Hello World!',	'2021-12-05 00:06:43'),
(21,	9,	'First Weet!',	'2021-12-06 22:59:30'),
(22,	10,	'System.out.println(\"Hello Witter\");',	'2021-12-06 23:40:34'),
(23,	11,	'Fun Fact: An otter’s lung capacity is 2.5 times greater than that of similar-sized land mammals.',	'2021-12-06 23:44:31'),
(24,	12,	'Just got a Pulitzer Prize',	'2021-12-06 23:55:51'),
(27,	13,	'Hello World',	'2021-12-07 05:26:12'),
(29,	16,	'Happy birthday to my friend and my brother, Joe Biden! Thanks for giving all of us the gift of better infrastructure. Grateful for all you’re doing to build this country back better.',	'2021-12-08 01:40:34'),
(30,	17,	'Close to the new year!',	'2021-12-08 01:48:48'),
(18,	18,	'FF14 Cactuar is still full, about to throw PC out of window real quick',	'2021-12-08 02:00:17'),
(31,	19,	'THE LION KING: THE GIFT available to stream and download now',	'2021-12-08 02:09:26'),
(22,	23,	'I\'m so ready for the semester to be over!',	'2021-12-08 03:54:35'),
(2,	24,	'Can\'t believe Witter is about to have its IPO',	'2021-12-08 03:56:35'),
(19,	25,	'does this work?',	'2021-12-08 03:58:19');

-- 2021-12-08 04:43:56
