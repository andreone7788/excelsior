import { ReactNode } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Box } from '@mui/material'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <Box component="main">
        {children}
      </Box>
    </>
  )
}