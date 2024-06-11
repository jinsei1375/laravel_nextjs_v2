import { Dialog } from '@headlessui/react'
import { DialogTitle } from '@mui/material'
import React from 'react'

const DialogTest = () => {
    return (
        <Dialog open={true} onClose={() => false}>
            <DialogTitle>取引追加</DialogTitle>
        </Dialog>
    )
}

export default DialogTest
