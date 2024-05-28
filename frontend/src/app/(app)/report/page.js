'use client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import {
    GridRowModes,
    DataGrid,
    GridToolbarContainer,
    GridActionsCellItem,
    GridRowEditStopReasons,
} from '@mui/x-data-grid'
import { useEffect, useState } from 'react'

import { useAuth } from '@/hooks/auth'
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Stack,
    TextField,
} from '@mui/material'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from '@/lib/axios'

function EditExpenseToolbar(props) {
    const { setOpen, setIsNew, reset, currentDay } = props

    const handleClick = () => {
        reset({
            type: 'expense',
            date: currentDay,
            amount: 0,
            category: '',
            title: '',
        })
        setOpen(true)
        setIsNew(true)
    }

    return (
        <GridToolbarContainer>
            <Button
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleClick}>
                追加
            </Button>
        </GridToolbarContainer>
    )
}

export default function Report() {
    const today = new Date().toISOString().split('T')[0]
    const [currentDay, setCurrentDay] = useState(today)
    const [transactions, setTransactions] = useState([])
    const [open, setOpen] = useState(false)
    const [rows, setRows] = useState([])
    const [categories, setCategories] = useState([])
    const [expenseCategories, setExpenseCategories] = useState([])
    const [incomeCategories, setIncomeCategories] = useState([])
    const [rowModesModel, setRowModesModel] = useState({})
    const [isNew, setIsNew] = useState(false)

    const { user } = useAuth({ middleware: 'auth' })
    const userId = user.id

    const transactionSchema = z.object({
        // type: z.enum(['income', 'expense']),
        // date: z.string().min(1, { message: '日付は必須です' }),
        // amount: z.number().min(1, { message: '金額は1円以上必須です' }),
        // title: z
        //     .string()
        //     .min(1, { message: '内容を入力してください' })
        //     .max(50, { message: '内容は50文字以内にしてください。' }),
    })

    // 取引追加処理
    const onSubmit = async data => {
        console.log(data)
        try {
            if (isNew) {
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
                    const newTransaction = response.data
                    setTransactions([...transactions, newTransaction])
                    console.log(newTransaction)
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
                    console.log(response.data)
                    console.log(data.transactionId)
                    console.log(data)
                    const updatedRow = {
                        id: data.id,
                        title: response.data.title,
                        category: response.data.category
                            ? response.data.category.name
                            : 'N/A',
                        type:
                            response.data.category.type == 'income'
                                ? '収入'
                                : '支出',
                        amount: response.data.amount,
                        date: response.data.date,
                        transactionId: response.data.id,
                        categoryId: response.data.category.id,
                    }
                    setRows(oldRows =>
                        oldRows.map(row =>
                            row.transactionId === data.transactionId
                                ? updatedRow
                                : row,
                        ),
                    )
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

    const formOptions = { resolver: zodResolver(transactionSchema) }

    const {
        control,
        setValue,
        watch,
        formState: { errors },
        reset,
        handleSubmit,
    } = useForm({
        // todo resolverを使うとエラーが出る
        // resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'expense',
            date: currentDay,
            amount: 0,
            title: '',
            category: '',
        },
    })

    // 収支タイプを監視
    const currentType = watch('type')

    useEffect(() => {
        if (user) {
            fetchTransactions()
            fetchCategories()
        }
    }, [user])

    useEffect(() => {
        const newRows = transactions.map((transaction, index) => {
            return {
                id: index + 1,
                title: transaction.title,
                category: transaction.category
                    ? transaction.category.name
                    : 'N/A',
                type: transaction.category.type == 'income' ? '収入' : '支出',
                amount: transaction.amount,
                date: transaction.date,
                transactionId: transaction.id,
                categoryId: transaction.category.id,
            }
        })
        setRows(newRows)
    }, [transactions])

    useEffect(() => {
        const newCategories =
            currentType === 'income' ? incomeCategories : expenseCategories
        console.log(newCategories)
        setCategories(newCategories)
    }, [currentType])

    const incomeExpenseToggle = type => {
        setValue('type', type)
        setValue('category', '')
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true
        }
    }

    // 編集処理
    const handleEditClick = row => () => {
        setOpen(true)
        setIsNew(false)
        console.log(row)
        setValue('id', row.id)
        setValue('title', row.title)
        setValue('type', row.type == '収入' ? 'income' : 'expense')
        setValue('category', row.categoryId)
        setValue('amount', row.amount)
        setValue('date', row.date)
        setValue('transactionId', row.transactionId)
    }

    const handleSaveClick = id => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View },
        })
    }

    const handleCancelClick = id => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        })

        const editedRow = rows.find(row => row.id === id)
        if (editedRow.isNew) {
            setRows(rows.filter(row => row.id !== id))
        }
    }

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
    const fetchTransactions = async () => {
        try {
            const response = await axios.get(
                `http://localhost/api/${userId}/transaction/`,
            )
            const fetchedTransacions = response.data
            setTransactions(fetchedTransacions)
        } catch (err) {
            console.log(err)
        }
    }

    // 編集・追加処理
    const processRowUpdate = async newRow => {
        console.log(newRow)
        if (newRow.isNew) {
            try {
                const response = await axios.post(
                    `http://localhost/api/${userId}/transaction`,
                    { transaction: newRow },
                )

                if (response.status === 200) {
                    setRows(oldRows => [...oldRows, response.data])
                } else {
                    console.log('Error occurred while adding category')
                }
            } catch (err) {
                console.log(err)
            }
        } else {
            try {
                const response = await axios.put(
                    `http://localhost/api/${userId}/transaction/${newRow}`,
                    { transaction: newRow },
                )
                if (response.status === 200) {
                    setRows(oldRows =>
                        oldRows.map(row =>
                            row.id === newRow.id ? response.data : row,
                        ),
                    )
                } else {
                    console.log('Error occurred while adding category')
                }
            } catch (err) {
                console.log(err)
            }
        }
        console.log(newRow)
        const updatedRow = { ...newRow, isNew: false }
        setRows(rows.map(row => (row.id === newRow.id ? updatedRow : row)))
        return updatedRow
    }

    // 削除処理
    const handleDeleteClick = id => async () => {
        console.log(id)
        try {
            const response = await axios.delete(
                `http://localhost/api/${userId}/transaction/${id}`,
            )
            if (response.status === 200) {
                setRows(rows.filter(row => row.id !== id))
                console.log(response.data.message)
            } else {
                console.log('Error occurred while adding category')
            }
        } catch (err) {
            console.log(err)
        }
    }

    const rowModesModelChange = newRowModesModel => {
        setRowModesModel(newRowModesModel)
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
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                    }}>
                    <DataGrid
                        rows={rows}
                        columns={expenseColumns}
                        editMode="row"
                        rowModesModel={rowModesModel}
                        onRowModesModelChange={rowModesModelChange}
                        onRowEditStop={handleRowEditStop}
                        processRowUpdate={processRowUpdate}
                        slots={{
                            toolbar: EditExpenseToolbar,
                        }}
                        slotProps={{
                            toolbar: {
                                setOpen,
                                setIsNew,
                                reset,
                                currentDay,
                            },
                        }}
                    />
                </Box>
            </Box>
            <Dialog
                open={open}
                onClose={handleClose}
                sx={
                    {
                        // width: '50%',
                        // height: '300px',
                        // display: 'flex',
                        // justifyContent: 'center',
                        // alignItems: 'center',
                    }
                }>
                <DialogTitle>取引追加</DialogTitle>
                <DialogContent>
                    <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={2}>
                            {/* 収支タイプ */}
                            <Controller
                                mt={2}
                                name="type"
                                control={control}
                                // defaultValue=""
                                // rules={{ required: 'This field is required' }}
                                render={({ field }) => (
                                    <FormControl error={!!errors.type}>
                                        {/* <FormLabel component="legend">
                                            タイプ
                                        </FormLabel> */}
                                        <RadioGroup
                                            {...field}
                                            aria-label="タイプ"
                                            onChange={e => {
                                                field.onChange(e)
                                                incomeExpenseToggle(
                                                    e.target.value,
                                                )
                                            }}
                                            row>
                                            <FormControlLabel
                                                value="expense"
                                                control={<Radio />}
                                                label="支出"
                                            />
                                            <FormControlLabel
                                                value="income"
                                                control={<Radio />}
                                                label="収入"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                )}
                            />
                            {/* タイトル */}
                            <Controller
                                name="title"
                                control={control}
                                // defaultValue=""
                                // rules={{ required: 'This field is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="項目名"
                                        type="text"
                                        error={!!errors.amount}
                                        helperText={errors.title?.message}
                                    />
                                )}
                            />
                            {/* カテゴリー */}
                            <Controller
                                name="category"
                                control={control}
                                // defaultValue=""
                                // rules={{ required: 'This field is required' }}
                                render={({ field }) => (
                                    <FormControl error={!!errors.category}>
                                        <InputLabel id="category-select-label">
                                            カテゴリー
                                        </InputLabel>
                                        <Select
                                            {...field}
                                            label="カテゴリ"
                                            labelId="category-select-label">
                                            {categories.map(category => (
                                                <MenuItem
                                                    key={category.id}
                                                    value={category.id}>
                                                    {category.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            {/* 金額 */}
                            <Controller
                                name="amount"
                                control={control}
                                // defaultValue=""
                                // rules={{ required: 'This field is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="金額"
                                        type="number"
                                        value={field.value}
                                        error={!!errors.amount}
                                        helperText={errors.amount?.message}
                                    />
                                )}
                            />
                            {/* 日付 */}
                            <Controller
                                name="date"
                                control={control}
                                // defaultValue=""
                                // rules={{ required: 'This field is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="date"
                                        label="日付"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        error={!!errors.date}
                                        helperText={errors.date?.message}
                                    />
                                )}
                            />
                        </Stack>
                        <DialogActions>
                            <Button type="submit">
                                {isNew ? '追加' : '更新'}
                            </Button>
                        </DialogActions>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    )
}
