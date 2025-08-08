"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        const res = await signIn("credentials", {
            email,
            password,
            redirect: true,
            callbackUrl: "/"
        })
    }

    return (
        <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-20 space-y-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full p-2 border" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Парола" type="password" className="w-full p-2 border" />
            <button type="submit" className="w-full bg-green-500 text-white p-2">Вход</button>
        </form>
    )
}
