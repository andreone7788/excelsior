/**
 * Layout principale per le pagine pubbliche del sito.
 * Include un header con il logo e un footer con i link di contatto e social media.
 * Utilizza Material-UI per lo styling e garantisce un design responsive su tutti i dispositivi.
 * Il layout è progettato per essere semplice e pulito, mettendo in risalto i contenuti delle pagine figlie.
 */

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