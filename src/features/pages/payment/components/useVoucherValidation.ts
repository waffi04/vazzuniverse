import { useState } from 'react';
import { trpc } from '@/utils/trpc'; // Sesuaikan path import
import { Voucher } from '@/types/voucher';

export function useVoucherValidation(amount: number) {
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [validVoucher, setValidVoucher] = useState<Voucher | null>(null);
  const [discountedAmount, setDiscountedAmount] = useState<number | null>(null);

  const validateVoucherMutation = trpc.voucher.validateVoucher.useMutation({
    onSuccess: (data) => {
      // Reset error state
      setVoucherError(null);
      
      // Validate voucher before processing
      if (!data) {
        setValidVoucher(null);
        setDiscountedAmount(null);
        return;
      }

      // Calculate discount
      const calculateDiscount = () => {
        if (!amount) return null;

        let discount = 0;
        
        // Percentage discount
        if (data.discountType === 'PERCENTAGE') {
          discount = (amount * data.discountValue) / 100;
          
          // Apply max discount cap if exists
          if (data.maxDiscount && discount > data.maxDiscount) {
            discount = data.maxDiscount;
          }
        } 
        // Fixed amount discount
        else {
          discount = data.discountValue;
        }

        // Ensure discount doesn't exceed total amount
        return Math.min(discount, amount);
      };

      const calculatedDiscount = calculateDiscount();
      
      // Update states
      setValidVoucher(data);
      setDiscountedAmount(calculatedDiscount ? amount - calculatedDiscount : null);
      setIsValidatingVoucher(false);
    },

    onError: (error) => {
      // Reset all states on error
      setVoucherError(error.message);
      setValidVoucher(null);
      setDiscountedAmount(null);
      setIsValidatingVoucher(false);
    },
  });

  return {
    validateVoucherMutation,
    isValidatingVoucher,
    voucherError,
    setDiscountedAmount,
    setVoucherError,
    setIsValidatingVoucher,
    validVoucher,
    setValidVoucher,
    discountedAmount
  };
}
