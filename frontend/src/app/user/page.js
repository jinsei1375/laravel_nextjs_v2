'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const page = () => {
    const [users, setUsers] = useState([])

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost/api/users')
            console.log(response.data)
            setUsers(response.data)
        } catch (err) {
            console.log(1)
            console.log(err)
        }
    }
    const displayFirstUser = () => {
        const filteredUsers = users.filter(user => user.id == 1)
        setUsers(filteredUsers)
    }
    const displayAllUser = () => {
        fetchUsers()
    }

    return (
        <div>
            {users &&
                users.map((user, index) => <div key={index}>{user.name}</div>)}
            <button onClick={displayFirstUser}>id1のユーザーだけ</button>
            <button onClick={displayAllUser}>全て</button>
        </div>
    )
}

export default page
