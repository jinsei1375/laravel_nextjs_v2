import axios from '@/lib/axios'
import { Dialog } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Stack,
    TextField,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAppContext } from '@/context/AppContext'

const TransactionFormDialog = ({
    open,
    setOpen,
    handleClose,
    currentDay,
    isNew,
    categories,
    selectedRow,
    userId,
    setRows,
}) => {
    const [state, setState] = useState({
        open: false,
    })

    const {
        transactions,
        setTransactions,
        fetchTransactions,
        setCategories,
        expenseCategories,
        incomeCategories,
    } = useAppContext()

    // 取引追加処理
    const onSubmit = async data => {
        try {
            if (isNew) {
                console.log(data)
                console.log(userId)
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
                    fetchTransactions()
                    console.log(newTransaction)
                    handleSnackBarOpen('追加しました')
                } else {
                    console.log('Error occurred while adding transaction')
                }
            } else {
                const response = await axios.put(
                    `http://localhost/api/${userId}/transaction/${selectedRow.transactionId}`,
                    {
                        date: data.date,
                        amount: parseFloat(data.amount),
                        title: data.title,
                        category: data.category,
                    },
                )
                if (response.status === 200) {
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
                    fetchTransactions()
                    handleSnackBarOpen('更新しました')
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

    const transactionSchema = z.object({
        type: z.enum(['income', 'expense']),
        date: z.string().min(1, { message: '日付は必須です' }),
        amount: z.string().min(1, { message: '金額は1円以上必須です' }),
        title: z
            .string()
            .min(1, { message: '内容を入力してください' })
            .max(50, { message: '内容は50文字以内にしてください。' }),
        category: z.number({ message: 'カテゴリーを選択してください' }),
        // .enum([
        //     ...expenseCategories.map(cat => cat.id),
        //     ...incomeCategories.map(cat => cat.id),
        // ])
        // .refine(val => val !== '', {
        //     message: 'カテゴリを選択してください',
        // }),
    })

    const {
        control,
        setValue,
        watch,
        formState: { errors },
        reset,
        handleSubmit,
    } = useForm({
        // todo resolverを使うとエラーが出る
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: 'expense',
            date: currentDay,
            amount: 0,
            title: '',
            category: '',
            transactionId: '',
        },
    })

    // 収支タイプを監視
    const currentType = watch('type')

    useEffect(() => {
        const newCategories =
            currentType === 'income' ? incomeCategories : expenseCategories
        console.log(newCategories)
        setCategories(newCategories)
    }, [currentType])

    // フォーム内容更新
    useEffect(() => {
        if (!isNew) {
            setValue('id', selectedRow.id)
            setValue('title', selectedRow.title)
            setValue('type', selectedRow.type == '収入' ? 'income' : 'expense')
            setValue('category', Number(selectedRow.categoryId))
            setValue(
                'amount',
                selectedRow.amount?.replace('¥', '').replace(/,/g, ''),
            )
            setValue('date', selectedRow.date)
            setValue('transactionId', selectedRow.transactionId)
            console.log(selectedRow)
        } else {
            reset({
                type: 'expense',
                date: currentDay,
                amount: 0,
                category: '',
                content: '',
            })
        }
    }, [isNew, selectedRow, open])

    const incomeExpenseToggle = type => {
        setValue('type', type)
        setValue('category', '')
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

    return (
        <Dialog open={open} onClose={handleClose}>
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
                                            incomeExpenseToggle(e.target.value)
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
                                        {categories.map(category => {
                                            return (
                                                <MenuItem
                                                    key={category.id}
                                                    value={Number(category.id)}>
                                                    {category.name}
                                                </MenuItem>
                                            )
                                        })}
                                    </Select>
                                    <FormHelperText>
                                        {errors.category?.message}
                                    </FormHelperText>
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
                        <Button type="submit">{isNew ? '追加' : '更新'}</Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default TransactionFormDialog
