"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ClockIcon, AlertCircleIcon, ExternalLinkIcon, CopyIcon } from "lucide-react"

interface TransactionProps {
  id: number
  createdAt: string | null
  status: string
  noPembayaran: string
  metode: string
  jumlah: number
}

export default function PendingTransaction({ data }: { data: TransactionProps[] }) {
  return (
    <div 
      className="container mx-auto "
      style={{ 
        backgroundColor: '#001435', 
        minHeight: '100vh',
        color: 'white'
      }}
    >
      <h2 className="text-xl font-bold mb-4 text-white">Transaction History</h2>
      <div className="space-y-3">
        {data.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  )
}

function TransactionCard({ transaction }: { transaction: TransactionProps }) {

  const [copied, setCopied] = useState(false)

  // Memoize payment method check
  const isUrlPayment = useMemo(() => 
    ["QRIS", "DANA", "ShopeePay"].some(method => 
      transaction.metode.includes(method)
    ), [transaction.metode])

  // Optimize clipboard copy with useCallback
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(transaction.noPembayaran)
    setCopied(true)
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [transaction.noPembayaran])

 

  return (
    <div className="bg-blue-900/50 shadow-sm rounded-lg p-4 border border-blue-800/30 transition-all hover:shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="font-semibold text-white">{transaction.metode}</p>
          <p className="text-sm text-blue-200">
            Rp {transaction.jumlah.toLocaleString('id-ID')}
          </p>
        </div>
        <span className={`text-sm px-2 py-1 rounded ${
          transaction.status === 'Pending' 
            ? 'bg-yellow-600/20 text-yellow-300' 
            : 'bg-green-600/20 text-green-300'
        }`}>
          {transaction.status}
        </span>
      </div>

     

      <div className="flex items-center justify-between border-t border-blue-800/30 pt-2">
        <span className="text-xs text-blue-300 mr-2 truncate font-mono">
          Payment Code: 
          <span className="text-white ml-2 text-base">
            {transaction.noPembayaran}
          </span>
        </span>
        
        {isUrlPayment ? (
          <a 
            href={transaction.noPembayaran} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-200 transition-colors"
          >
            <ExternalLinkIcon size={16} />
          </a>
        ) : (
          <button 
            onClick={copyToClipboard} 
            className="text-blue-400 hover:text-blue-200 transition-colors"
          >
            {copied ? (
              <span className="text-green-400 text-xs">Copied!</span>
            ) : (
              <CopyIcon size={16} />
            )}
          </button>
        )}
      </div>
    </div>
  )
}