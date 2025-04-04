"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle, User, Send } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function FormPasswordReset() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [step, setStep] = useState("username"); 
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const { mutate, isLoading } = trpc.whatsapp.sendForgotMessages.useMutation();
  const { mutate: verifyOtpMutate, isLoading: isVerifying } = trpc.whatsapp.verifyOtp.useMutation();

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    mutate(
      { username },
      {
        onSuccess: (response) => {
          if (response.status) {
            setStep("verification");
            setIsVerificationSent(true);
            setTimeout(() => setIsVerificationSent(false), 3000);
            toast.success("Kode verifikasi telah dikirim ke WhatsApp Anda");
          } else {
            toast.error(response.message || "Gagal mengirim kode verifikasi");
          }
        },
        onError: (error) => {
          toast.error("Terjadi kesalahan, Silahkan Coba Lagi");
        },
      }
    );
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.length !== 6) return;

    verifyOtpMutate(
      { username, otp: verificationCode },
      {
        onSuccess: (response : {status : boolean, passwordlink : string, message : string}) => {
          if (response.status) {
            toast.success("Kode OTP berhasil diverifikasi!");
            if (response.passwordlink) {
              router.push(response.passwordlink);
            } else {
              toast.error("Link reset password tidak ditemukan");
            }
          } else {
            toast.error(response.message || "Gagal verifikasi OTP");
          }
        },
        onError: (error) => {
          toast.error("Terjadi kesalahan saat memverifikasi OTP");
        },
      }
    );
  };

  const handleResendCode = () => {
    if (!username.trim()) return;

    mutate(
      { username },
      {
        onSuccess: (response) => {
          if (response.status) {
            setIsVerificationSent(true);
            setTimeout(() => setIsVerificationSent(false), 3000);
            toast.success("Kode verifikasi telah dikirim ulang ke WhatsApp Anda");
          } else {
            toast.error(response.message || "Gagal mengirim ulang kode verifikasi");
          }
        },
        onError: (error) => {
          console.error("Error resending OTP:", error);
          toast.error("Terjadi kesalahan saat mengirim ulang kode verifikasi");
        },
      }
    );
  };

  const handleBack = () => {
    setStep("username");
    setVerificationCode("");
  };

  return (
    <main className="w-full min-h-screen flex justify-center items-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === "username" ? "Verifikasi Akun" : "Masukkan Kode Verifikasi"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === "username"
              ? "Masukkan username Anda untuk melanjutkan"
              : `Kami telah mengirim kode verifikasi ke WhatsApp untuk ${username}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "username" ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="Masukkan username Anda"
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Memeriksa..." : "Periksa"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Kode Verifikasi</Label>
                  <div className="relative">
                    <Input
                      id="verification-code"
                      placeholder="Masukkan kode 6 digit"
                      className="text-center text-lg tracking-widest"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={verificationCode.length !== 6 || isVerifying}>
                  {isVerifying ? "Memverifikasi..." : "Verifikasi Kode"}
                </Button>
              </form>

              <div className="flex flex-col items-center space-y-2">
                <div className="text-sm text-muted-foreground">Belum Menerima Kode Verifikasi?</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={isVerificationSent || isLoading}
                  className="flex items-center"
                >
                  {isVerificationSent ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Kode Terkirim!
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Kirim Ulang via WhatsApp
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="mt-2"
                >
                  Kembali ke Username
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}