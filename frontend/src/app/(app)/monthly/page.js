'use client'
import Header from '@/app/(app)/Header'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import MonthlySummary from '@/components/MonthlySummary'
import { useTransactions } from '@/hooks/useTransactions'
import TransactionFormDialog from '@/components/TransactionFormDialog'
import { useAppContext } from '@/context/AppContext'
import { formatCurrency } from '@/app/utils/formatting'
import Calendar from '@/components/Calendar'

const Top = () => {
    const [open, setOpen] = useState(false)
    const [monthlyTransactions, setMonthlyTransactions] = useState([])
    const [isNew, setIsNew] = useState(true)
    const [selectedDate, setSelectedDate] = useState(null)

    const {
        today,
        currentDay,
        setCurrentDay,
        categories,
        fetchTransactions,
        fetchCategories,
    } = useAppContext()

    const { user } = useAuth({ middleware: 'auth' })

    useEffect(() => {
        fetchTransactions(user)
        fetchCategories(user)
    }, [user])

    const handleClose = () => {
        setOpen(false)
    }

    const handleDateChange = info => {
        setSelectedDate(info.dateStr)
        setCurrentDay(info.dateStr)
        setOpen(true)
    }

    return (
        <>
            <Header title="Top" />

            {/* 収支 */}
            <MonthlySummary monthlyTransactions={monthlyTransactions} />
            <Calendar
                monthlyTransactions={monthlyTransactions}
                setMonthlyTransactions={setMonthlyTransactions}
                handleDateChange={handleDateChange}
            />

            {/* <DialogTest /> */}
            {/* 取引追加・編集フォーム */}
            <TransactionFormDialog
                open={open}
                setOpen={setOpen}
                handleClose={handleClose}
                currentDay={currentDay}
                isNew={isNew}
                categories={categories}
                userId={user.id}
            />
        </>
    )
}

export default Top
