"use client"

import { useState } from "react"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name })
        })
        if (res.ok) {
            alert("Регистрация успешна!")
        } else {
            alert("Грешка при регистрация")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 space-y-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Име" className="w-full p-2 border" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full p-2 border" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Парола" type="password" className="w-full p-2 border" />
            <button type="submit" className="w-full bg-blue-500 text-white p-2">Регистрация</button>
        </form>
    )
}
