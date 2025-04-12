"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { PlansOrder } from "./plans"
import { usePlansStore } from "@/hooks/use-select-plan"
import type { PlansProps, SubCategories } from "@/types/category"
import { ChevronDown, Package2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

interface OrderPageProps {
  plans: PlansProps[] | undefined
  subCategories: SubCategories[]
}

export function OrderPage({ plans, subCategories }: OrderPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<SubCategories | null>(null)
  const [filteredProducts, setFilteredProducts] = useState<PlansProps[]>([])
  const [effectiveSubCategories, setEffectiveSubCategories] = useState<SubCategories[]>([])
  const { selectPlans, setSelectPlans } = usePlansStore()
  const defaultAllCategory = useMemo(
    () => ({
      name: "All",
      id: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      code: "all",
      categoryId: 0,
      active: true,
    }),
    [],
  )

  useEffect(() => {
    if (!subCategories || subCategories.length === 0) {
      setEffectiveSubCategories([defaultAllCategory])
      return
    }

    setEffectiveSubCategories([defaultAllCategory, ...subCategories])
  }, [subCategories, defaultAllCategory])

  useEffect(() => {
    if (effectiveSubCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(effectiveSubCategories[0])
    }
  }, [effectiveSubCategories, selectedCategory])

  useEffect(() => {
    if (!selectedCategory || !Array.isArray(plans)) {
      return
    }

    let filtered: PlansProps[] = []
    if (selectedCategory.id === 0 || selectedCategory.code === "all") {
      filtered = [...(plans || [])]
    } else {
      const categoryCode = selectedCategory.code?.toLowerCase()

      filtered = plans.filter((plan) => {
        if (Number(plan.subCategoryId) === selectedCategory.id) {
          return true
        }

        const productCode = plan.providerId?.toLowerCase() || ""
        const match = productCode.match(/^([a-z]+)/)
        const basePrefix = match ? match[0] : productCode

        return basePrefix === categoryCode
      })
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, plans])

  // Handler for category selection
  const handleCategoryChange = (category: SubCategories) => {
    setSelectedCategory(category)
    setSelectPlans(null)
  }

  // Handler for plan selection
  const handleSelect = (plan: PlansProps) => {
    setSelectPlans(plan)
  }

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm rounded-xl p-5 sm:p-7 border border-blue-700/30 shadow-lg space-y-5 transition-all duration-300">
      {/* Header section with improved styling */}
      <div className="flex items-center gap-2 border-b border-blue-700/20 pb-4">
        <Package2 className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Pilih Package</h2>
      </div>

      {effectiveSubCategories.length > 0 && (
        <>
          {/* Mobile dropdown view */}
          <div className="md:hidden w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 
                  text-white font-medium shadow-md border border-blue-500/30 justify-between transition-all duration-300"
                >
                  {selectedCategory?.name || "Select Category"}
                  <ChevronDown className="ml-2 h-4 w-4 text-blue-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[200px] bg-gradient-to-b from-blue-900 to-blue-950 border border-blue-700/50 shadow-xl rounded-lg p-1"
                align="center"
              >
                {effectiveSubCategories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    className={`text-white text-sm rounded-md my-1 px-3 py-2.5 hover:bg-blue-700/50 focus:bg-blue-700/50 transition-colors duration-200 ${
                      selectedCategory?.code === category.code
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 font-medium"
                        : ""
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop buttons view with improved styling */}
          <div className="hidden md:flex flex-wrap gap-2">
            {effectiveSubCategories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className={`
                  rounded-full px-4 py-2 transition-all duration-200 hover:scale-105
                  ${
                    selectedCategory?.code === category.code
                      ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white font-medium shadow-md border-none"
                      : "bg-blue-900/40 text-blue-100 hover:bg-blue-800/60 border border-blue-700/30"
                  }
                `}
                onClick={() => handleCategoryChange(category)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </>
      )}

      {/* Product grid with animation */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.isArray(filteredProducts) && filteredProducts.length > 0 ? (
          filteredProducts.map((plan, idx) => (
            <motion.div
              key={`${plan.providerId || plan.id}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <PlansOrder
                plan={plan}
                onSelect={handleSelect}
                isSelected={selectPlans?.providerId === plan.providerId}
              />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex justify-center py-8">
            <div className="bg-blue-900/30 rounded-lg p-4 text-center max-w-md border border-blue-700/30">
              <p className="text-blue-200">No products available for this category</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

