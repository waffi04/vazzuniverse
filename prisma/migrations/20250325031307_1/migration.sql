-- AlterTable
ALTER TABLE `methods` ADD COLUMN `max` INTEGER NULL,
    ADD COLUMN `max_expired` INTEGER NULL DEFAULT 0,
    ADD COLUMN `min` INTEGER NULL,
    ADD COLUMN `min_expired` INTEGER NULL DEFAULT 0,
    ADD COLUMN `tax_admin` INTEGER NULL,
    ADD COLUMN `type_tax` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `pembayarans_order_id_idx` ON `pembayarans`(`order_id`);

-- CreateIndex
CREATE INDEX `pembayarans_status_idx` ON `pembayarans`(`status`);

-- CreateIndex
CREATE INDEX `pembayarans_order_id_metode_status_idx` ON `pembayarans`(`order_id`, `metode`, `status`);

-- CreateIndex
CREATE INDEX `pembelians_order_id_idx` ON `pembelians`(`order_id`);

-- CreateIndex
CREATE INDEX `pembelians_username_idx` ON `pembelians`(`username`);

-- CreateIndex
CREATE INDEX `pembelians_status_idx` ON `pembelians`(`status`);

-- CreateIndex
CREATE INDEX `pembelians_order_id_username_status_idx` ON `pembelians`(`order_id`, `username`, `status`);
