'use client';

import { useEffect, useState } from 'react';
import { HeaderVoucher } from './header-voucher';
import { trpc } from '@/utils/trpc';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag } from 'lucide-react';
import {VoucherTable} from './voucher-table';
import { VoucherTableSkeleton } from '@/components/ui/skeleton/voucher_skeleton';

export function VoucherPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const { data, isLoading } = trpc.voucher.getAll.useQuery({
    code: debouncedSearchTerm,
    category: activeTab,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <HeaderVoucher
        onChange={handleSearchChange}
        setActiveTab={setActiveTab}
      />

      <div className="m-8">
        {isLoading ? ( <VoucherTableSkeleton />
        ) : data && data.length > 0 ? (
  
              <VoucherTable vouchers={data} />
            
        ) : (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No vouchers found</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : 'There are no available vouchers at the moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
