import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
} from 'lucide-react';
import { JSX } from 'react';
import { Voucher } from '@/types/voucher';
import { formatDate, FormatPrice } from '@/utils/formatPrice';
import { VoucherForm } from './voucher-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeleteDialogVoucher } from './dialog/delete-dialog';

interface VoucherTableProps {
  vouchers: Voucher[];
}

export function VoucherTable({ vouchers }: VoucherTableProps): JSX.Element {
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsFormOpen(true);
  };

  const handleDelete = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsDeleteOpen(true);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const getUsageProgress = (voucher: Voucher) => {
    if (voucher.usageLimit === 0 || !voucher.usageLimit) {
      return 0;
    }
    return (voucher.usageCount / voucher.usageLimit) * 100;
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Min Purchase</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers?.map((voucher) => (
              <TableRow key={voucher.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{voucher.code}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(voucher.code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{voucher.description}</p>
                </TableCell>
                <TableCell>
                  {voucher.discountValue}
                  {voucher.discountType === 'PERCENTAGE' && '%' }
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    <div>Start: {formatDate(voucher.startDate, "date-only")}</div>
                    <div>End: {formatDate(voucher.expiryDate, "date-only")}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {voucher.minPurchase ? FormatPrice(voucher.minPurchase) : '-'}
                </TableCell>
                <TableCell>
                  {voucher.usageLimit ? (
                    <div className="space-y-1">
                      <div className="text-xs">
                        {voucher.usageCount} / {voucher.usageLimit}
                      </div>
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${voucher.isActive ? 'bg-primary' : 'bg-muted-foreground/50'}`}
                          style={{ width: `${getUsageProgress(voucher)}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    'Unlimited'
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={voucher.isActive ? 'default' : 'outline'}
                  >
                    {voucher.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="capitalize">
                      {voucher.discountType.toLowerCase()}
                    </Badge>
                    {voucher.isForAllCategories ? (
                      <Badge variant="secondary" className="text-xs">All categories</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Specific categories</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(voucher)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(voucher)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete voucher
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedVoucher && isFormOpen && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Voucher</DialogTitle>
              <DialogDescription>Update Voucher</DialogDescription>
            </DialogHeader>
            <VoucherForm
              initialData={selectedVoucher}
              onSuccess={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {selectedVoucher && isDeleteOpen && (
        <DeleteDialogVoucher 
          id={selectedVoucher.id} 
          kode={selectedVoucher.code} 
          onClose={() => setIsDeleteOpen(false)} 
          open={isDeleteOpen} 
          onOpen={() => setIsDeleteOpen(true)}
        />
      )}
    </>
  );
}