'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  Plus,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, FormatPrice } from '@/utils/formatPrice';
import { trpc } from '@/utils/trpc';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SelectPayment } from './components/selectPayment';
import axios from 'axios';
import { toast } from 'sonner';
import PendingTransaction from './components/pendingTransaction';

export function UserTopUp() {
  const [amount, setAmount] = useState<string>('');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setIsLoading] = useState(false);

  // Fetch deposits data
  const { data: depositsData, isLoading: depositsLoading } =
    trpc.deposits.getByUsername.useQuery();
  const deposits = depositsData?.data?.history || [];
  const user = depositsData?.data?.user 

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };

  // Handle top-up initiation
  const handleTopUp = () => {
    if (amount && parseInt(amount) > 0) {
      setShowPaymentMethods(true);
    }
  };

  // Handle payment method selection
  const handleMethodSelect = (methodId: number, code: string) => {
    setSelectedMethodId(methodId);
    setCode(code);
  };

  // Handle back to amount selection
  const handleBackToAmount = () => {
    setShowPaymentMethods(false);
    setSelectedMethodId(null);
  };

  // Handle the actual top-up process
  const handleDeposit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/deposit', {
        code,
        amount: parseInt(amount),
      });
      toast.success('Deposit Dalam Status Pending', {
        description: `Anda berhasil menambahkan Rp ${FormatPrice(parseInt(amount))}`,
        duration: 3000,
      });
      // Reset state after successful deposit
      setShowPaymentMethods(false);
      setAmount('');
      setSelectedMethodId(null);
    } catch (error) {
      console.error(error)
      toast.error('Gagal Melakukan Deposit', {
        description: 'Silakan coba lagi atau hubungi customer service',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Predefined top-up amounts with more granular options
  const predefinedAmounts = [25000, 50000, 100000, 250000, 500000, 1000000];

  // Loading overlay
  if (loading || depositsLoading) {
    return (
      <div className="fixed inset-0 bg-[#001435]/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-400" />
          <p className="text-xl font-semibold text-white">Sedang Memproses...</p>
          <p className="text-sm text-blue-200">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 min-h-screen max-w-xl relative bg-[#001435] text-white">
      {/* Saldo Section with Enhanced Design */}
      <Card className="mb-8 shadow-lg bg-white/5 border border-white/10">
        <CardHeader className="pb-3 bg-white/10 rounded-t-xl">
          <CardTitle className="text-2xl flex items-center gap-3 text-blue-300">
            <Wallet className="h-7 w-7" />
            Saldo Anda
          </CardTitle>
          <CardDescription className="text-blue-200">
            Total saldo yang tersedia untuk digunakan
          </CardDescription>
        </CardHeader>
        <CardContent className="py-4 bg-white/5 rounded-b-xl">
          <p className="text-4xl font-bold text-green-400">
            {FormatPrice(user?.balance || 0)}
          </p>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      {showPaymentMethods ? (
        <PaymentMethodSection
          onBack={handleBackToAmount}
          onSelect={handleMethodSelect}
          onSubmit={handleDeposit}
          selectedMethodId={selectedMethodId}
          amount={parseInt(amount)}
          loading={loading}
        />
      ) : (
        <Tabs defaultValue="topup" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger 
              value="topup" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300"
            >
              Top Up
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-300"
            >
              Riwayat
            </TabsTrigger>
          </TabsList>

          {/* Top-Up Tab */}
          <TabsContent value="topup" className="space-y-6 mt-6">
            <h3 className="text-xl font-semibold text-blue-200">Pilih Nominal Top Up</h3>

            {/* Predefined Amounts with Better Grid */}
            <div className="grid grid-cols-3 gap-3">
              {predefinedAmounts.map((preAmount) => (
                <Button
                  key={preAmount}
                  variant={amount === preAmount.toString() ? 'default' : 'outline'}
                  className={`h-16 rounded-xl shadow-sm transition-all 
                    ${amount === preAmount.toString() 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white/10 text-blue-300 border-white/20 hover:bg-white/20'}`}
                  onClick={() => setAmount(preAmount.toString())}
                >
                  {FormatPrice(preAmount)}
                </Button>
              ))}
            </div>

            {/* Custom Amount */}
            <CustomAmountInput
              amount={amount}
              onChange={handleAmountChange}
              onSubmit={handleTopUp}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <PendingTransaction data={deposits} />
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}

// Payment Method Section - Enhanced Design
function PaymentMethodSection({
  onBack,
  onSelect,
  onSubmit,
  selectedMethodId,
  amount,
  loading,
}: {
  onBack: () => void;
  onSelect: (methodId: number, code: string) => void;
  onSubmit: () => void;
  selectedMethodId: number | null;
  amount: number;
  loading: boolean;
}) {
  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="p-2 h-10 w-10 rounded-full bg-white/10 border-white/20 text-blue-300 hover:bg-white/20"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-blue-200">
          Pilih Metode Pembayaran
        </h2>
      </div>
      <TooltipProvider>
        <SelectPayment amount={amount} onMethodSelect={onSelect} />
      </TooltipProvider>
      {selectedMethodId && (
        <div className="mt-6">
          <Button
            className="w-full rounded-xl py-3 text-base bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
            onClick={onSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Memproses...
              </>
            ) : (
              'Lanjutkan Pembayaran'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Custom Amount Input Section - Improved Design
function CustomAmountInput({
  amount,
  onChange,
  onSubmit,
}: {
  amount: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-3">
      <Label htmlFor="custom-amount" className="text-blue-200">
        Nominal Lainnya
      </Label>
      <div className="flex gap-3">
        <Input
          id="custom-amount"
          type="text"
          placeholder="Masukkan nominal"
          value={amount}
          onChange={onChange}
          className="rounded-xl py-3 text-base bg-white/10 border-white/20 text-white placeholder-blue-300 focus:border-blue-500"
        />
        <Button 
          onClick={onSubmit} 
          disabled={!amount || parseInt(amount) <= 0}
          className="rounded-xl px-6 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-5 w-5" /> Top Up
        </Button>
      </div>
    </div>
  );
}