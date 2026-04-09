import { ReactNode } from 'react'
import { Box } from '@mui/material'
import Footer from '@/components/layout/Footer'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Box component="main">
        {children}
      </Box>
      <Footer />
    </>
  )
}