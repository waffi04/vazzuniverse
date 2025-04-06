'use client';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatDate } from '@/utils/formatPrice';
interface PaymentDetails { 
  id: number; 
  createdAt: string | null; 
  updatedAt: string | null; 
  status: string; 
  harga: string; 
  orderId: string; 
  noPembayaran: string | null; 
  noPembeli: string; 
  metode: string; 
  reference: string | null; 
} 

export interface Transaction {
  id: number;
  orderId: string;
  username: string | null;
  layanan: string;
  profit : number
  harga: number;
  status: string;
  createdAt?: string | null;
  pembayaran: PaymentDetails | null
  log?: string | null;
  nickname : string | null
  updatedAt?: string | null;
  zone : string | null
  userId  : string | null
  successReportSended?: boolean;
}

interface RecentTransactionsProps {
  data: Transaction[] | undefined
}

export function RecentTransactions({ data }: RecentTransactionsProps) {
  if (!data?.length) {
    return (
      <div className="h-[200px] flex items-center justify-center border rounded-md">
        <p className="text-muted-foreground">No transactions available</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>No. Tujuan</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className='text-center'>No. Pembeli</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Status Pesanan</TableHead>
          <TableHead>Status Pembayaran</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">{transaction.orderId}</TableCell>
            <TableCell>{transaction.username || 'Anonymous'}</TableCell>
            <TableCell>{transaction.zone ? `${transaction.userId}-${transaction.zone}` : `${transaction.userId}`}</TableCell>
            <TableCell>{transaction.layanan}</TableCell>
            <TableCell>Rp {transaction.harga.toLocaleString()}</TableCell>
            <TableCell className='text-center'>{transaction.pembayaran?.noPembeli}</TableCell>
            <TableCell>{transaction.pembayaran?.metode || 'N/A'}</TableCell>
            <TableCell className='text-center'>
              <Badge 
                variant={
                  transaction.status.toUpperCase() === 'SUCCESS' ? 'default' :
                  transaction.status.toUpperCase() === 'PENDING' ? 'destructive' : 'destructive'
                }
              >
                {transaction.status}
              </Badge>
            </TableCell>
            <TableCell className='text-center'>
              <Badge 
                variant={
                  transaction.status === 'PAID' ? 'outline' :
                  transaction.status === 'FAILED' ? 'destructive' : 'destructive'
                }
              >
                {transaction.pembayaran?.status as string}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {formatDate(transaction.createdAt as string)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}