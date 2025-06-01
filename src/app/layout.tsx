// app/layout.js (corrected import)
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/context/appcontext'  // Changed from AppContextProvider to AppProvider
import { AuthProvider } from '@/context/authContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Threat Analysis Platform',
  description: 'Advanced threat actor analysis and risk assessment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}