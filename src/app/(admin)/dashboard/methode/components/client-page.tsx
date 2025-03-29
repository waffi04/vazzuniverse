"use client"
import { trpc } from "@/utils/trpc"
import { HeaderMethode } from "./header-methode"
import TableMethode from "./table-methode"
import { PaymentMethod } from "@/types/payment"

export default function ClientPage(){
    // const {}  = trpc.methods.create.useMutation()
    const {data : methodData}  = trpc.methods.getMethods.useQuery()
    return (
        <main className="min-h-screen p-8 space-y-6 w-full">
            <HeaderMethode />
            <TableMethode data={methodData?.data  as PaymentMethod[]}/>
        </main>

    )
}