import "./globals.css"
import Providers from "./providers"

export const metadata = {
  title: "Art Platform",
  description: "Your art marketplace"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
