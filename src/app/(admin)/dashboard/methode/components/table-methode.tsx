"use client"

import { useState } from "react"
import { Eye, Pencil, Trash2, CreditCard, Wallet, Building } from "lucide-react"
import { format } from "date-fns"
import type { PaymentMethod } from "@/types/payment"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DialogMethod } from "./dialog-methode"

interface TableMethodeProps {
  data: PaymentMethod[]
}

export default function TableMethode({ data }: TableMethodeProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)

  // Function to get payment type icon
  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case "bank_transfer":
        return <Building className="h-4 w-4 mr-1" />
      case "ewallet":
        return <Wallet className="h-4 w-4 mr-1" />
      default:
        return <CreditCard className="h-4 w-4 mr-1" />
    }
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  // Function to handle delete (placeholder)
  const handleDelete = (id: number) => {
    console.log(`Delete payment method with ID: ${id}`)
    // Add your delete logic here
  }

  // Function to handle edit (placeholder)


  // Function to handle view details (placeholder)
  const handleViewDetails = (method: PaymentMethod) => {
    setSelectedMethod(method)
    // Add your view details logic here
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Manage your available payment methods</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Code</TableHead>
                <TableHead className="min-w-[180px]">Method</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Min Amount</TableHead>
                <TableHead className="hidden lg:table-cell">Expiry (hrs)</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">{method.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={method.images} alt={method.name} />
                        <AvatarFallback>{method.code}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">
                          Updated {formatDate(method.updatedAt as string)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      {getPaymentTypeIcon(method.tipe)}
                      <span className="capitalize">{method.tipe.replace("_", " ")}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {method.min
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(method.min)
                      : "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {method.minExpired === method.maxExpired
                      ? method.minExpired
                      : `${method.minExpired} - ${method.maxExpired}`}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge >
                      {method.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleViewDetails(method)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Payment Method Details</DialogTitle>
                            <DialogDescription>Detailed information about this payment method.</DialogDescription>
                          </DialogHeader>
                          {selectedMethod && (
                            <div className="grid gap-4 py-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={selectedMethod.images} alt={selectedMethod.name} />
                                  <AvatarFallback>{selectedMethod.code}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-lg">{selectedMethod.name}</h3>
                                  <p className="text-sm text-muted-foreground">Code: {selectedMethod.code}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                <div>
                                  <p className="text-sm font-medium">Type</p>
                                  <p className="text-sm capitalize">{selectedMethod.tipe.replace("_", " ")}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Status</p>
                                  <Badge >
                                    {selectedMethod.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Min Amount</p>
                                  <p className="text-sm">
                                    {selectedMethod.min
                                      ? new Intl.NumberFormat("id-ID", {
                                          style: "currency",
                                          currency: "IDR",
                                          minimumFractionDigits: 0,
                                        }).format(selectedMethod.min)
                                      : "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Max Amount</p>
                                  <p className="text-sm">
                                    {selectedMethod.max
                                      ? new Intl.NumberFormat("id-ID", {
                                          style: "currency",
                                          currency: "IDR",
                                          minimumFractionDigits: 0,
                                        }).format(selectedMethod.max)
                                      : "Unlimited"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Min Expiry</p>
                                  <p className="text-sm">{selectedMethod.minExpired} hours</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Max Expiry</p>
                                  <p className="text-sm">{selectedMethod.maxExpired} hours</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-sm font-medium">Description</p>
                                  <p className="text-sm">{selectedMethod.keterangan || "-"}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-sm font-medium">Created At</p>
                                  <p className="text-sm">{formatDate(selectedMethod.createdAt as string)}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-sm font-medium">Last Updated</p>
                                  <p className="text-sm">{formatDate(selectedMethod.updatedAt as string)}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                          <DialogMethod data={method}>
                                <Button variant="outline" size="icon" >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                        </DialogMethod>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Are you sure?</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(method.id)}>
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem>Cancel</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

