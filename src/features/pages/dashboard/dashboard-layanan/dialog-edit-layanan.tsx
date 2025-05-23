'use client';

import type React from 'react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import type { Layanan, layananFormSchema } from '@/types/layanans';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import FlashSaleForm from './form-flashsale';

interface DialogEditLayananProps {
  children: React.ReactNode;
  layanan: Layanan;
}

export function DialogEditLayanan({
  children,
  layanan,
}: DialogEditLayananProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const { mutate } = trpc.layanans.edit.useMutation();
  const form = useForm<z.infer<typeof layananFormSchema>>({
    defaultValues: {
      ...layanan,
    },
  });

  const handleFormSubmit = async (data: z.infer<typeof layananFormSchema>) => {
    try {
      mutate(data);
      setOpen(false);
      toast.success('success update layanan')
    } catch (error) {
      toast.error('layaanan gagal update')
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Layanan</DialogTitle>
          <DialogDescription>
            Ubah informasi layanan. Klik simpan setelah selesai.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
                <TabsTrigger value="pricing">Harga & Profit</TabsTrigger>
                <TabsTrigger value="flashsale">Flash Sale</TabsTrigger>
                <TabsTrigger value="additional">Tambahan</TabsTrigger>
              </TabsList>

              {/* Tab 1: Basic Information */}
              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="layanan"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Nama Layanan</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Nama Provider</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="col-span-2 flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Status</FormLabel>
                          <FormDescription>
                            Aktifkan atau nonaktifkan layanan
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <div></div>
                  <Button type="button" onClick={() => setActiveTab('pricing')}>
                    Selanjutnya
                  </Button>
                </div>
              </TabsContent>

              {/* Tab 2: Pricing & Profit */}
              <TabsContent value="pricing" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h3 className="text-lg font-medium">Informasi Harga</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="harga"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hargaReseller"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Reseller</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hargaPlatinum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Platinum</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hargaGold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Gold</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-2 mt-4">
                    <h3 className="text-lg font-medium">Informasi Profit</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="profit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profitReseller"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profit Reseller</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profitPlatinum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profit Platinum</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profitGold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profit Gold</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('basic')}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('flashsale')}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </TabsContent>

              {/* Tab 3: Flash Sale */}
              <TabsContent value="flashsale" className="space-y-4 py-4">
               <FlashSaleForm form={form}/>

                <div className="flex justify-between mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('pricing')}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('additional')}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </TabsContent>

              {/* Tab 4: Additional Information */}
              <TabsContent value="additional" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="catatan"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Catatan</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productLogo"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Logo Produk URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('flashsale')}
                  >
                    Sebelumnya
                  </Button>
                  <Button type="submit">Simpan Perubahan</Button>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
