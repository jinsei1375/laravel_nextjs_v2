import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useAppContext } from '@/context/AppContext'
import { useAuth } from '@/hooks/auth'
import { formatCurrency } from '@/app/utils/formatting'

const Calendar = ({
    monthlyTransactions,
    setMonthlyTransactions,
    handleDateChange,
}) => {
    const { today } = useAppContext()
    const { user } = useAuth({ middleware: 'auth' })

    const [currentMonth, setCurrentMonth] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1),
    )
    const [currentViewDate, setCurrentViewDate] = useState(today)
    const [calendarEvents, setCalendarEvents] = useState([])
    const [dailyBalances, setDailyBalances] = useState({})

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

    // useMemoを使用してmonthlyTransactionsを計算
    const calculatedMonthlyTransactions = useMemo(() => {
        // 現在の月に該当するトランザクションをフィルタリング
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date)
            return (
                transactionDate.getMonth() === currentMonth.getMonth() &&
                transactionDate.getFullYear() === currentMonth.getFullYear()
            )
        })
    }, [transactions, currentMonth])

    // useEffectや他の方法でcalculatedMonthlyTransactionsの値が変わった時に
    // setMonthlyTransactionsを呼び出して状態を更新する
    useEffect(() => {
        setMonthlyTransactions(calculatedMonthlyTransactions)
    }, [calculatedMonthlyTransactions, setMonthlyTransactions])

    useEffect(() => {
        setMonthlyTransactions(filteredTransactions)
        const filteredDailyBalances = monthlyTransactions.reduce(
            (acc, transaction) => {
                const date = new Date(transaction.date).getDate()
                const amount = transaction.amount
                const type = transaction.category.type

                if (!acc[date]) {
                    acc[date] = { income: 0, expense: 0, balance: 0 }
                }

                if (type === 'income') {
                    acc[date].income += amount
                } else if (type === 'expense') {
                    acc[date].expense += amount
                }

                acc[date].balance = acc[date].income - acc[date].expense

                return acc
            },
            {},
        )
        setDailyBalances(filteredDailyBalances)
    }, [filteredTransactions, monthlyTransactions])

    useEffect(() => {
        const filteredCalendarEvents = Object.keys(dailyBalances).map(date => {
            const { income, expense, balance } = dailyBalances[date]
            const year = currentMonth.getFullYear()
            const month = currentMonth.getMonth() + 1
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
        setCalendarEvents(filteredCalendarEvents)
    }, [dailyBalances, currentMonth])

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

    const handleViewChange = (view, element) => {
        setCurrentViewDate(view.startStr)
    }

    return (
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
    )
}

export default Calendar
