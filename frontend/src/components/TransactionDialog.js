import { Dialog } from '@headlessui/react'
import {
    Box,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stack,
    TextField,
} from '@mui/material'
import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

const TransactionDialog = ({ open, currentType, handleSubmit }) => {
    // 取引追加処理
    const onSubmit = async data => {
        try {
            if (isNew) {
                console.log(data.amount)
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
                    `http://localhost/api/${userId}/transaction/${data.transactionId}`,
                    {
                        date: data.date,
                        amount: data.amount,
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

    // const formOptions = { resolver: zodResolver(transactionSchema) }

    useEffect(() => {
        const newCategories =
            currentType === 'income' ? incomeCategories : expenseCategories
        console.log(newCategories)
        setCategories(newCategories)
    }, [currentType])

    const handleClose = () => {
        setOpen(false)
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
                        <Button type="submit">{isNew ? '追加' : '更新'}</Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default TransactionDialog
