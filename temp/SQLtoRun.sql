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