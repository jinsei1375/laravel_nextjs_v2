'use client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import {
    DataGrid,
    GridToolbarContainer,
    GridActionsCellItem,
} from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/auth'
import { Typography } from '@mui/material'
import axios from '@/lib/axios'
import FlashMessage from '@/components/FlashMessage'
import { formatCurrency } from '@/app/utils/formatting'
import MonthlySummary from '@/components/MonthlySummary'
import TransactionFormDialog from '@/components/TransactionFormDialog'
import Header from '../Header'
import { useAppContext } from '@/context/AppContext'

function EditExpenseToolbar(props) {
    const {
        setOpen,
        setIsNew,
        // reset,
        // currentDay,
        currentMonth,
        goToNextMonth,
        goToPrevMonth,
    } = props

    const handleClick = () => {
        // reset({
        //     type: 'expense',
        //     date: currentDay.toISOString().split('T')[0],
        //     amount: 0,
        //     category: '',
        //     title: '',
        // })
        setOpen(true)
        setIsNew(true)
    }

    return (
        <GridToolbarContainer
            sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex' }}>
                <Button
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleClick}>
                    追加
                </Button>
                <Typography variant="h6">
                    {new Date(currentMonth).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                    })}
                </Typography>
            </Box>
            <Box>
                <Button onClick={goToPrevMonth}>前の月</Button>
                <Button onClick={goToNextMonth}>次の月</Button>
            </Box>
        </GridToolbarContainer>
    )
}

export default function Report() {
    const today = new Date()
    const [currentDay, setCurrentDay] = useState(today)
    const [currentMonth, setCurrentMonth] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1),
    )
    const [monthlyTransactions, setMonthlyTransactions] = useState([])
    const [open, setOpen] = useState(false)
    const [rows, setRows] = useState([])
    const [expenseCategories, setExpenseCategories] = useState([])
    const [incomeCategories, setIncomeCategories] = useState([])
    const [isNew, setIsNew] = useState(false)
    const [state, setState] = useState({
        open: false,
    })
    const [selectedRow, setSelectedRow] = useState({})

    const { user } = useAuth({ middleware: 'auth' })
    const userId = user.id

    const {
        fetchCategories,
        fetchTransactions,
        transactions,
        setTransactions,
        categories,
        setCategories,
    } = useAppContext()

    useEffect(() => {
        if (user) {
            fetchTransactions(user)
            fetchCategories(user)
            setCurrentDay(today)
        }
    }, [user])

    useEffect(() => {
        const newRows = monthlyTransactions.map((transaction, index) => {
            return {
                id: index + 1,
                title: transaction.title,
                category: transaction.category
                    ? transaction.category.name
                    : 'N/A',
                type: transaction.category.type == 'income' ? '収入' : '支出',
                amount: `¥${formatCurrency(transaction.amount)}`,
                date: transaction.date,
                transactionId: transaction.id,
                categoryId: transaction.category.id,
            }
        })
        setRows(newRows)
        console.log(newRows)
    }, [transactions, monthlyTransactions])

    useEffect(() => {
        const filteredTransactions = transactions.filter(
            transaction =>
                new Date(transaction.date).getMonth() ===
                currentMonth.getMonth(),
        )
        setMonthlyTransactions(filteredTransactions)
        console.log(filteredTransactions)
    }, [transactions, currentMonth])

    useEffect(() => {
        console.log(transactions)
    }, [transactions])

    const handleClose = () => {
        setOpen(false)
    }

    // 編集処理
    const handleEditClick = row => () => {
        setOpen(true)
        setIsNew(false)
        setSelectedRow(row)
        console.log(row)
    }
    // 次の月へ
    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => {
            const nextMonth = new Date(prevMonth.getTime())
            nextMonth.setMonth(prevMonth.getMonth() + 1)
            return nextMonth
        })
    }

    // 前の月へ
    const goToPrevMonth = () => {
        setCurrentMonth(prevMonth => {
            const previousMonth = new Date(prevMonth.getTime())
            previousMonth.setMonth(prevMonth.getMonth() - 1)
            return previousMonth
        })
    }

    // 削除処理
    const handleDeleteClick = id => async () => {
        console.log(id)
        console.log(rows)
        try {
            const response = await axios.delete(
                `http://localhost/api/${userId}/transaction/${id}`,
            )
            if (response.status === 200) {
                setRows(rows.filter(row => row.transactionId !== id))
                // fetchTransactions(user)
                handleSnackBarOpen('削除しました')
            } else {
                console.log('Error occurred while adding category')
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleSnackBarOpen = message => {
        setState({
            open: true,
            message: message,
        })
    }
    const handleSnackBarClose = () => {
        setState({
            ...state,
            open: false,
        })
    }

    // 支出用カラム
    const expenseColumns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
            editable: false,
        },
        {
            field: 'title',
            headerName: '項目名',
            width: 180,
            editable: false,
        },
        {
            field: 'type',
            headerName: 'タイプ',
            width: 120,
            editable: false,
        },
        {
            field: 'category',
            headerName: 'カテゴリー名',
            width: 180,
            editable: false,
        },
        {
            field: 'amount',
            headerName: '金額',
            width: 180,
            editable: false,
        },
        {
            field: 'date',
            headerName: '日付',
            width: 180,
            editable: false,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: row => {
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(row.row)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(row.row.transactionId)}
                        color="inherit"
                    />,
                ]
            },
        },
    ]

    return (
        <>
            <Header title="Report" />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}>
                {/* 収支 */}
                <MonthlySummary monthlyTransactions={monthlyTransactions} />
                {/* 取引一覧 */}
                <Box sx={{ width: '100%' }}>
                    <Box
                        sx={{
                            width: '100%',
                            '& .actions': {
                                color: 'text.secondary',
                            },
                            '& .textPrimary': {
                                color: 'text.primary',
                            },
                            height: 450,
                        }}>
                        <DataGrid
                            rows={rows}
                            columns={expenseColumns}
                            editMode="row"
                            slots={{
                                toolbar: EditExpenseToolbar,
                            }}
                            slotProps={{
                                toolbar: {
                                    setOpen,
                                    setIsNew,
                                    // reset,
                                    currentDay,
                                    currentMonth,
                                    goToNextMonth,
                                    goToPrevMonth,
                                },
                            }}
                        />
                    </Box>
                </Box>

                {/* 取引追加・編集フォーム */}
                <TransactionFormDialog
                    open={open}
                    setOpen={setOpen}
                    handleClose={handleClose}
                    currentDay={currentDay}
                    isNew={isNew}
                    expenseCategories={expenseCategories}
                    incomeCategories={incomeCategories}
                    categories={categories}
                    setCategories={setCategories}
                    userId={userId}
                    setTransactions={setTransactions}
                    transactions={transactions}
                    selectedRow={selectedRow}
                    setRows={setRows}
                />
                {/* フラッシュメッセージ */}
                <FlashMessage
                    open={state.open}
                    message={state.message}
                    handleClose={handleSnackBarClose}
                />
            </Box>
        </>
    )
}
