// app/layout.js (corrected import)
import { Inter } from 'next/font/google';
import './globals.css';

import { AuthProvider } from '@/context/authContext';
import { UserPreferencesProvider } from '@/context/userPreferencesContext';
import { AppProvider } from '@/context/appcontext';
import FloatingHelp from '@/components/FloatingHelp';
import ViewerOverlay from '@/components/ViewerOverlay';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Threat Analysis Platform',
  description: 'Advanced threat actor analysis and risk assessment',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <UserPreferencesProvider>
            <AppProvider>
              <div className='relative'>
                {children}
                <ViewerOverlay />
              </div>
              <FloatingHelp />
            </AppProvider>
          </UserPreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}