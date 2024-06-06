import { create } from '@mui/material/styles/createTransitions'
import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const AppContextProvider = ({ children }) => {
    const today = new Date()
    const [currentDay, setCurrentDay] = useState(today)
    const [transactions, setTransactions] = useState([])
    const [categories, setCategories] = useState([])
    const [expenseCategories, setExpenseCategories] = useState([])
    const [incomeCategories, setIncomeCategories] = useState([])

    // カテゴリー取得処理
    const fetchCategories = async () => {
        try {
            const response = await axios.get(
                `http://localhost/api/${userId}/category/`,
            )
            const fetchedCategories = response.data

            const filteredExpenseCategories = fetchedCategories.filter(
                cat => cat.type === 'expense',
            )
            const filteredIncomeCategories = fetchedCßategories.filter(
                cat => cat.type === 'income',
            )
            setCategories(filteredExpenseCategories)
            setExpenseCategories(filteredExpenseCategories)
            setIncomeCategories(filteredIncomeCategories)
        } catch (err) {
            console.log(err)
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
