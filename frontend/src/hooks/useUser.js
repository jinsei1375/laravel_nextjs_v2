import { useState, useEffect } from 'react'
import axios from 'axios'

export const useUser = () => {
    const [user, setUser] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost/api/user', {
                    withCredentials: true,
                })
                setUser(response.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    return { user, loading }
}
