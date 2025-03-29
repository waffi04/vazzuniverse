/*
  Warnings:

  - You are about to drop the `SystemLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `SystemLog`;

-- CreateTable
CREATE TABLE `system_log` (
    `id` VARCHAR(191) NOT NULL,
    `parentLogId` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NULL,
    `ref` VARCHAR(191) NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `errorMessage` TEXT NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `system_log_orderId_idx`(`orderId`),
    INDEX `system_log_type_idx`(`type`),
    INDEX `system_log_orderId_type_idx`(`orderId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
