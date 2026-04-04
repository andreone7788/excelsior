import { ReactNode } from 'react'
import { Box } from '@mui/material'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Box component="main">
        {children}
      </Box>
    </>
  )
}