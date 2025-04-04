"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { trpc } from "@/utils/trpc"
import { type ReactNode, useState } from "react"
import { CreditCard, Loader2 } from "lucide-react"
import Image from "next/image"
import axios from "axios"
import { toast } from "sonner"

export interface PaymentMethod {
  name: string
  id: number
  tipe: string
  createdAt: string | null
  updatedAt: string | null
  code: string
  images: string
  keterangan: string
  min: number | null
  typeTax: string | null
  taxAdmin: number | null
  minExpired: number | null
  maxExpired: number | null
  max: number | null
  isActive: boolean
}

export function DialogPayment({ children, amount }: { children: ReactNode; amount: number }) {
  const { data, isLoading } = trpc.methods.getMethods.useQuery({ isActive: true })
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [loading,setLoading]  = useState(false)

  // Format currency to Indonesian Rupiah
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Handle payment submission
  const handlePayment = async (methodcode : string) => {
    setLoading(true)
    try {
        const payload = {
            code : methodcode,
            amount
        }
        await axios.post('/api/membership',payload)
        toast.success('Deposit Dalam Status Pending', {
                description: `Anda berhasil menambahkan Rp ${100000}`,
              });
    } catch (error) {
        toast.error('Terjadi Kesalahan ,Silahkan Hubungi Admin');
    }finally{
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg" style={{ background: "hsl(219, 100%, 15%)" }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white mb-2">Pilih Metode Pembayaran</DialogTitle>
          <p className="text-gray-300 text-sm">
            Total pembayaran: <span className="font-bold text-white">{formatCurrency(amount)}</span>
          </p>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              <span className="ml-2 text-gray-300">Memuat metode pembayaran...</span>
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-300">Tidak ada metode pembayaran tersedia</p>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
              {data.data.map((method) => (
                <Card
                  key={method.id}
                  className={`border ${selectedMethod === method.code ? "border-yellow-500" : "border-gray-700"} 
                             bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer`}
                  onClick={() => setSelectedMethod(method.code)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-3 flex-1">
                        {method.images && (
                          <div className="h-10 w-16 relative bg-white rounded flex items-center justify-center p-1">
                            <Image
                              src={method.images}
                              alt={method.name}
                              width={60}
                              height={40}
                              className="object-contain"
                            
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-white">{method.name}</p>
                          <p className="text-xs text-gray-400">{method.keterangan}</p>
                        </div>
                       
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-4 bg-gray-700" />

        <div className="flex justify-end gap-3">
          <DialogTrigger asChild>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
              Batal
            </Button>
          </DialogTrigger>
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
            disabled={!selectedMethod || isLoading || loading}
            onClick={() => selectedMethod && handlePayment(selectedMethod)}
          >
            {
                loading ? "Loading....."  : "Bayar"
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

