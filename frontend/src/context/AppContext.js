import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const AppContextProvider = ({ children }) => {
    const today = new Date()
    const [currentDay, setCurrentDay] = useState(today)
    const [transactions, setTransactions] = useState([])
    const [categories, setCategories] = useState([])
    const [expenseCategories, setExpenseCategories] = useState([])
    const [incomeCategories, setIncomeCategories] = useState([])

    const user = useAuth({ middleware: 'auth' })
    const userId = user.id

    // カテゴリー取得処理
    const fetchCategories = async user => {
        try {
            const response = await axios.get(
                `http://localhost/api/${user.id}/category/`,
            )
            const fetchedCategories = response.data

            const filteredExpenseCategories = fetchedCategories.filter(
                cat => cat.type === 'expense',
            )
            const filteredIncomeCategories = fetchedCategories.filter(
                cat => cat.type === 'income',
            )
            setCategories(filteredExpenseCategories)
            setExpenseCategories(filteredExpenseCategories)
            setIncomeCategories(filteredIncomeCategories)
        } catch (err) {
            console.log(err)
        }
    }

    // 取引取得処理
    const fetchTransactions = async user => {
        try {
            const response = await axios.get(
                `http://localhost/api/${user.id}/transaction/`,
            )

            setTransactions(response.data)
        } catch (err) {
            console.log(err)
        }
    }

    // 取引追加処理
    const onSubmit = async data => {
        try {
            if (isNew) {
                console.log(data)
                const response = await axios.post(
                    `http://localhost/api/${userId}/transaction`,
                    {
                        date: data.date,
                        amount: data.amount,
                        title: data.title,
                        category: data.category,
                    },
                )
                if (response.status === 200) {
                    // fetchTransactions(user)
                    const newTransaction = response.data
                    setTransactions([...transactions, newTransaction])
                    console.log(newTransaction)
                    handleSnackBarOpen('追加しました')
                } else {
                    console.log('Error occurred while adding transaction')
                }
            } else {
                const response = await axios.put(
                    `http://localhost/api/${userId}/transaction/${data.transactionId}`,
                    {
                        date: data.date,
                        amount: data.amount,
                        title: data.title,
                        category: data.category,
                    },
                )
                if (response.status === 200) {
                    // fetchTransactions(user)
                    const updatedTransactions = transactions.map(t =>
                        t.id === data.transactionId
                            ? { ...t, ...response.data }
                            : t,
                    )
                    setTransactions(updatedTransactions)
                    handleSnackBarOpen('更新しました')
                } else {
                    console.log('Error occurred while adding category')
                }
            }
            setOpen(false)
        } catch (error) {
            // Handle error
            console.error(error)
        }
    }

    return (
        <AppContext.Provider
            value={{
                currentDay,
                setCurrentDay,
                today,
                fetchCategories,
                expenseCategories,
                setExpenseCategories,
                incomeCategories,
                setIncomeCategories,
                categories,
                setCategories,
                transactions,
                setTransactions,
                fetchTransactions,
                onSubmit,
                userId,
            }}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    const context = useContext(AppContext)
    if (!context) {
        // undefinedの場合
        throw new Error('グローバルなデータはプロバイダーの中で取得してね')
    }
    return context
}
