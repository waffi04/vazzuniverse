/*
  Warnings:

  - You are about to drop the `data_joki` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_auth` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[kode]` on the table `kategoris` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `accounts` DROP FOREIGN KEY `accounts_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `sessions` DROP FOREIGN KEY `sessions_user_id_fkey`;

-- DropIndex
DROP INDEX `accounts_user_id_fkey` ON `accounts`;

-- DropIndex
DROP INDEX `sessions_user_id_fkey` ON `sessions`;

-- AlterTable
ALTER TABLE `beritas` MODIFY `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `deposits` MODIFY `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `footer` MODIFY `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `kategoris` MODIFY `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `layanans` MODIFY `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `methods` MODIFY `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `ovos` MODIFY `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `pembayarans` MODIFY `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `pembelians` ADD COLUMN `layanan_id` INTEGER NULL,
    MODIFY `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `sub_categories` MODIFY `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `data_joki`;

-- DropTable
DROP TABLE `users_auth`;

-- CreateIndex
CREATE INDEX `beritas_tipe_idx` ON `beritas`(`tipe`);

-- CreateIndex
CREATE INDEX `deposits_username_idx` ON `deposits`(`username`);

-- CreateIndex
CREATE INDEX `deposits_no_pembayaran_idx` ON `deposits`(`no_pembayaran`);

-- CreateIndex
CREATE INDEX `deposits_deposit_id_idx` ON `deposits`(`deposit_id`);

-- CreateIndex
CREATE INDEX `deposits_status_idx` ON `deposits`(`status`);

-- CreateIndex
CREATE INDEX `footer_parent_idx` ON `footer`(`parent`);

-- CreateIndex
CREATE UNIQUE INDEX `kategoris_kode_key` ON `kategoris`(`kode`);

-- CreateIndex
CREATE INDEX `kategoris_tipe_status_idx` ON `kategoris`(`tipe`, `status`);

-- CreateIndex
CREATE INDEX `layanans_kategori_id_idx` ON `layanans`(`kategori_id`);

-- CreateIndex
CREATE INDEX `layanans_sub_category_id_idx` ON `layanans`(`sub_category_id`);

-- CreateIndex
CREATE INDEX `layanans_provider_id_idx` ON `layanans`(`provider_id`);

-- CreateIndex
CREATE INDEX `layanans_status_is_flash_sale_idx` ON `layanans`(`status`, `is_flash_sale`);

-- CreateIndex
CREATE INDEX `methods_code_name_isActive_idx` ON `methods`(`code`, `name`, `isActive`);

-- CreateIndex
CREATE INDEX `pembayarans_metode_idx` ON `pembayarans`(`metode`);

-- CreateIndex
CREATE INDEX `pembelians_layanan_id_idx` ON `pembelians`(`layanan_id`);

-- CreateIndex
CREATE INDEX `sub_categories_code_category_id_active_idx` ON `sub_categories`(`code`, `category_id`, `active`);

-- CreateIndex
CREATE INDEX `system_log_parentLogId_idx` ON `system_log`(`parentLogId`);

-- CreateIndex
CREATE INDEX `users_username_role_whatsapp_idx` ON `users`(`username`, `role`, `whatsapp`);

-- CreateIndex
CREATE INDEX `vouchers_code_is_active_idx` ON `vouchers`(`code`, `is_active`);

-- CreateIndex
CREATE INDEX `vouchers_expiry_date_idx` ON `vouchers`(`expiry_date`);

-- AddForeignKey
ALTER TABLE `deposits` ADD CONSTRAINT `deposits_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `layanans` ADD CONSTRAINT `layanans_kategori_id_fkey` FOREIGN KEY (`kategori_id`) REFERENCES `kategoris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `layanans` ADD CONSTRAINT `layanans_sub_category_id_fkey` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pembelians` ADD CONSTRAINT `pembelians_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pembelians` ADD CONSTRAINT `pembelians_layanan_id_fkey` FOREIGN KEY (`layanan_id`) REFERENCES `layanans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_categories` ADD CONSTRAINT `sub_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `kategoris`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_log` ADD CONSTRAINT `system_log_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `pembelians`(`order_id`) ON DELETE SET NULL ON UPDATE CASCADE;
