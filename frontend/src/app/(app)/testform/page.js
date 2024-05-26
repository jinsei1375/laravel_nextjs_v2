import { Controller, useForm } from 'react-hook-form'

export default function TestForm() {
    // useFormのインスタンスを作成
    const { handleSubmit, control } = useForm()

    // フォームの送信時に呼び出される関数
    const onSubmit = data => console.log(data)

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="fieldName" // ここが重要です。これがdataオブジェクトのキーとなります。
                    control={control}
                    defaultValue=""
                    render={({ field }) => <input {...field} />}
                />
                <input type="submit" />
            </form>
        </>
    )
}
