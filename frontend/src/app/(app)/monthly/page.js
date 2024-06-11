'use client'
import Header from '@/app/(app)/Header'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useAuth } from '@/hooks/auth'
import MonthlySummary from '@/components/MonthlySummary'
import { useTransactions } from '@/hooks/useTransactions'
import TransactionFormDialog from '@/components/TransactionFormDialog'
import { useAppContext } from '@/context/AppContext'

const Top = () => {
    const [selectedDate, setSelectedDate] = useState(null)
    const [open, setOpen] = useState(false)
    const [monthlyTransactions, setMonthlyTransactions] = useState([])
    const [isNew, setIsNew] = useState(true)

    const {
        today,
        currentDay,
        setCurrentDay,
        categories,
        fetchTransactions,
        fetchCategories,
    } = useAppContext()

    const { user } = useAuth({ middleware: 'auth' })
    const [currentMonth, setCurrentMonth] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1),
    )
    const [currentViewDate, setCurrentViewDate] = useState(today)

    const transactions = useTransactions(user)

    const setCurrentMonthCallback = useCallback(() => {
        setCurrentMonth(
            new Date(
                new Date(currentViewDate).getFullYear(),
                new Date(currentViewDate).getMonth() + 1,
                1,
            ),
        )
    }, [currentViewDate])

    useEffect(setCurrentMonthCallback, [setCurrentMonthCallback])

    const filteredTransactions = useMemo(() => {
        return transactions.filter(
            transaction =>
                new Date(transaction.date).getMonth() ===
                currentMonth.getMonth(),
        )
    }, [transactions, currentMonth])

    useEffect(() => {
        fetchTransactions(user)
        fetchCategories(user)
    }, [user])

    useEffect(() => {
        setMonthlyTransactions(filteredTransactions)
    }, [filteredTransactions])

    const handleDateChange = info => {
        setSelectedDate(info.dateStr)
        setCurrentDay(info.dateStr)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleViewChange = (view, element) => {
        setCurrentViewDate(view.startStr)
    }

    return (
        <>
            <Header title="Top" />

            {/* 収支 */}
            <MonthlySummary monthlyTransactions={monthlyTransactions} />
            <FullCalendar
                locale="ja"
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                dateClick={handleDateChange}
                viewDidMount={handleViewChange}
                datesSet={handleViewChange}
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
