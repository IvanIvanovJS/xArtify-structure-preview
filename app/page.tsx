"use client"

import { useSession, signOut } from "next-auth/react"

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <p className="text-center mt-20">Зарежда...</p>
  }

  return (
    <div className="max-w-md mx-auto mt-20 text-center space-y-4">
      {session ? (
        <>
          <h1 className="text-2xl font-bold">Здравей, {session.user?.name || session.user?.email}</h1>
          <p>Ти си логнат като: {session.user?.email}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Изход
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Добре дошъл в Art Platform</h1>
          <p>Моля, влез в акаунта си или се регистрирай.</p>
          <div className="flex justify-center gap-4">
            <a href="/login" className="bg-green-500 text-white px-4 py-2 rounded">Вход</a>
            <a href="/register" className="bg-blue-500 text-white px-4 py-2 rounded">Регистрация</a>
          </div>
        </>
      )}
    </div>
  )
}
