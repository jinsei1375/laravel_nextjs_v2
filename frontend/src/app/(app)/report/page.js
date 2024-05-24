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
import { Typography } from '@mui/material'

function EditExpenseToolbar(props) {
    const { setRows, setRowModesModel, rows } = props

    const handleClick = () => {
        const id = Math.max(...rows.map(row => row.id), 0) + 1
        setRows(oldRows => [
            ...oldRows,
            { id, name: '', isNew: true, type: 'expense' },
        ])
        setRowModesModel(oldModel => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }))
    }

    return (
        <GridToolbarContainer>
            <Button
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleClick}>
                カテゴリー追加
            </Button>
        </GridToolbarContainer>
    )
}

export default function Report() {
    const [transactions, setTransactions] = useState([])
    const [rows, setRows] = useState([])
    const [rowModesModel, setRowModesModel] = useState({})

    const { user } = useAuth({ middleware: 'auth' })
    const userId = user.id

    useEffect(() => {
        if (user) {
            fetchTransactions()
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

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true
        }
    }

    const handleEditClick = (id, type) => () => {
        console.log('handleEditClick called with id:', id, 'and type:', type)
        if (type === 'expense') {
            setRowModesModel({
                ...rowModesModel,
                [id]: { mode: GridRowModes.Edit },
            })
            console.log('rowModesModel after update:', rowModesModel)
        } else if (type === 'income') {
            setIncomeRowModesModel({
                ...incomeRowModesModel,
                [id]: { mode: GridRowModes.Edit },
            })
            console.log(
                'incomeRowModesModel after update:',
                incomeRowModesModel,
            )
        }
    }

    const handleSaveClick = (id, type) => () => {
        if (type === 'expense') {
            setRowModesModel({
                ...rowModesModel,
                [id]: { mode: GridRowModes.View },
            })
        } else if (type === 'income') {
            setIncomeRowModesModel({
                ...incomeRowModesModel,
                [id]: { mode: GridRowModes.View },
            })
        }
    }

    const handleCancelClick = (id, type) => () => {
        if (type === 'expense') {
            setRowModesModel({
                ...rowModesModel,
                [id]: { mode: GridRowModes.View, ignoreModifications: true },
            })

            const editedRow = rows.find(row => row.id === id)
            if (editedRow.isNew) {
                setRows(rows.filter(row => row.id !== id))
            }
        } else if (type === 'income') {
            setIncomeRowModesModel({
                ...incomeRowModesModel,
                [id]: { mode: GridRowModes.View, ignoreModifications: true },
            })

            const editedRow = incomeRows.find(row => row.id === id)
            if (editedRow.isNew) {
                setIncomeRows(incomeRows.filter(row => row.id !== id))
            }
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
                    `http://localhost/api/${userId}/category`,
                    { name: newRow.name, type: newRow.type },
                )

                if (response.status === 200) {
                    if (newRow.type === 'expense') {
                        setRows(oldRows => [...oldRows, response.data])
                    } else if (newRow.type === 'income') {
                        setIncomeRows(oldRows => [...oldRows, response.data])
                    }
                } else {
                    console.log('Error occurred while adding category')
                }
            } catch (err) {
                console.log(err)
            }
        } else {
            try {
                const response = await axios.put(
                    `http://localhost/api/${userId}/category/${newRow.categoryId}`,
                    { name: newRow.name },
                )
                if (response.status === 200) {
                    if (newRow.type === 'expense') {
                        setRows(oldRows =>
                            oldRows.map(row =>
                                row.id === newRow.id ? response.data : row,
                            ),
                        )
                    } else if (newRow.type === 'income') {
                        setIncomeRows(oldRows =>
                            oldRows.map(row =>
                                row.id === newRow.id ? response.data : row,
                            ),
                        )
                    }
                } else {
                    console.log('Error occurred while adding category')
                }
            } catch (err) {
                console.log(err)
            }
        }
        console.log(newRow)
        const updatedRow = { ...newRow, isNew: false }
        if (newRow.type === 'expense') {
            setRows(rows.map(row => (row.id === newRow.id ? updatedRow : row)))
        } else if (newRow.type === 'income') {
            setIncomeRows(
                incomeRows.map(row =>
                    row.id === newRow.id ? updatedRow : row,
                ),
            )
        }
        return updatedRow
    }

    // カテゴリー削除処理
    const handleDeleteClick = (id, type) => async () => {
        let targetRow = {}
        if (type === 'expense') {
            targetRow = rows.find(row => row.id === id)
        } else if (type === 'income') {
            targetRow = incomeRows.find(row => row.id === id)
        }
        try {
            const response = await axios.delete(
                `http://localhost/api/${userId}/category/${targetRow.categoryId}`,
            )
            if (response.status === 200) {
                if (type === 'expense') {
                    setRows(rows.filter(row => row.id !== id))
                } else if (type === 'income') {
                    setIncomeRows(incomeRows.filter(row => row.id !== id))
                }
                console.log(response.data.message)
            } else {
                console.log('Error occurred while adding category')
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleExpenseRowModesModelChange = newRowModesModel => {
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
            field: 'category',
            headerName: 'カテゴリー名',
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
                        onRowModesModelChange={handleExpenseRowModesModelChange}
                        onRowEditStop={handleRowEditStop}
                        processRowUpdate={processRowUpdate}
                        slots={{
                            toolbar: EditExpenseToolbar,
                        }}
                        slotProps={{
                            toolbar: {
                                setRows,
                                setRowModesModel,
                                rows,
                            },
                        }}
                    />
                </Box>
            </Box>
        </Box>
    )
}
