CREATE TABLE `mms`.`permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `area` VARCHAR(45) NOT NULL,
  `permission` VARCHAR(45) NOT NULL,
  `full_string` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);

CREATE TABLE `mms`.`permission_mappings` (
  `permission_id` INT NOT NULL,
  `user_group_id` INT NOT NULL,
  PRIMARY KEY (`permission_id`, `user_group_id`));

CREATE TABLE `mms`.`user_groups` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)

INSERT INTO `mms`.`user_groups` (`id`, `name`) VALUES ('1', 'SuperAdmin');
INSERT INTO `mms`.`user_groups` (`id`, `name`) VALUES ('2', 'Admin');
INSERT INTO `mms`.`user_groups` (`id`, `name`) VALUES ('3', 'Manager');
INSERT INTO `mms`.`user_groups` (`id`, `name`) VALUES ('4', 'Engineer');
INSERT INTO `mms`.`user_groups` (`id`, `name`) VALUES ('5', 'Staff');


CREATE TABLE `mms`.`files` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `file_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(255) NOT NULL,
  `destination` VARCHAR(255) NOT NULL,
  `location_name` VARCHAR(255) NOT NULL,
  `size` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);

CREATE TABLE `mms`.`file_mappings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `from_type` VARCHAR(45) NOT NULL,
  `from_id` INT NOT NULL,
  `to_type` VARCHAR(45) NOT NULL,
  `to_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);


ALTER TABLE `mms`.`jobs` 
CHANGE COLUMN `title` `title` VARCHAR(255) NOT NULL ;

ALTER TABLE `mms`.`users` 
CHANGE COLUMN `authority` `user_group_id` INT NOT NULL ;

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