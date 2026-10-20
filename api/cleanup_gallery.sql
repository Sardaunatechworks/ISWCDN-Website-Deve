-- =====================================================================
-- ISWCDN - Remove Partner Logos from Photo Gallery
-- Run this once in phpMyAdmin if the gallery table already contains logos
-- =====================================================================

DELETE FROM `gallery` WHERE `image_url` REGEXP 'image([0-9]+)\\.png' OR `image_url` LIKE '%logo%';
