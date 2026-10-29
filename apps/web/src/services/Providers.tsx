'use client'

import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { store } from './Store'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-right"
        theme="system"
        richColors
        closeButton
        expand={false}
        duration={4500}
        visibleToasts={4}
        gap={10}
        offset={{ top: 20, right: 20 }}
        mobileOffset={{ top: 12, right: 12, left: 12 }}
        toastOptions={{
          className: 'font-sans',
          style: {
            borderRadius: '12px',
            border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-lg)',
          },
        }}
      />
    </Provider>
  )
}
