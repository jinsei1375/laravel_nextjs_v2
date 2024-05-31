import { formatCurrency } from '@/app/utils/formatting'
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import React from 'react'

const MonthlySummary = ({ monthlyTransactions }) => {
    // 月毎の収支取得
    const { income, expense, balance } = monthlyTransactions.reduce(
        (acc, transaction) => {
            if (transaction.category.type === 'income') {
                acc.income += transaction.amount
            } else {
                acc.expense += transaction.amount
            }
            acc.balance = acc.income - acc.expense

            return acc
        },
        { income: 0, expense: 0, balance: 0 },
    )
    return (
        <Grid container spacing={{ xs: 1, sm: 2 }} mb={2} pt={2}>
            {/* 収入 */}
            <Grid item xs={4} display={'flex'} flexDirection={'column'}>
                <Card
                    sx={{
                        // bgcolor: theme => theme.palette.incomeColor.main,
                        // color: 'white',
                        borderRadius: '10px',
                        flexGrow: 1,
                    }}>
                    <CardContent sx={{ padding: { xs: 1, sm: 2 } }}>
                        <Stack direction={'row'}>
                            {/* <ArrowUpwardIcon sx={{ fontSize: '2rem' }} /> */}
                            <Typography>収入</Typography>
                        </Stack>
                        <Typography
                            textAlign={'right'}
                            variant="h5"
                            fontWeight={'fontWeightBold'}
                            sx={{
                                wordBreak: 'break-word',
                                fontSize: {
                                    xs: '.8rem',
                                    sm: '1rem',
                                    md: '1.2rem',
                                },
                            }}>
                            ¥{formatCurrency(income)}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            {/* 支出 */}
            <Grid item xs={4} display={'flex'} flexDirection={'column'}>
                <Card
                    sx={{
                        // bgcolor: theme => theme.palette.expenseColor.main,
                        // color: 'white',
                        borderRadius: '10px',
                        flexGrow: 1,
                    }}>
                    <CardContent sx={{ padding: { xs: 1, sm: 2 } }}>
                        <Stack direction={'row'}>
                            {/* <ArrowDownwardIcon sx={{ fontSize: '2rem' }} /> */}
                            <Typography>支出</Typography>
                        </Stack>
                        <Typography
                            textAlign={'right'}
                            variant="h5"
                            fontWeight={'fontWeightBold'}
                            sx={{
                                wordBreak: 'break-word',
                                fontSize: {
                                    xs: '.8rem',
                                    sm: '1rem',
                                    md: '1.2rem',
                                },
                            }}>
                            ¥{formatCurrency(expense)}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            {/* 残高 */}
            <Grid item xs={4} display={'flex'} flexDirection={'column'}>
                <Card
                    sx={{
                        // bgcolor: theme => theme.palette.balanceColor.main,
                        // color: 'white',
                        borderRadius: '10px',
                        flexGrow: 1,
                    }}>
                    <CardContent sx={{ padding: { xs: 1, sm: 2 } }}>
                        <Stack direction={'row'}>
                            {/* <AccountBalanceIcon sx={{ fontSize: '2rem' }} /> */}
                            <Typography>残高</Typography>
                        </Stack>
                        <Typography
                            textAlign={'right'}
                            variant="h5"
                            fontWeight={'fontWeightBold'}
                            sx={{
                                wordBreak: 'break-word',
                                fontSize: {
                                    xs: '.8rem',
                                    sm: '1rem',
                                    md: '1.2rem',
                                },
                            }}>
                            ¥{formatCurrency(balance)}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default MonthlySummary
