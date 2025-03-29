"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronLeft, ChevronRight, CreditCard, DollarSign, Hash, Info, Percent, Tag, Timer } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { methodschema, type MethodSchemas } from "@/types/schema/method"
import { PaymentMethod } from "@/types/payment"
import { Switch } from "@/components/ui/switch"


const PAYMENT_TYPES = [
  "bank_transfer", 
  "qris", 
  "cstore", 
  "ovo", 
  "shopeepay"
] as const;

type PaymentType = typeof PAYMENT_TYPES[number];
type OptionTax = "PERCENTAGE" | "FLAT"
export function FormMethode({
    data, 
    onSubmit,
    isLoading
  }: {
    data?: PaymentMethod, 
    onSubmit: (values: MethodSchemas) => void,
    isLoading?: boolean
  }) {
  const [step, setStep] = useState(1)
  const totalSteps = 4

  const form = useForm<MethodSchemas>({
    resolver: zodResolver(methodschema),
    defaultValues: {
      code: data?.code ?? "",
      keterangan: data?.keterangan ?? "",
      maxExpired: data?.maxExpired  ?? undefined,
      images: data?.images ?? "",
      minExpired: data?.minExpired ?? undefined,
      min: data?.min ?? undefined,
      max: data?.max ?? undefined,
      isActive : data?.isActive ?? true,
      tipe: data?.tipe ?? "",
      typeTax: data?.typeTax as OptionTax ?? undefined,
      name: data?.name ??  "",
      taxAdmin: data?.taxAdmin ?? undefined,
    },
    mode: "onChange",
  })



  const nextStep = async () => {
    let fieldsToValidate: (keyof MethodSchemas)[] = []

    switch (step) {
      case 1:
        fieldsToValidate = ["code", "name"]
        break
      case 2:
        fieldsToValidate = ["typeTax", "taxAdmin"]
        break
      case 3:
        fieldsToValidate = ["tipe", "min", "max", "keterangan"]
        break
      case 4:
        fieldsToValidate = ["minExpired", "maxExpired"]
        break
    }

    const result = await form.trigger(fieldsToValidate as any)

    if (result) {
      if (step < totalSteps) {
        setStep(step + 1)
      } else {
        form.handleSubmit(onSubmit)()
      }
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Payment Method</CardTitle>
        <CardDescription>Add or update payment method details for your application</CardDescription>
      </CardHeader>

      {/* Stepper */}
      <div className="px-6">
        <div className="flex justify-between mb-8">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                  ${
                    step > index + 1
                      ? "bg-primary text-primary-foreground border-primary"
                      : step === index + 1
                        ? "border-primary text-primary"
                        : "border-muted-foreground text-muted-foreground"
                  }`}
              >
                {step > index + 1 ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
              </div>
              <span
                className={`text-xs mt-2 
                  ${step >= index + 1 ? "text-primary font-medium" : "text-muted-foreground"}
                `}
              >
                {index === 0 && "Basic Info"}
                {index === 1 && "Tax Info"}
                {index === 2 && "Payment Details"}
                {index === 3 && "Expiration"}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted h-2 rounded-full mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  Basic Information
                </h3>
                <Separator />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Hash className="h-4 w-4" />
                        Code
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter payment method code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter payment method name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Enable or disable this payment method
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
            )}

            {/* Step 2: Tax Information */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  Tax Information
                </h3>
                <Separator />

                <FormField
                  control={form.control}
                  name="typeTax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Percent className="h-4 w-4" />
                        Tax Type
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select tax type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                          <SelectItem value="FLAT">Flat</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose how tax will be calculated</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxAdmin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Tax Admin
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter tax admin value"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        {form.watch("typeTax") === "PERCENTAGE"
                          ? "Enter percentage value (e.g. 10 => 10%)"
                          : "Enter flat amount"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Payment Details */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  Payment Details
                </h3>
                <Separator />

                <FormField
                  control={form.control}
                  name="tipe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAYMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the specific payment method type
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keterangan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter minimum amount"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter maximum amount"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Expiration Settings */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Timer className="h-5 w-5 text-muted-foreground" />
                  Expiration Settings
                </h3>
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minExpired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          Min Expiry (minutes)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter minimum expiry time"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormDescription>Minimum time before payment expires</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxExpired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          Max Expiry (minutes)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter maximum expiry time"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormDescription>Maximum time before payment expires</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Summary section on the last step */}
                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Method Code:</div>
                    <div>{form.watch("code") || "-"}</div>

                    <div className="text-muted-foreground">Method Name:</div>
                    <div>{form.watch("name") || "-"}</div>

                    <div className="text-muted-foreground">Tax Type:</div>
                    <div>{form.watch("typeTax") || "-"}</div>

                    <div className="text-muted-foreground">Payment Type:</div>
                    <div>{form.watch("tipe") || "-"}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t p-6">
            <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>

            {step < totalSteps ? (
              <Button type="button" onClick={nextStep}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Submit
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

