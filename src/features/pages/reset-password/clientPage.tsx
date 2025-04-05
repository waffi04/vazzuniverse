"use client"

import type React from "react"
import { useState } from "react"
import { useId } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearchParams, useRouter } from "next/navigation"
import { trpc } from "@/utils/trpc"
import { toast } from "sonner"

export function ResetPassword({token}  : {token : string}) {
  const router = useRouter();
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")


  const { mutate: resetPasswordMutate, isLoading } = trpc.whatsapp.newPass.useMutation();

  const passwordHintId = useId() 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Password tidak sama")
      return
    }

    if (password.length < 6) {
      setError("Password harus minimal 6 karakter")
      return
    }

    setError("")
    
    resetPasswordMutate(
      {
        token,
        password,
        retypePassword: confirmPassword
      },
      {
        onSuccess: (response) => {
          if (response.status) {
            toast.success("Password berhasil diubah");
            setTimeout(() => {
              router.push("/auth/login");
            }, 2000);
          } else {
            toast.error(response.message || "Gagal mengubah password");
          }
        },
        onError: (error) => {
          toast.error("Terjadi kesalahan, silahkan coba lagi");
        }
      }
    );
  }

  if (!token) {
    return (
      <main className="flex justify-center items-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link Tidak Valid</CardTitle>
            <CardDescription>Link reset password tidak valid atau sudah kadaluarsa</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/auth/forgot-password")}>
              Kembali ke Lupa Password
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Buat password baru untuk akun Anda</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-password">Password Baru</Label>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={passwordHintId}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Sembunyikan password" : "Tampilkan password"}</span>
                </Button>
              </div>
              <p id={passwordHintId} className="text-sm text-muted-foreground">
                Password harus minimal 6 karakter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  <span className="sr-only">{showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}</span>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Reset Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}