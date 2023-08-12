CREATE TABLE `mms`.`assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int DEFAULT NULL,
  `property_id` int NOT NULL,
  `name` varchar(45) NOT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`assets_relations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ancestor_id` int NOT NULL,
  `descendant_id` int NOT NULL,
  `depth` int NOT NULL,
  `property_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`deliveries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `supplier` int NOT NULL,
  `courier` varchar(45) NOT NULL,
  `placed` varchar(45) NOT NULL,
  `due` varchar(45) NOT NULL,
  `property_id` int NOT NULL,
  `arrived` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`delivery_items` (
  `delivery_id` int NOT NULL,
  `spare_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`delivery_id`,`spare_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`enum_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type` (`type`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`enums` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enum_type_id` int NOT NULL,
  `value` varchar(45) NOT NULL,
  `list_priority` int NOT NULL DEFAULT '100',
  `payload` varchar(45) DEFAULT NULL,
  `payload_two` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `enum_type_id` (`enum_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`file_mappings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_type` varchar(45) NOT NULL,
  `from_id` int NOT NULL,
  `to_type` varchar(45) NOT NULL,
  `to_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_name` varchar(255) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `destination` varchar(255) NOT NULL,
  `location_name` varchar(255) NOT NULL,
  `size` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `asset` varchar(45) NOT NULL,
  `type` varchar(45) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` longtext NOT NULL,
  `created` datetime NOT NULL,
  `urgency` varchar(45) NOT NULL,
  `required_comp_date` datetime NOT NULL,
  `completed` int NOT NULL DEFAULT '0',
  `comp_date` datetime DEFAULT NULL,
  `reporter` varchar(45) NOT NULL,
  `logged_time` int DEFAULT NULL,
  `status` varchar(45) NOT NULL DEFAULT 'Un-attended',
  `notes` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`last_property` (
  `user_id` int NOT NULL,
  `property_id` int NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`logged_time` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `job_id` int NOT NULL,
  `time` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`permission_mappings` (
  `permission_id` INT NOT NULL,
  `user_group_id` INT NOT NULL,
  PRIMARY KEY (`permission_id`, `user_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `area` VARCHAR(45) NOT NULL,
  `permission` VARCHAR(45) NOT NULL,
  `full_string` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `type` varchar(45) NOT NULL,
  `address` varchar(45) NOT NULL,
  `city` varchar(45) NOT NULL,
  `county` varchar(45) NOT NULL,
  `postcode` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`property_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`spares` (
  `id` int NOT NULL AUTO_INCREMENT,
  `part_no` varchar(45) NOT NULL,
  `man_part_no` varchar(45) NOT NULL DEFAULT '',
  `name` varchar(45) NOT NULL,
  `man_name` varchar(45) NOT NULL DEFAULT '',
  `description` text NOT NULL,
  `notes` text NOT NULL,
  `location` varchar(45) NOT NULL DEFAULT 'Unknown',
  `quant_remain` int NOT NULL DEFAULT '0',
  `supplier` varchar(45) NOT NULL DEFAULT 'Unknown',
  `reorder_freq` varchar(45) NOT NULL DEFAULT 'Unknown',
  `reorder_num` int NOT NULL DEFAULT '0',
  `running_low` int NOT NULL DEFAULT '0',
  `cost` int NOT NULL DEFAULT '0',
  `property_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`spares_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `title` varchar(45) NOT NULL,
  `content` text NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`spares_used` (
  `spare_id` int NOT NULL,
  `job_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `date_used` datetime NOT NULL,
  `property_id` int NOT NULL,
  PRIMARY KEY (`spare_id`,`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `website` varchar(150) NOT NULL DEFAULT 'None',
  `phone` varchar(45) NOT NULL DEFAULT 'None',
  `prim_contact` varchar(45) NOT NULL DEFAULT 'None',
  `prim_contact_phone` varchar(45) NOT NULL DEFAULT 'None',
  `address` varchar(45) NOT NULL DEFAULT 'None',
  `city` varchar(45) NOT NULL DEFAULT 'None',
  `county` varchar(45) NOT NULL DEFAULT 'None',
  `postcode` varchar(45) NOT NULL DEFAULT 'None',
  `property_id` int NOT NULL,
  `supplies` varchar(150) NOT NULL DEFAULT 'None',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`user_groups` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `mms`.`users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `username_3` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

INSERT INTO `mms`.`user_groups` (`id`, `name`) VALUES ('1', 'SuperAdmin');
INSERT INTO `mms`.`user_groups` (`id`, `name`) VALUES ('2', 'Admin');
INSERT INTO `mms`.`user_groups` (`id`, `name`) VALUES ('3', 'Manager');
INSERT INTO `mms`.`user_groups` (`id`, `name`) VALUES ('4', 'Engineer');
INSERT INTO `mms`.`user_groups` (`id`, `name`) VALUES ('5', 'Staff');

/* 
ALTER TABLE `mms`.`jobs` 
CHANGE COLUMN `title` `title` VARCHAR(255) NOT NULL ;

ALTER TABLE `mms`.`users` 
CHANGE COLUMN `authority` `user_group_id` INT NOT NULL ;

ALTER TABLE `mms`.`spares_used` 
CHANGE COLUMN `num_used` `quantity` INT NOT NULL DEFAULT '0' ;
 */

INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('1', 'properties', 'view', 'properties.view');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('2', 'properties', 'manage', 'properties.manage');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('3', 'jobs', 'view', 'jobs.view');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('4', 'jobs', 'manage', 'jobs.manage');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('5', 'assets', 'view', 'assets.view');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('6', 'assets', 'manage', 'assets.manage');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('7', 'spares', 'view', 'spares.view');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('8', 'spares', 'manage', 'spares.manage');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('9', 'sparesManagement', 'view', 'sparesManagement.view');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('10', 'sparesManagement', 'manage', 'sparesManagement.manage');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('11', 'enums', 'view', 'enums.view');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('12', 'enums', 'manage', 'enums.manage');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('13', 'users', 'view', 'users.view');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('14', 'users', 'mange', 'users.manage');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('15', 'userGroups', 'view', 'userGroups.view');
INSERT INTO `mms`.`permissions` (`id`, `area`, `permission`, `full_string`) VALUES ('16', 'userGroups', 'manage', 'userGroups.manage');