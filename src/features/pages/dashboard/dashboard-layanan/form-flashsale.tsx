"use client"

import React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Upload, Eye, X } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { toast } from "sonner"

export interface FormProps {
  control: any
  watch: (name: string) => any
}

export default function FlashSaleForm({ form }: { form: FormProps }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState<boolean>(false)

  // Initialize preview from existing value
  React.useEffect(() => {
    const bannerUrl = form.watch("bannerFlashSale")
    if (bannerUrl && !imagePreview) {
      setImagePreview(bannerUrl)
    }
  }, [form.watch("bannerFlashSale"), imagePreview])

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: { onChange: (value: string | null) => void },
  ): Promise<void> => {
    e.preventDefault();
  e.stopPropagation(); 
    const file = e.target.files?.[0]
    if (!file) return
  
    // Show preview
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  
    setIsUploading(true)
    try {
      const imageUrl = await uploadToCloudinary(file)
      field.onChange(imageUrl) 
    } catch (error) {
    toast.error("failed to update")
    } finally {
      setIsUploading(false)
    }
  }

  const clearImage = (field: { onChange: (value: string | null) => void }) => {
    setImagePreview(null)
    field.onChange(null)
  }

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="isFlashSale"
          render={({ field }) => (
            <FormItem className="col-span-2 flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Flash Sale</FormLabel>
                <FormDescription>Aktifkan flash sale untuk layanan ini</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("isFlashSale") && (
          <>
            <FormField
              control={form.control}
              name="hargaFlashSale"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Harga Flash Sale</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="judulFlashSale"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Judul Flash Sale</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bannerFlashSale"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Banner Flash Sale</FormLabel>
                  <div className="space-y-3">
                    {imagePreview && (
                      <div className="relative w-full rounded-md overflow-hidden border">
                        <div className="flex items-center justify-between p-2 bg-muted/50">
                          <span className="text-sm font-medium">Preview Banner</span>
                          <div className="flex gap-2">
                            <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                              <DialogTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Lihat gambar</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[800px] p-0">
                                <DialogTitle className="p-6">Preview Banner Flash Sale</DialogTitle>
                                <div className="relative w-full max-h-[70vh] overflow-auto">
                                  <img
                                    src={imagePreview }
                                    alt="Banner preview full"
                                    className="w-full h-auto object-contain"
                                  />
                                </div>
                                <div className="p-4 flex justify-end">
                                  <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                      Tutup
                                    </Button>
                                  </DialogClose>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => clearImage(field)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Hapus gambar</span>
                            </Button>
                          </div>
                        </div>
                        <div className="h-40 overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 items-center">
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => {
                            const url = e.target.value || null
                            field.onChange(url)
                            if (url && url !== imagePreview) {
                              setImagePreview(url)
                            }
                          }}
                          placeholder="URL Banner"
                          className="flex-1"
                        />
                      </FormControl>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleImageUpload(e, field)}
                          disabled={isUploading}
                        />
                        <Button type="button" variant="outline" disabled={isUploading}>
                          {isUploading ? (
                            "Uploading..."
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiredFlashSale"
              render={({ field }) => (
                <FormItem className="col-span-2 flex flex-col">
                  <FormLabel>Tanggal Berakhir Flash Sale</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(new Date(field.value), "PPP") : <span>Pilih tanggal</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <input
                        type="date"
                        value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                          const selectedDate = e.target.value
                          field.onChange(selectedDate ? new Date(selectedDate).toISOString() : null)
                        }}
                        className="p-2 border rounded-md"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </div>
  )
}

