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

function EditToolbar(props) {
    const { setExpenseRows, setRowModesModel, expenseRows } = props

    const handleClick = () => {
        const id = Math.max(...expenseRows.map(row => row.id), 0) + 1
        setExpenseRows(oldRows => [
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
                Add record
            </Button>
        </GridToolbarContainer>
    )
}

export default function FullFeaturedCrudGrid() {
    const [expenseCategories, setExpenseCategories] = useState([])
    const [expenseRows, setExpenseRows] = useState([])
    const [rowModesModel, setRowModesModel] = useState({})

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

        const editedRow = expenseRows.find(row => row.id === id)
        if (editedRow.isNew) {
            setExpenseRows(expenseRows.filter(row => row.id !== id))
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
            setExpenseCategories(filteredExpenseCategories)
            console.log(filteredExpenseCategories)
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
                    setExpenseRows(oldRows => [...oldRows, response.data])
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
                    setExpenseRows(oldRows =>
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
        setExpenseRows(
            expenseRows.map(row => (row.id === newRow.id ? updatedRow : row)),
        )
        return updatedRow
    }

    const handleDeleteClick = id => async () => {
        const targetRow = expenseRows.find(row => row.id === id)
        try {
            const response = await axios.delete(
                `http://localhost/api/${userId}/category/${targetRow.categoryId}`,
            )
            if (response.status === 200) {
                setExpenseRows(expenseRows.filter(row => row.id !== id))
                console.log(response.data.message)
            } else {
                console.log('Error occurred while adding category')
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleRowModesModelChange = newRowModesModel => {
        setRowModesModel(newRowModesModel)
    }

    const columns = [
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
            getActions: ({ id }) => {
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
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ]
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ]
            },
        },
    ]

    return (
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
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                slots={{
                    toolbar: EditToolbar,
                }}
                slotProps={{
                    toolbar: { setExpenseRows, setRowModesModel, expenseRows },
                }}
            />
        </Box>
    )
}
