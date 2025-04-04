/*
  Warnings:

  - You are about to alter the column `metode` on the `deposits` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `status` on the `deposits` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to drop the column `layanan_id` on the `pembelians` table. All the data in the column will be lost.
  - You are about to alter the column `zone` on the `pembelians` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `nickname` on the `pembelians` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `status` on the `pembelians` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `tipe_transaksi` on the `pembelians` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `whatsapp` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(225)` to `VarChar(20)`.
  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - You are about to alter the column `otp` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(6)`.

*/
-- DropIndex
DROP INDEX `deposits_status_idx` ON `deposits`;

-- DropIndex
DROP INDEX `deposits_username_idx` ON `deposits`;

-- DropIndex
DROP INDEX `layanans_kategori_id_idx` ON `layanans`;

-- DropIndex
DROP INDEX `layanans_provider_id_idx` ON `layanans`;

-- DropIndex
DROP INDEX `layanans_sub_category_id_idx` ON `layanans`;

-- DropIndex
DROP INDEX `pembelians_layanan_id_idx` ON `pembelians`;

-- DropIndex
DROP INDEX `pembelians_order_id_idx` ON `pembelians`;

-- DropIndex
DROP INDEX `pembelians_status_idx` ON `pembelians`;

-- DropIndex
DROP INDEX `pembelians_username_idx` ON `pembelians`;

-- AlterTable
ALTER TABLE `deposits` MODIFY `metode` VARCHAR(50) NOT NULL,
    MODIFY `status` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `layanans` MODIFY `judul_flash_sale` VARCHAR(255) NULL,
    MODIFY `banner_flash_sale` VARCHAR(255) NULL,
    MODIFY `catatan` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `pembelians` DROP COLUMN `layanan_id`,
    MODIFY `zone` VARCHAR(50) NULL,
    MODIFY `nickname` VARCHAR(100) NULL,
    MODIFY `status` VARCHAR(20) NOT NULL,
    MODIFY `tipe_transaksi` VARCHAR(20) NOT NULL DEFAULT 'game';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `token` VARCHAR(191) NULL,
    MODIFY `whatsapp` VARCHAR(20) NULL,
    MODIFY `role` VARCHAR(20) NOT NULL,
    MODIFY `otp` VARCHAR(6) NULL;

-- CreateIndex
CREATE INDEX `deposits_username_status_idx` ON `deposits`(`username`, `status`);

-- CreateIndex
CREATE INDEX `deposits_status_created_at_idx` ON `deposits`(`status`, `created_at`);

-- CreateIndex
CREATE INDEX `layanans_kategori_id_status_idx` ON `layanans`(`kategori_id`, `status`);

-- CreateIndex
CREATE INDEX `layanans_sub_category_id_status_idx` ON `layanans`(`sub_category_id`, `status`);

-- CreateIndex
CREATE INDEX `layanans_provider_id_status_idx` ON `layanans`(`provider_id`, `status`);

-- CreateIndex
CREATE INDEX `layanans_is_flash_sale_expired_flash_sale_idx` ON `layanans`(`is_flash_sale`, `expired_flash_sale`);

-- CreateIndex
CREATE INDEX `pembelians_order_id_status_idx` ON `pembelians`(`order_id`, `status`);

-- CreateIndex
CREATE INDEX `pembelians_username_created_at_idx` ON `pembelians`(`username`, `created_at`);

-- CreateIndex
CREATE INDEX `pembelians_status_created_at_idx` ON `pembelians`(`status`, `created_at`);

-- CreateIndex
CREATE INDEX `users_username_balance_idx` ON `users`(`username`, `balance`);

-- CreateIndex
CREATE INDEX `users_role_balance_idx` ON `users`(`role`, `balance`);

-- CreateIndex
CREATE INDEX `users_whatsapp_otp_idx` ON `users`(`whatsapp`, `otp`);
