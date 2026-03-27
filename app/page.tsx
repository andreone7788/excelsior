'use client'

import Link from 'next/link'
import { Button, Container, Typography, Box } from '@mui/material'

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" gutterBottom>
          Excelsior Hotel
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Luxury Booking Experience
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button variant="contained" size="large" component={Link} href="/rooms">
            Esplora Camere
          </Button>
          <Button variant="outlined" size="large" component={Link} href="/login">
            Accedi
          </Button>
        </Box>
      </Box>
    </Container>
  )
}