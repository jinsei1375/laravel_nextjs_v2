'use client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'
import {
    GridRowModes,
    DataGrid,
    GridToolbarContainer,
    GridActionsCellItem,
    GridRowEditStopReasons,
} from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { useAuth } from '@/hooks/auth'
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

function EditExpenseToolbar(props) {
    const { setOpen } = props

    const handleClick = () => {
        setOpen(open)
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
    const [transactions, setTransactions] = useState([])
    const [open, setOpen] = useState(true)
    const [rows, setRows] = useState([])
    const [expenseCategories, setExpenseCategories] = useState([])
    const [incomeCategories, setIncomeCategories] = useState([])
    const [rowModesModel, setRowModesModel] = useState({})

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

    const onSubmit = async data => {
        console.log(data)
        try {
            // const response = await axios.post(
            //     `http://localhost/api/${userId}/transaction`,
            //     { transaction: data },
            // )
            // const newTransaction = response.data
            // if (response.ok) {
            //     // Handle successful submission
            // } else {
            //     // Handle error
            // }
        } catch (error) {
            // Handle error
            console.error(error)
        }
    }

    const formOptions = { resolver: zodResolver(transactionSchema) }
    const {
        control,
        // setValue,
        // watch,
        formState: { errors },
        // reset,
        handleSubmit,
    } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'expense',
            date: '2021-09-01',
            amount: 1000,
            title: 'test',
        },
    })

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
                type: transaction.category ? transaction.category.type : 'N/A',
                amount: transaction.amount,
                date: transaction.date,
            }
        })
        // console.log(newRows)
        setRows(newRows)
    }, [transactions])

    const handleClose = () => {
        setOpen(false)
    }

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true
        }
    }

    const handleEditClick = id => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.Edit },
        })
        console.log('rowModesModel after update:', rowModesModel)
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

    // カテゴリー編集・追加処理
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

    // カテゴリー削除処理
    const handleDeleteClick = id => async () => {
        const targetRow = rows.find(row => row.id === id)
        try {
            const response = await axios.delete(
                `http://localhost/api/${userId}/category/${targetRow.categoryId}`,
            )
            if (response.status === 200) {
                setRows(rows.filter(row => row.id !== id))
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
            editable: true,
        },
        {
            field: 'type',
            headerName: 'タイプ',
            width: 120,
            editable: true,
        },
        {
            field: 'category',
            headerName: 'カテゴリー名',
            width: 180,
            editable: true,
        },
        {
            field: 'amount',
            headerName: '金額',
            width: 180,
            editable: true,
        },
        {
            field: 'date',
            headerName: '日付',
            width: 180,
            editable: true,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: row => {
                const { id, type } = row.row
                const isInEditMode =
                    rowModesModel[id]?.mode === GridRowModes.Edit

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id, type)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id, type)}
                            color="inherit"
                        />,
                    ]
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id, type)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id, type)}
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
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={2}>
                            {/* 収支タイプ */}
                            <Controller
                                name="type"
                                control={control}
                                defaultValue=""
                                rules={{ required: 'This field is required' }}
                                render={({ field }) => (
                                    <FormControl error={Boolean(errors.type)}>
                                        <InputLabel>Type</InputLabel>
                                        <Select {...field}>
                                            <MenuItem value="income">
                                                Income
                                            </MenuItem>
                                            <MenuItem value="expense">
                                                Expense
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            {/* カテゴリー */}
                            <Controller
                                name="category"
                                control={control}
                                defaultValue=""
                                rules={{ required: 'This field is required' }}
                                render={({ field }) => (
                                    <FormControl
                                        error={Boolean(errors.category)}>
                                        <InputLabel>Category</InputLabel>
                                        <Select {...field}>
                                            {field.value === 'income'
                                                ? incomeCategories.map(
                                                      category => (
                                                          <MenuItem
                                                              key={category.id}
                                                              value={
                                                                  category.id
                                                              }>
                                                              {category.name}
                                                          </MenuItem>
                                                      ),
                                                  )
                                                : expenseCategories.map(
                                                      category => (
                                                          <MenuItem
                                                              key={category.id}
                                                              value={
                                                                  category.id
                                                              }>
                                                              {category.name}
                                                          </MenuItem>
                                                      ),
                                                  )}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                            {/* タイトル */}
                            <Controller
                                name="title"
                                control={control}
                                defaultValue=""
                                // rules={{ required: 'This field is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Title"
                                        type="text"
                                        error={Boolean(errors.amount)}
                                        helperText={errors.title?.message}
                                    />
                                )}
                            />
                            {/* 金額 */}
                            <Controller
                                name="amount"
                                control={control}
                                defaultValue=""
                                // rules={{ required: 'This field is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Amount"
                                        type="number"
                                        error={Boolean(errors.amount)}
                                        helperText={errors.amount?.message}
                                    />
                                )}
                            />
                            {/* 日付 */}
                            <Controller
                                name="date"
                                control={control}
                                defaultValue=""
                                rules={{ required: 'This field is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="date"
                                        label="Date"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        error={Boolean(errors.date)}
                                        helperText={errors.date?.message}
                                    />
                                )}
                            />
                        </Stack>

                        <DialogActions>
                            <Button type="submit">追加</Button>
                        </DialogActions>
                    </ふぉr>
                </DialogContent>
            </Dialog>
        </Box>
    )
}
