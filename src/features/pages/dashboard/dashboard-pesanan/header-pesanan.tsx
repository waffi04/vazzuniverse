import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarIcon, FilterIcon, SearchIcon, XIcon, ListIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Transaction } from '../recent-transactions';
import { ExportToExcel } from '@/hooks/use-exportToExcel';
import { formatDate } from '@/utils/formatPrice';

type StatusType = 'PAID' | 'PENDING' | 'FAILED' | "SUCCESS" | undefined;

type HeaderPesananProps = {
  onSetAll: (all: boolean) => void;
  data: Transaction[] | undefined;
  onSetPageSize: (pageSize: number) => void;
  onSearchChange: (term: string) => void;
  onStatusChange: (status: StatusType) => void;
  onDateRangeChange: (startDate: string | undefined, endDate: string | undefined) => void;
  pageSize?: number;
};

export function HeaderPesanan({
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  data,
  onSetAll,
  onSetPageSize,
  pageSize = 10
}: HeaderPesananProps) {
  // States
  const [searchInput, setSearchInput] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusType>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);
  const [activePageSize, setActivePageSize] = useState<number>(pageSize);

  // Helper functions
  const formatDateForInput = (date: Date | undefined) => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  };

  const getDateRangeDisplay = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'dd/MM/yy')} - ${format(endDate, 'dd/MM/yy')}`;
    }
    if (startDate) {
      return `From ${format(startDate, 'dd/MM/yy')}`;
    }
    if (endDate) {
      return `Until ${format(endDate, 'dd/MM/yy')}`;
    }
    return 'Date Range';
  };

  const updateDateRange = (start: Date | undefined, end: Date | undefined) => {
    const isActive = !!(start || end);
    setIsDateFilterActive(isActive);
    
    const formattedStart = start ? format(start, 'yyyy-MM-dd') : undefined;
    const formattedEnd = end ? format(end, 'yyyy-MM-dd') : undefined;
    onDateRangeChange(formattedStart, formattedEnd);
  };

  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = () => {
    onSearchChange(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearchChange('');
  };

  const handleFilterSelect = (status: StatusType) => {
    setActiveFilter(status);
    onStatusChange(status);
  };

  const handleDateChange = (type: 'start' | 'end', e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    
    if (type === 'start') {
      setStartDate(date);
      updateDateRange(date, endDate);
    } else {
      setEndDate(date);
      updateDateRange(startDate, date);
    }
  };

  const handleClearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setIsDateFilterActive(false);
    onDateRangeChange(undefined, undefined);
  };

  const handlePageSizeSelect = (size: number) => {
    setActivePageSize(size);
    onSetPageSize(size);
  };

  // Get export filename
  const getExportFilename = () => {
    const statusText = activeFilter || "ALL";
    const dateText = startDate || endDate 
      ? `${formatDate(startDate?.toISOString() || "", 'date-only')}-${formatDate(endDate?.toISOString() || "", 'date-only')}`
      : "all-dates";
    return `transactions-${statusText}-${dateText}`;
  };

  return (
    <section className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 mb-6">
      <h1 className="text-2xl font-bold text-card-foreground">Pesanan</h1>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Input
            placeholder="Cari pesanan..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pr-16"
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={handleSearchSubmit}
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Date Range Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant={isDateFilterActive ? "default" : "outline"}
              size="sm" 
              className="whitespace-nowrap"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span className="max-w-[120px] truncate">{getDateRangeDisplay()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="end">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Date Range</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={handleClearDateFilter}
                >
                  Clear
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="start-date" className="text-sm font-medium block mb-1">
                    Start Date
                  </label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formatDateForInput(startDate)}
                    onChange={(e) => handleDateChange('start', e)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="end-date" className="text-sm font-medium block mb-1">
                    End Date
                  </label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formatDateForInput(endDate)}
                    onChange={(e) => handleDateChange('end', e)}
                    min={startDate ? formatDateForInput(startDate) : ''}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={activeFilter ? 'default' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
            >
              <FilterIcon className="h-4 w-4 mr-2" />
              <span>{activeFilter || 'Filter'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleFilterSelect('PAID')}>PAID</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterSelect('PENDING')}>PENDING</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterSelect('SUCCESS')}>SUCCESS</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterSelect('FAILED')}>FAILED</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterSelect(undefined)}>Show All</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Page Size Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
            >
              <ListIcon className="h-4 w-4 mr-2" />
              <span>{activePageSize} per page</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handlePageSizeSelect(5)}>5 per page</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePageSizeSelect(10)}>10 per page</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePageSizeSelect(20)}>20 per page</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePageSizeSelect(50)}>50 per page</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePageSizeSelect(100)}>100 per page</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export Button */}

        <ExportToExcel 
          data={data as Transaction[]} 
          status={activeFilter || "ALL"} 
          date={getExportFilename()}
          onClick={()  => onSetAll(true)}
        />
      </div>
    </section>
  );
}