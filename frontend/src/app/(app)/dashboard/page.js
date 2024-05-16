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
} from '@mui/material'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import axios from 'axios'
import { useUser } from '@/hooks/useUser'

const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(null)
    const [open, setOpen] = useState(false)
    const [openAddCategoryList, setOpenAddCategoryList] = useState(false)
    const [openAddCategory, setOpenAddCategory] = useState(false)
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')
    const [categories, setCategories] = useState([])

    const { user, locading } = useUser()

    useEffect(() => {
        if (user) {
            fetchCategories()
        }
    }, [user])

    const fetchCategories = async () => {
        try {
            const userId = user.id
            const response = await axios.get(
                `http://localhost/api/${userId}/categories`,
            )
            setCategories(response.data)
        } catch (err) {
            console.log(err)
        }
    }

    const handleDateChange = info => {
        console.log(info)
        setSelectedDate(info.dateStr)
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleAmountChange = event => {
        setAmount(event.target.value)
    }

    const handleCategoryChange = event => {
        setCategory(event.target.value)
    }

    const handleAddCategory = () => {
        setCategories([...categories, category])
        setCategory('')
        setOpenAddCategory(false)
    }

    return (
        <>
            <Header title="Dashboard" />

            <Button onClick={() => setOpenAddCategory(true)}>カテゴリー</Button>
            <FullCalendar
                locale="ja"
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                dateClick={handleDateChange}
            />

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>収支入力</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="金額"
                        type="number"
                        fullWidth
                        value={amount}
                        onChange={handleAmountChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>キャンセル</Button>
                    <Button onClick={handleClose}>保存</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openAddCategory}
                onClose={() => setOpenAddCategory(false)}>
                <DialogTitle>カテゴリー一覧</DialogTitle>
                <DialogContent>
                    <List>
                        {categories.map((cat, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={cat.name} />
                                <ListItemText primary={cat.type} />
                            </ListItem>
                        ))}
                    </List>
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

export default Dashboard
