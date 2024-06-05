'use client'
import { useAuth } from '@/hooks/auth'
import { Box, Typography } from '@mui/material'

const page = () => {
    const { user } = useAuth({ middleware: 'auth' })

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    marginTop: '20px',
                }}>
                <Typography>ユーザー名：</Typography>
                <Typography>{user.name}</Typography>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px',
                }}>
                <Typography>メールアドレス：</Typography>
                <Typography>{user.email}</Typography>
            </Box>
        </Box>
    )
}

export default page
