export function GenerateRandomNumber(): number {
    return Math.floor(Math.random() * 1_000_000);
}
export function ForgotPasswordMessagesWa(otp : string): string {
    return `Kode Verifikasi Anda adalah: ${otp}`;
}

