'use client';
import { useState, useEffect } from 'react';
import { HeaderPesanan } from './header-pesanan';
import { trpc } from '@/utils/trpc';
import { RecentTransactions } from '../recent-transactions';
import { PaginationSection } from './pagination-section';

// Main Dashboard Component
export function DashboardPesanan() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'PAID' | 'PENDING' | 'FAILED' | 'SUCCESS' | undefined
  >();
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize,setPageSize] = useState<number>(10);
  const [isAll,setIsAll]  = useState<boolean>(false)

  // Debounce search input by 1 second
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 1000);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, startDate, endDate]);

  // Handle date range changes
  const handleDateRangeChange = (start: string | undefined, end: string | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };  

  const { data: transactionsData, isLoading } =
    trpc.pembelian.getAll.useQuery({
      status: statusFilter,
      page: currentPage,
      limit: pageSize,
      searchTerm: debouncedSearchTerm,
      startDate: startDate,
      endDate: endDate,
      all : isAll
    });

  // Calculate total pages
  const totalItems = transactionsData?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <main className="container w-full mx-auto p-4">
      <HeaderPesanan
        data={transactionsData?.transactions ?? []}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onSetPageSize={setPageSize}
        onSetAll={setIsAll}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="py-8 text-center text-gray-500">
          Loading transactions...
        </div>
      )}

      {/* No results state */}
      {!isLoading &&
        transactionsData &&
        transactionsData.transactions.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No transactions found
          </div>
        )}

      {/* Results */}
      {!isLoading &&
        transactionsData &&
        transactionsData.transactions.length > 0 && (
          <>
            <div className="space-y-4 mb-6">
              <RecentTransactions data={transactionsData.transactions}/>
            </div>

            {/* Pagination controls */}
            <PaginationSection 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />

            <div className="text-center text-sm text-gray-500 mt-2">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{' '}
              transactions
            </div>
          </>
        )}
    </main>
  );
}