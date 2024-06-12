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
import { formatCurrency } from '@/app/utils/formatting'

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

    const dailyBalances = monthlyTransactions.reduce((acc, transaction) => {
        const date = new Date(transaction.date).getDate()
        const amount = transaction.amount
        const type = transaction.category.type

        if (!acc[date]) {
            acc[date] = {
                income: 0,
                expense: 0,
                balance: 0,
            }
        }

        if (type === 'income') {
            acc[date].income += amount
        } else if (type === 'expense') {
            acc[date].expense += amount
        }

        acc[date].balance = acc[date].income - acc[date].expense

        return acc
    }, {})

    const calendarEvents = Object.keys(dailyBalances).map(date => {
        const { income, expense, balance } = dailyBalances[date]
        // 現在の月と年を取得
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth() + 1 // getMonth() は 0 から始まるため、+1 する
        // 日付を ISO 8601 形式に変換
        const isoDate = `${year}-${month
            .toString()
            .padStart(2, '0')}-${date.padStart(2, '0')}`
        return {
            start: isoDate,
            income: formatCurrency(income),
            expense: formatCurrency(expense),
            balance: formatCurrency(balance),
        }
    })

    const renderEventContent = eventInfo => {
        return (
            <div>
                <div className="money" id="event-income">
                    {eventInfo.event.extendedProps.income}
                </div>
                <div
                    className="money"
                    id="event-expense"
                    style={{ backgroundColor: 'red' }}>
                    {eventInfo.event.extendedProps.expense}
                </div>
                <div
                    className="money"
                    id="event-balance"
                    style={{ backgroundColor: 'green' }}>
                    {eventInfo.event.extendedProps.balance}
                </div>
            </div>
        )
    }

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
                events={calendarEvents}
                eventContent={renderEventContent}
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
