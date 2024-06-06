// useTransactions.js
import { fetchTransactions } from '@/app/utils/fetchTransactions'
import { useState, useEffect } from 'react'

export const useTransactions = user => {
    const [transactions, setTransactions] = useState([])

    useEffect(() => {
        const fetchAndSetTransactions = async () => {
            try {
                const transactions = await fetchTransactions(user)
                setTransactions(transactions)
            } catch (err) {
                console.error(err)
                // エラーハンドリングを行う
            }
        }

        fetchAndSetTransactions()
    }, [user])

    return transactions
}
