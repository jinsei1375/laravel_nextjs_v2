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
import Header from '../Header'

function EditExpenseToolbar(props) {
    const { setExpenseRows, setExpenseRowModesModel, expenseRows } = props

    const handleClick = () => {
        const id = Math.max(...expenseRows.map(row => row.id), 0) + 1
        setExpenseRows(oldRows => [
            ...oldRows,
            { id, name: '', isNew: true, type: 'expense' },
        ])
        setExpenseRowModesModel(oldModel => ({
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

function EditIncomeToolbar(props) {
    const { setIncomeRows, setIncomeRowModesModel, incomeRows } = props

    const handleClick = () => {
        const id = Math.max(...incomeRows.map(row => row.id), 0) + 1
        setIncomeRows(oldRows => [
            ...oldRows,
            { id, name: '', isNew: true, type: 'income' },
        ])
        setIncomeRowModesModel(oldModel => ({
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

export default function FullFeaturedCrudGrid() {
    const [expenseCategories, setExpenseCategories] = useState([])
    const [expenseRows, setExpenseRows] = useState([])
    const [incomeCategories, setIncomeCategories] = useState([])
    const [incomeRows, setIncomeRows] = useState([])
    const [expenseRowModesModel, setExpenseRowModesModel] = useState({})
    const [incomeRowModesModel, setIncomeRowModesModel] = useState({})

    const { user } = useAuth({ middleware: 'auth' })
    const userId = user.id

    useEffect(() => {
        if (user) {
            fetchCategories()
        }
    }, [user])

    useEffect(() => {
        const newExpenseRows = expenseCategories.map((cat, index) => {
            return {
                id: index + 1,
                name: cat.name,
                categoryId: cat.id,
                type: cat.type,
            }
        })
        console.log(newExpenseRows)
        setExpenseRows(newExpenseRows)
    }, [expenseCategories])

    useEffect(() => {
        const newIncomeRows = incomeCategories.map((cat, index) => {
            return {
                id: index + 1,
                name: cat.name,
                categoryId: cat.id,
                type: cat.type,
            }
        })
        console.log(newIncomeRows)
        setIncomeRows(newIncomeRows)
    }, [incomeCategories])

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true
        }
    }

    const handleEditClick = (id, type) => () => {
        console.log('handleEditClick called with id:', id, 'and type:', type)
        if (type === 'expense') {
            setExpenseRowModesModel({
                ...expenseRowModesModel,
                [id]: { mode: GridRowModes.Edit },
            })
            console.log(
                'expenseRowModesModel after update:',
                expenseRowModesModel,
            )
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
            setExpenseRowModesModel({
                ...expenseRowModesModel,
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
            setExpenseRowModesModel({
                ...expenseRowModesModel,
                [id]: { mode: GridRowModes.View, ignoreModifications: true },
            })

            const editedRow = expenseRows.find(row => row.id === id)
            if (editedRow.isNew) {
                setExpenseRows(expenseRows.filter(row => row.id !== id))
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

    // タイプごとのカテゴリー一覧取得処理
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
                        setExpenseRows(oldRows => [...oldRows, response.data])
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
                        setExpenseRows(oldRows =>
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
            setExpenseRows(
                expenseRows.map(row =>
                    row.id === newRow.id ? updatedRow : row,
                ),
            )
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
            targetRow = expenseRows.find(row => row.id === id)
        } else if (type === 'income') {
            targetRow = incomeRows.find(row => row.id === id)
        }
        try {
            const response = await axios.delete(
                `http://localhost/api/${userId}/category/${targetRow.categoryId}`,
            )
            if (response.status === 200) {
                if (type === 'expense') {
                    setExpenseRows(expenseRows.filter(row => row.id !== id))
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
        setExpenseRowModesModel(newRowModesModel)
    }

    const handleIncomeRowModesModelChange = newRowModesModel => {
        setIncomeRowModesModel(newRowModesModel)
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
            field: 'name',
            headerName: 'カテゴリー名',
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
                    expenseRowModesModel[id]?.mode === GridRowModes.Edit

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

    // 収入用カラム
    const incomeColumns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
            editable: false,
        },
        {
            field: 'name',
            headerName: 'カテゴリー名',
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
                    incomeRowModesModel[id]?.mode === GridRowModes.Edit

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
        <>
            <Header title="Category" />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {/* 支出カテゴリー一覧 */}
                <Box sx={{ width: '50%' }}>
                    <Typography variant="h6">支出カテゴリー</Typography>
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
                            rows={expenseRows}
                            columns={expenseColumns}
                            editMode="row"
                            rowModesModel={expenseRowModesModel}
                            onRowModesModelChange={
                                handleExpenseRowModesModelChange
                            }
                            onRowEditStop={handleRowEditStop}
                            processRowUpdate={processRowUpdate}
                            slots={{
                                toolbar: EditExpenseToolbar,
                            }}
                            slotProps={{
                                toolbar: {
                                    setExpenseRows,
                                    setExpenseRowModesModel,
                                    expenseRows,
                                },
                            }}
                        />
                    </Box>
                </Box>
                {/* 収入カテゴリー一覧 */}
                <Box sx={{ width: '50%' }}>
                    <Typography variant="h6">収入カテゴリー</Typography>
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
                            rows={incomeRows}
                            columns={incomeColumns}
                            editMode="row"
                            rowModesModel={incomeRowModesModel}
                            onRowModesModelChange={
                                handleIncomeRowModesModelChange
                            }
                            onRowEditStop={handleRowEditStop}
                            processRowUpdate={processRowUpdate}
                            slots={{
                                toolbar: EditIncomeToolbar,
                            }}
                            slotProps={{
                                toolbar: {
                                    setIncomeRows,
                                    setIncomeRowModesModel,
                                    incomeRows,
                                },
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </>
    )
}
