'use client'
import Header from '@/app/(app)/Header'
import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Box,
    Typography,
} from '@mui/material'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'
import { DataGrid } from '@mui/x-data-grid'
import { set } from 'react-hook-form'

const Category = () => {
    const [openAddCategory, setOpenAddCategory] = useState(false)
    const [category, setCategory] = useState('')
    const [categories, setCategories] = useState([])
    const [incomeCategories, setIncomeCategories] = useState([])
    const [expenseCategories, setExpenseCategories] = useState([])
    const [type, setType] = useState('expense')

    const { user } = useAuth({ middleware: 'auth' })

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        {
            field: 'name',
            headerName: 'カテゴリー名',
            width: 150,
            editable: true,
        },
    ]

    const expenseRows = expenseCategories.map((cat, index) => {
        return { id: index + 1, name: cat.name }
    })
    const incomeRows = incomeCategories.map((cat, index) => {
        return { id: index + 1, name: cat.name }
    })

    useEffect(() => {
        if (user) {
            fetchCategories()
        }
    }, [user, categories])

    // タイプごとのカテゴリー一覧取得処理
    const fetchCategories = async () => {
        try {
            const userId = user.id
            const response = await axios.get(
                `http://localhost/api/${userId}/category/`,
            )
            // console.log(response.data)
            const fetchedCategories = response.data
            // setCategories(fetchedCategories)

            const filteredExpenseCategories = fetchedCategories.filter(
                cat => cat.type === 'expense',
            )
            setExpenseCategories(filteredExpenseCategories)
            const filteredIncomeCategories = fetchedCategories.filter(
                cat => cat.type === 'income',
            )
            setIncomeCategories(filteredIncomeCategories)
            console.log(filteredExpenseCategories)
        } catch (err) {
            console.log(err)
        }
    }

    // 新規カテゴリー追加処理
    const handleAddCategory = async () => {
        try {
            console.log(category, type)
            const userId = user.id
            const response = await axios.post(
                `http://localhost/api/${userId}/category`,
                { name: category, type: type },
            )

            if (response.status === 200) {
                setCategories(oldCategories => [
                    ...oldCategories,
                    response.data,
                ])
                setCategory('')
                setOpenAddCategory(false)
            } else {
                console.log('Error occurred while adding category')
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleCategoryChange = event => {
        setCategory(event.target.value)
    }

    const handleTypeChange = event => {
        setType(event.target.value)
    }

    return (
        <>
            <Header title="Setting" />
            <Button onClick={() => setOpenAddCategory(true)}>
                カテゴリー追加
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* 支出カテゴリー一覧 */}
                <Box sx={{ width: '50%' }}>
                    <Typography variant="h6">支出カテゴリー</Typography>
                    <Box>
                        <DataGrid
                            rows={expenseRows}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 5,
                                    },
                                },
                            }}
                            pageSizeOptions={[5]}
                            checkboxSelection
                            disableRowSelectionOnClick
                        />
                    </Box>
                </Box>
                {/* 収入カテゴリー一覧 */}
                <Box sx={{ width: '50%' }}>
                    <Typography variant="h6">収入カテゴリー</Typography>
                    <Box>
                        <DataGrid
                            rows={incomeRows}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 5,
                                    },
                                },
                            }}
                            pageSizeOptions={[5]}
                            checkboxSelection
                            disableRowSelectionOnClick
                        />
                    </Box>
                </Box>
            </Box>
            <Dialog
                open={openAddCategory}
                onClose={() => setOpenAddCategory(false)}>
                <DialogTitle>カテゴリー追加</DialogTitle>
                <DialogContent>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">支出 or 収入</FormLabel>
                        <RadioGroup
                            aria-label="type"
                            name="type"
                            value={type}
                            onChange={handleTypeChange}>
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
                    <TextField
                        autoFocus
                        margin="dense"
                        label="カテゴリー名"
                        type="text"
                        fullWidth
                        value={category}
                        onChange={handleCategoryChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddCategory(false)}>
                        キャンセル
                    </Button>
                    <Button onClick={handleAddCategory}>保存</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default Category
