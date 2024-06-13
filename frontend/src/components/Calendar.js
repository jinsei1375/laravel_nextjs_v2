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
        setMonthlyTransactions(filteredTransactions)
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

        const filteredCalendarEvents = Object.keys(dailyBalances).map(date => {
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
        setCalendarEvents(filteredCalendarEvents)
    }, [filteredTransactions, monthlyTransactions, currentMonth])

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
