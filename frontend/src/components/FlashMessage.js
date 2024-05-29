import { Grow, Snackbar } from '@mui/material'

const FlashMessage = ({ open, message, handleClose }) => {
    return (
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={open}
            onClose={handleClose}
            TransitionComponent={Grow}
            message={message}
            key={message}
            autoHideDuration={2000}
            ContentProps={{
                sx: {
                    backgroundColor: 'mediumseagreen',
                    color: 'white',
                    borderRadius: '5px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                },
            }}
        />
    )
}

export default FlashMessage
