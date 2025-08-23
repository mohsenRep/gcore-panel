import './globals.css'
import Navigation from '../components/Navigation'

export const metadata = {
  title: 'GCore Panel',
  description: 'Manage your GCore accounts and monitor traffic usage',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}