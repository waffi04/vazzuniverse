"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"
import { useState } from "react"
import { trpc } from "@/utils/trpc"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface FormMemberProps {
  name: string
  id: number
  balance: number
  role: string
}

export function FormMember({ balance = 0, name = "", role = "", id }: FormMemberProps) {
  const [formData, setFormData] = useState({
    name: name,
    balance: balance,
    role: role,
  })
  
  const router = useRouter()
  const utils = trpc.useUtils()

  const { mutate, isLoading } = trpc.member.edit.useMutation({
    // Optimistic update
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await utils.member.findAll.cancel()
      
      // Snapshot of the previous data
      const previousMembers = utils.member.findAll.getData()
      
      // Optimistically update the data with our new value
      utils.member.findAll.setData({ page: 1, perPage: 10 }, (old) => {
        if (!old) return old
        
        return {
          ...old,
          data: old.data.map((member) => 
            member.id === id 
              ? { 
                  ...member, 
                  name: newData.name, 
                  balance: newData.balance, 
                  role: newData.role 
                } 
              : member
          )
        }
      })
      
      // Return the snapshotted value
      return { previousMembers }
    },
    
    // If the mutation fails, use the context we returned above
    onError: (err, newData, context) => {
      utils.member.findAll.setData({ page: 1, perPage: 10 }, context?.previousMembers)
      toast.error("Failed to update member", {
        description: err.message || "Update Member Gagal. Coba lagi",
      })
    },
    
    // Always refetch after error or success
    onSettled: () => {
      utils.member.findAll.invalidate()
    },
    
    onSuccess: () => {
      toast.success("Member updated successfully", {
        description: `${formData.name}'s information has been updated.`,
      })
      router.refresh()
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "balance" ? Number(value) : value,
    })
  }

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate({
      balance: formData.balance,
      id,
      name: formData.name,
      role: formData.role,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Member Information</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Balance</Label>
            <Input
              type="number"
              id="balance"
              name="balance"
              value={formData.balance}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={handleRoleChange} required disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Member">Member</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}