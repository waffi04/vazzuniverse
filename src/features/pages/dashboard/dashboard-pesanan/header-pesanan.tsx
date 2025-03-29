import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DownloadIcon, FilterIcon, SearchIcon, XIcon, CalendarIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

export function HeaderPesanan({
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
}: {
  onSearchChange: (term: string) => void;
  onStatusChange: (status: 'PAID' | 'PENDING' | 'FAILED' | "SUCCESS" | undefined) => void;
  onDateRangeChange: (startDate: string | undefined, endDate: string | undefined) => void;
  // data : TransactionPesan[]  | undefined
}) {
  const [searchInput, setSearchInput] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Handle search submission
  const handleSearchSubmit = () => {
    onSearchChange(searchInput);
  };

  // Handle filter selection
  const handleFilterSelect = (
    status: 'PAID' | 'PENDING' | 'FAILED' | "SUCCESS" | undefined
  ) => {
    setActiveFilter(status);
    onStatusChange(status);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput('');
    onSearchChange('');
  };

  // Handle date changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    setStartDate(date);
    updateDateRange(date, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    setEndDate(date);
    updateDateRange(startDate, date);
  };

  // Update date range and notify parent component
  const updateDateRange = (start: Date | undefined, end: Date | undefined) => {
    if (start || end) {
      setIsDateFilterActive(true);
      const formattedStartDate = start ? format(start, 'yyyy-MM-dd') : undefined;
      const formattedEndDate = end ? format(end, 'yyyy-MM-dd') : undefined;
      onDateRangeChange(formattedStartDate, formattedEndDate);
    } else {
      setIsDateFilterActive(false);
      onDateRangeChange(undefined, undefined);
    }
  };

  // Clear date filter
  const handleClearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setIsDateFilterActive(false);
    onDateRangeChange(undefined, undefined);
  };

  // Format date range for display
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

  // Format date for input value
  const formatDateForInput = (date: Date | undefined) => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  };

  return (
    <section className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4 mb-6">
      <h1 className="text-2xl font-bold text-card-foreground">Pesanan</h1>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
        {/* Search input with button */}
        <div className="relative w-full md:w-auto flex items-center">
          <Input
            placeholder="Cari pesanan..."
            value={searchInput}
            onChange={handleSearchChange}
            className="pr-8 w-full"
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-10 text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1"
            onClick={handleSearchSubmit}
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant={isDateFilterActive ? "default" : "outline"}
                size="sm" 
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="max-w-[150px] truncate">{getDateRangeDisplay()}</span>
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
                      onChange={handleStartDateChange}
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
                      onChange={handleEndDateChange}
                      min={startDate ? formatDateForInput(startDate) : ''}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={activeFilter ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              <FilterIcon className="h-4 w-4" />
              <span>{activeFilter || 'Filter'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleFilterSelect('PAID')}>
              PAID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterSelect('PENDING')}>
              PENDING
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterSelect('SUCCESS')}>
              SUCCESS
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterSelect('FAILED')}>
              FAILED
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterSelect(undefined)}>
              Show All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}