import axios from '@/lib/axios'

// 取引取得処理
export async function fetchTransactions(user) {
    try {
        const response = await axios.get(
            `http://localhost/api/${user.id}/transaction/`,
        )

        return response.data
    } catch (err) {
        console.log(err)
    }
}
