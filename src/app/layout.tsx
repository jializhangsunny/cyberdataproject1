// app/layout.js (corrected import)
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/context/appcontext'  // Changed from AppContextProvider to AppProvider
import { AuthProvider } from '@/context/authContext'

import { UserPreferencesProvider } from '@/context/userPreferencesContext'
import { User } from 'lucide-react'

import FloatingHelp from "@/components/FloatingHelp";




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
            <UserPreferencesProvider>
              {children}
            </UserPreferencesProvider>
            {children}
            <FloatingHelp />
            <UserPreferencesProvider>
              {children}
            </UserPreferencesProvider>
            {children}
            <FloatingHelp />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}