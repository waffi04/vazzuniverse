"use client"

import type { JSX } from "react"
import { FormatPrice } from "@/utils/formatPrice"
import type { PlansProps } from "@/types/category"
import { trpc } from "@/utils/trpc"

interface CalculatePriceProps {
  priceFlashSale: number
  price: number
  pricePlatinum: number
  isUserPlatinum: boolean
  isFlashSale: boolean
}

function CalculatePrice({
  price,
  priceFlashSale,
  pricePlatinum,
  isUserPlatinum,
  isFlashSale
}: CalculatePriceProps): number {
  if (isUserPlatinum) {
    return Math.min(isFlashSale ? priceFlashSale : price, pricePlatinum)
  } else if (isFlashSale) {
    return priceFlashSale 
  } else {
    return price
  }
}

export function PlansOrder({
  plan,
  onSelect,
  isSelected,
}: {
  plan: PlansProps
  onSelect: (select: PlansProps) => void
  isSelected?: boolean
}): JSX.Element {
  const { data: userData, isLoading } = trpc.member.findMe.useQuery();
  const isUserPlatinum = userData?.role === "Platinum" as string
  
  const price = CalculatePrice({
    price: plan.harga,
    priceFlashSale: plan.hargaFlashSale || plan.harga, 
    pricePlatinum: plan.hargaPlatinum || plan.harga,  
    isUserPlatinum: isUserPlatinum || false,
    isFlashSale: plan.isFlashSale || false
  });

  return (
    <section
      onClick={() =>
        onSelect({
          ...plan,
          harga: price, 
        })
      }
      className={`cursor-pointer rounded-xl border transition-all duration-300 relative overflow-hidden ${
        isSelected
          ? "bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 shadow-lg shadow-blue-900/30"
          : "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-blue-500 hover:shadow-md hover:shadow-blue-900/20"
      }`}
    >
      {/* Flash Sale Badge */}
      {(plan.isFlashSale && !isUserPlatinum) && (
        <div className="absolute -top-1 -right-8 transform rotate-45 bg-red-500 text-white text-xs py-1 px-8 font-bold">
          SALE
        </div>
      )}

      {/* Fixed: Proper condition checking for Platinum badge */}
      {(isUserPlatinum && plan.hargaPlatinum && plan.hargaPlatinum < (plan.isFlashSale ? plan.hargaFlashSale || plan.harga : plan.harga)) && (
        <div className="absolute -top-1 -right-8 transform rotate-45 bg-purple-500 text-white text-xs py-1 px-8 font-bold">
          PLATINUM
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Service Name */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 ${isSelected ? "text-blue-200" : "text-blue-400"}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 1L1 5l11 4 11-4-11-4zM1 12l3-1v6l8 3 8-3v-6l3 1V5L12 9 1 5v7z" />
            </svg>
            <h3 className={`font-medium text-sm ${isSelected ? "text-white" : "text-gray-200"}`}>
              {plan.layanan}
            </h3>
          </div>       
        </div>

        {/* Price Section */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-400">Harga</p>
            <div className="flex items-center gap-2">
              {/* Updated condition for displaying strikethrough price */}
              {((plan.isFlashSale && plan.hargaFlashSale && plan.hargaFlashSale < plan.harga) || 
                (isUserPlatinum && plan.hargaPlatinum && plan.hargaPlatinum < plan.harga)) && (
                <span className="text-xs text-gray-400 line-through">
                  {FormatPrice(plan.harga)}
                </span>
              )}
              <p
                className={`font-semibold text-lg ${
                  isSelected 
                    ? "text-white" 
                    : (plan.isFlashSale && plan.hargaFlashSale && plan.hargaFlashSale < plan.harga) || 
                      (isUserPlatinum && plan.hargaPlatinum && plan.hargaPlatinum < plan.harga)
                      ? "text-purple-300" 
                      : "text-gray-200"
                }`}
              >
                {FormatPrice(price)}
              </p>
              <div 
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect({
                    ...plan,
                    harga: price,
                  })
                }}
                className={`size-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isSelected 
                    ? "bg-white" 
                    : "bg-blue-600/20 hover:bg-blue-500/50"
                }`}
              >
                {isSelected ? (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4 text-blue-600"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4 text-blue-300 opacity-50"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}