"use client"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, ExternalLink, Info, LogOut, Star, Zap } from "lucide-react"
import { DialogPayment } from "./dialog-Payment"
import { trpc } from "@/utils/trpc"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { toast } from "sonner"

export default function Membership() {
  const { data } = trpc.member.findMembership.useQuery()
  const { data: userData } = trpc.member.findMe.useQuery()

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm")
    } catch (error) {
      return dateString
    }
  }

  const isUrlPayment = (method: string) => {
    return ["QRIS", "DANA", "ShopeePay", "OVO"].includes(method)
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 text-xs flex items-center">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      case "SUCCESS":
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/20 text-xs flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" /> Success
        </Badge>
      case "FAILED":
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/20 text-xs flex items-center">Failed</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/20 text-xs flex items-center">{status}</Badge>
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Keanggotaan</h1>
        <p className="text-gray-300 text-sm mt-1">Tingkatkan akun Anda untuk mengakses fitur premium</p>
      </div>

      <Alert className="mb-6 border-blue-500/50 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertTitle className="text-blue-400 text-sm font-medium">Penting</AlertTitle>
        <AlertDescription className="text-blue-300 text-sm mt-1">
          Setelah membayar platinum, silakan keluar dan masuk kembali untuk mengaktifkan semua fitur platinum.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="membership" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 bg-gray-800/50 rounded-lg">
          <TabsTrigger value="membership" className="text-sm font-medium">Platinum</TabsTrigger>
          <TabsTrigger value="history" className="text-sm font-medium">Riwayat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="membership">
          <div className="flex justify-center sm:justify-start">
            <Card className="shadow-xl border-0 overflow-hidden relative w-full sm:w-80 transform transition-all duration-300 hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, hsl(219, 100%, 15%), hsl(219, 100%, 10%))" }}>
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500"></div>
              
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 px-3 py-1">
                  <Star className="h-3 w-3 mr-1" /> Premium
                </Badge>
              </div>
              
              <CardHeader className="pt-6 pb-2 px-5">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                  <CardTitle className="text-xl font-bold text-white">Platinum</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="px-5 py-3">
                <div className="mb-4">
                  <p className="text-2xl font-bold text-white">Rp 100.000</p>
                  <p className="text-gray-400 text-sm mt-1">Pembayaran satu kali</p>
                </div>
                
                <div className="space-y-3 mt-4 border-t border-gray-700 pt-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                    <p className="text-sm text-gray-300">Dapatkan Harga terjangkau</p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                    <p className="text-sm text-gray-300">Dukungan prioritas</p>
                  </div>
                 
                </div>
              </CardContent>
              
              <CardFooter className="px-5 pb-6 pt-2">
                <div className="w-full">
                  <DialogPayment amount={100000}>
                    <Button 
                      disabled={userData && userData?.role === "Platinum"} 
                      className="w-full py-5 text-sm font-medium bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-black shadow-lg shadow-yellow-500/20 rounded-md transition-all"
                    >
                      {userData && userData?.role === "Platinum" 
                        ? "Anda Sudah Platinum" 
                        : "Order Sekarang"}
                    </Button>
                  </DialogPayment>
                  
                  <p className="mt-3 text-xs text-gray-400 text-center">
                    Setelah menyelesaikan pembayaran, silakan cek di tab <strong>Riwayat</strong>.
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>    
        
        <TabsContent value="history">
          {data?.data && data.data.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.data.map((item) => (
                <Card 
                  key={item.id} 
                  className="shadow-lg border-0 overflow-hidden transition-all duration-300 hover:shadow-xl" 
                  style={{ background: "linear-gradient(to bottom, hsl(219, 100%, 15%), hsl(219, 100%, 12%))" }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-sm font-medium">{item.depositId}</p>
                        <p className="text-gray-400 text-xs mt-1">{formatDate(item.createdAt)}</p>
                      </div>
                      <div>
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700/70">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-xs">Metode:</span>
                        <span className="text-white text-xs font-medium">{item.metode}</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-gray-400 text-xs">Jumlah:</span>
                        <span className="text-white text-xs font-medium">Rp {item.jumlah.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-gray-400 text-xs">No. Pembayaran:</span>
                        <span className="text-white text-xs font-medium truncate max-w-[120px]" title={item.noPembayaran}>
                          {item.noPembayaran}
                        </span>
                      </div>
                      
                      {item.status === "PENDING" && (
                        <div className="mt-3">
                          {isUrlPayment(item.metode) ? (
                            <a 
                              href={item.noPembayaran} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded transition-colors duration-200"
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Buka Link Pembayaran
                            </a>
                          ) : (
                            <Button 
                              className="w-full text-xs bg-blue-600 hover:bg-blue-700 h-9 transition-colors duration-200"
                              onClick={() => {
                                if (navigator.clipboard) {
                                  navigator.clipboard.writeText(item.noPembayaran)
                                    .then(() => toast.success("Nomor virtual account berhasil disalin!"))
                                    .catch(err => toast.error("Failed to copy: ", err));
                                } else {
                                  const textArea = document.createElement("textarea");
                                  textArea.value = item.noPembayaran;
                                  document.body.appendChild(textArea);
                                  textArea.select();
                                  document.execCommand("copy");
                                  document.body.removeChild(textArea);
                                  toast.success("Nomor virtual account berhasil disalin!");
                                }
                              }}
                            >
                              Salin Nomor VA
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg bg-gray-800/30">
              <Info className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Belum ada riwayat pembayaran</p>
              <p className="text-gray-500 text-xs mt-1">Riwayat pembayaran Anda akan ditampilkan di sini</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}