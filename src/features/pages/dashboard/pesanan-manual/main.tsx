'use client';
import { useEffect, useState } from 'react';
import { HeaderOrderManual } from './header-order-manual';
import { trpc } from '@/utils/trpc';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, FormatPrice } from '@/utils/formatPrice';
import { getStatusBadge } from '@/utils/getStatusActive';

export function PesananManual() {
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    'PAID' | 'PENDING' | 'FAILED' | undefined
  >();
  const {data}   = trpc.order.getManualOrders.useQuery({})
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setCurrentPage(1);
    }, 1000);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  
  return (
    <main className="min-h-screen p-8 space-y-6">
      {/* header */}
      <HeaderOrderManual
        onChange={setSearchInput}
        onStatusChange={setStatusFilter}
        statusFilter={statusFilter}
      />

      
    </main>
  );
}
