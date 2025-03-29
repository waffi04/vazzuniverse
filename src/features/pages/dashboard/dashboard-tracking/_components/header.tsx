import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HeaderTrackingProps {
  onChange: (search: string) => void
}

export function HeaderTracking({ onChange }: HeaderTrackingProps) {
  return (
    <section className="flex w-full items-center justify-between">
      <h1 className="text-2xl font-semibold">Tracking Page</h1>
      <div className="flex space-x-2">
        <div className="relative flex items-center">
          <Input 
            onChange={(e) => onChange(e.target.value)} 
            placeholder="Masukkan No. Pembayaran"
            className="pr-10 w-full"
          />
          <Search 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" 
            size={20} 
          />
        </div>
      </div>
    </section>
  );
}