'use client';
import { trpc } from '@/utils/trpc';
import FlowProgress from './flow-number';
import { HeaderPaymentStatus } from './header';
import { useSearchParams } from 'next/navigation';
import { TransactionDetails } from './transaction';
import { TRANSACTION_FLOW } from '@/types/transaction';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

export function PaymentStatus() {
  const searchParams = useSearchParams();
  const merchantOrderId = searchParams.get('invoice');

  const {data, isLoading} = trpc.pembelian.getId.useQuery(
    { merchantOrderId },
    {
      enabled: !!merchantOrderId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 2,
      cacheTime: 1000 * 60 * 2,
    }
  )

  if (!merchantOrderId) {
    return <div>No invoice provided</div>
  }
  if(isLoading){
    return <LoadingOverlay />
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:p-8 max-w-7xl">
      <HeaderPaymentStatus status={data?.purchase.status as string} />
      <FlowProgress status={data?.purchase.status as TRANSACTION_FLOW} />
      {
        data?.purchase.username && data.purchase.status === "FAILED" && (
          <Information />
        )
      }
      {data && (
        <TransactionDetails
          data={data.purchase as Transaksi}
        />
      )}
    </main>
  );
}


function Information() {
  return (
    <div className="flex items-center justify-center w-full my-6 rounded-lg">
      <div className="flex items-center gap-4 p-4 sm:p-6 w-full max-w-3xl">
        <div className="flex-shrink-0">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-yellow-400"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-medium text-white">Transaksi Gagal</h3>
          <p className="text-blue-200">
            Transaksi gagal, saldo otomatis kembali menjadi <span className="font-bold text-yellow-400">Saldo Akun</span>
          </p>
        </div>
      </div>
    </div>
  );
}