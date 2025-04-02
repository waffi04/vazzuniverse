import { JSX, useState } from 'react';
import { trpc } from '@/utils/trpc';
import { PaymentMethods } from './paymentMethods'; // Import komponen PaymentMethods
import { Input } from '@/components/ui/input';
import { Method, usePlansStore } from '@/hooks/use-select-plan';
import { FormatPrice } from '@/utils/formatPrice';
import { DialogPayment } from './dialog-payment';
import { Voucher } from '@/types/schema/voucher';
import { PaymentMethod } from '@/types/payment';
import { useVoucherValidation } from './components/useVoucherValidation';

export function PaymentsSection({
  amount,
}: {
  amount?: number;
}): JSX.Element {
  const { data: methods } = trpc.methods.getMethods.useQuery({isActive : true});
  const {
    noWa,
    setNowa,
    selectPayment,
    setSelectPayment,
    categories,
    voucher,
    setVoucher,
  } = usePlansStore();

  const { 
    validateVoucherMutation, 
    isValidatingVoucher, 
    voucherError, 
    validVoucher, 
    discountedAmount ,
    setIsValidatingVoucher,
    setDiscountedAmount,
    setVoucherError,
    setValidVoucher
  } = useVoucherValidation(amount ?? 0);

  // const handleVoucherValidation = (voucherCode: string) => {
  //   setIsValidatingVoucher(true);
  //   validateVoucherMutation.mutate({code : voucherCode,amount : amount ?? 0,categoryId  : categories?.id.toString() as string});
  // };

  // Kelompokkan metode pembayaran berdasarkan tipe
  const groupedMethods =
    methods?.data.reduce((acc, method) => {
      const type = method.tipe
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(method);
      return acc;
    }, {} as Record<string, PaymentMethod[]>) || {};

  const paymentTypes = Object.keys(groupedMethods);

  // Handler untuk memilih metode pembayaran
  const handleSelectMethod = (method: Method) => {
    if (!amount) return;
    setSelectPayment({
      code: method.code as string,
      price: discountedAmount || amount,
      name: method.name,
      type: method.type,
    });
  };

  const displayAmount = discountedAmount || amount;

  return (
    <section className="w-full mx-auto p-6 bg-[#001435] border-2 border-blue-900 rounded-2xl mt-5 space-y-6 shadow-lg">
      {/* Input Nomor WhatsApp */}
      <div className="mb-4 space-y-2">
        <label
          htmlFor="whatsapp"
          className="block text-white text-sm mb-2 font-medium"
        >
          No Whatsapp
        </label>
        <Input
          type="number"
          id="whatsapp"
          value={noWa || ''}
          onChange={(e) => setNowa(e.target.value)}
          placeholder="8123456789"
          className="w-full px-4 py-3 rounded-md bg-blue-950 border border-blue-800 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
          required
        />
      </div>

      {/* Input Voucher */}
      <div className="mb-4 space-y-2">
        <label
          htmlFor="voucher"
          className="block text-white text-sm mb-2 font-medium"
        >
          Kode Voucher
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            id="voucher"
            value={voucher || ''}
            onChange={(e) => {
              setVoucher(e.target.value);
              if (validVoucher) {
                setValidVoucher(null);
                setDiscountedAmount(null);
                setVoucherError(null);
              }
            }}
            placeholder="Masukkan kode voucher"
            className="w-full px-4 py-3 rounded-md bg-blue-950 border border-blue-800 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
          />
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium text-sm transition-colors"
            onClick={() => {
              if (voucher && amount && categories) {
                setIsValidatingVoucher(true);
                validateVoucherMutation.mutate({
                  code: voucher,
                  amount: discountedAmount || amount,
                  categoryId: categories.id.toString(),
                });
              }
            }}
            disabled={isValidatingVoucher || !voucher || !amount}
          >
            {isValidatingVoucher ? 'Memproses...' : 'Terapkan'}
          </button>
        </div>
        {voucherError && (
          <div className="text-xs text-red-300 flex items-center gap-1 mt-1">
            {voucherError}
          </div>
        )}
        {validVoucher && (
          <div className="mt-2 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <span className="font-medium">{validVoucher.code}</span>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="text-xs text-blue-300">
                {validVoucher.discountType === 'PERCENTAGE'
                  ? `Diskon ${validVoucher.discountValue}%`
                  : `Diskon ${FormatPrice(validVoucher.discountValue)}`}
                {validVoucher.maxDiscount &&
                  validVoucher.discountType === 'PERCENTAGE' &&
                  ` (maks. ${FormatPrice(validVoucher.maxDiscount)})`}
              </div>
              {discountedAmount !== null && amount !== null && (
                <div className="text-right">
                  <div className="text-xs text-blue-300 line-through">
                    {FormatPrice(amount as number)}
                  </div>
                  <div className="text-sm font-medium text-green-400">
                    {FormatPrice(discountedAmount)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Komponen PaymentMethods */}
      <PaymentMethods
        amount={displayAmount || 0}
        paymentTypes={paymentTypes}
        groupedMethods={groupedMethods}
        onSelectMethod={handleSelectMethod}
        selectedMethod={selectPayment}
      />

      {/* Dialog Pembayaran */}
      {selectPayment && (
        <DialogPayment amount={discountedAmount || amount || 0} />
      )}
    </section>
  );
}