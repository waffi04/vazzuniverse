-- DropForeignKey
ALTER TABLE `deposits` DROP FOREIGN KEY `deposits_username_fkey`;

-- DropForeignKey
ALTER TABLE `layanans` DROP FOREIGN KEY `layanans_kategori_id_fkey`;

-- DropForeignKey
ALTER TABLE `layanans` DROP FOREIGN KEY `layanans_sub_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `pembelians` DROP FOREIGN KEY `pembelians_layanan_id_fkey`;

-- DropForeignKey
ALTER TABLE `pembelians` DROP FOREIGN KEY `pembelians_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `pembelians` DROP FOREIGN KEY `pembelians_username_fkey`;

-- DropForeignKey
ALTER TABLE `sub_categories` DROP FOREIGN KEY `sub_categories_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `system_log` DROP FOREIGN KEY `system_log_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `voucher_categories` DROP FOREIGN KEY `voucher_categories_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `voucher_categories` DROP FOREIGN KEY `voucher_categories_voucher_id_fkey`;

-- CreateIndex
CREATE INDEX `voucher_categories_voucher_id_idx` ON `voucher_categories`(`voucher_id`);

-- RenameIndex
ALTER TABLE `sub_categories` RENAME INDEX `sub_categories_category_id_fkey` TO `sub_categories_category_id_idx`;

-- RenameIndex
ALTER TABLE `voucher_categories` RENAME INDEX `voucher_categories_category_id_fkey` TO `voucher_categories_category_id_idx`;
