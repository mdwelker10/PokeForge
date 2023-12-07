CREATE TABLE IF NOT EXISTS `user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(16) NOT NULL UNIQUE CHECK (LENGTH(`username`) > 2),
  `password` varchar(256) NOT NULL,
  `salt` varchar(256) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `team` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `public` boolean NOT NULL,
  `name` varchar(32) NOT NULL CHECK (LENGTH(`name`) > 2),
  `last_modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_id` (`user_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `pokemon_entry` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `team_id` int unsigned NOT NULL,
  `pokemon_id` int unsigned NOT NULL,
  `item_id` int unsigned,
  `ability_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_team_id` (`team_id`),
  CONSTRAINT `fk_team_id` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  KEY `fk_pokemon_id_e` (`pokemon_id`),
  CONSTRAINT `fk_pokemon_id_e` FOREIGN KEY (`pokemon_id`) REFERENCES `pokemon` (`id`) ON UPDATE CASCADE ON DELETE NO ACTION,
  KEY `fk_item_id` (`item_id`),
  CONSTRAINT `fk_item_id` FOREIGN KEY (`item_id`) REFERENCES `item` (`id`) ON UPDATE CASCADE ON DELETE NO ACTION,
  KEY `fk_ability_id_e` (`ability_id`),
  CONSTRAINT `fk_ability_id_e` FOREIGN KEY (`ability_id`) REFERENCES `ability` (`id`) ON UPDATE CASCADE ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `known_moves` (
  `entry_id` int unsigned NOT NULL,
  `move_id` int unsigned NOT NULL,
  PRIMARY KEY (`entry_id`, `move_id`),
  KEY `fk_entry_id` (`entry_id`),
  CONSTRAINT `fk_entry_id` FOREIGN KEY (`entry_id`) REFERENCES `pokemon_entry` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  KEY `fk_move_id_e` (`move_id`),
  CONSTRAINT `fk_move_id_e` FOREIGN KEY (`move_id`) REFERENCES `move` (`id`) ON UPDATE CASCADE ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
