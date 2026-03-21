'use client'

import { Box, Container, Typography, Link, IconButton, Divider, Stack } from '@mui/material'
import {
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    Twitter as TwitterIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    Hotel as HotelIcon,
} from '@mui/icons-material'
import NextLink from 'next/link'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'primary.dark',
                color: 'white',
                mt: 'auto',
                py: 6,
            }}
        >
            <Container maxWidth="xl">
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(4, 1fr)',
                        },
                        gap: 4,
                    }}
                >
                    {/* About Section */}
                    <Box component="section">
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <HotelIcon sx={{ mr: 1, fontSize: 28 }} />
                            <Typography variant="h6" fontWeight={700}>
                                Hotel Excelsior
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.7 }}>
                            Vivi un&apos;esperienza unica sulla riviera italiana.
                            Lusso, comfort e ospitalità dal 1950.
                        </Typography>
                    </Box>

                    {/* Quick Links */}
                    <Box component="section">
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Link Utili
                        </Typography>
                        <Stack spacing={1.5}>
                            {[
                                { label: 'Home', href: '/' },
                                { label: 'Chi Siamo', href: '/about' },
                                { label: 'Camere', href: '/rooms' },
                                { label: 'Contatti', href: '/contact' },
                                { label: 'Privacy Policy', href: '/privacy' },
                                { label: 'Termini e Condizioni', href: '/terms' },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    component={NextLink}
                                    href={link.href}
                                    color="inherit"
                                    underline="hover"
                                    sx={{
                                        opacity: 0.85,
                                        transition: 'opacity 0.2s',
                                        '&:hover': { opacity: 1 },
                                        display: 'block',
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </Stack>
                    </Box>

                    {/* Contact Info */}
                    <Box component="section">
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Contatti
                        </Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <PhoneIcon fontSize="small" sx={{ opacity: 0.7 }} />
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                        +39 123 456 789
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                                        Lun-Dom 9:00-22:00
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <EmailIcon fontSize="small" sx={{ opacity: 0.7 }} />
                                <Link
                                    href="mailto:info@excelsior.com"
                                    color="inherit"
                                    underline="hover"
                                    sx={{ opacity: 0.85, '&:hover': { opacity: 1 } }}
                                >
                                    info@excelsior.com
                                </Link>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
                                <LocationIcon fontSize="small" sx={{ opacity: 0.7, mt: 0.5 }} />
                                <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.6 }}>
                                    Via Roma 123<br />
                                    00100 Roma, Italia
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Social & Newsletter */}
                    <Box component="section">
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Seguici
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                            <IconButton
                                component="a"
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                sx={{
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                    },
                                }}
                            >
                                <FacebookIcon />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                sx={{
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                    },
                                }}
                            >
                                <InstagramIcon />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Twitter"
                                sx={{
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                    },
                                }}
                            >
                                <TwitterIcon />
                            </IconButton>
                        </Stack>

                        <Typography variant="body2" sx={{ opacity: 0.85 }}>
                            Ricevi offerte esclusive e novità direttamente nella tua email.
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.15)' }} />

                {/* Copyright */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        © {currentYear} Hotel Excelsior. Tutti i diritti riservati.
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.5, mt: 0.5, display: 'block' }}>
                        P.IVA: 12345678901 | Developed by Andrea Vandero
                    </Typography>
                </Box>
            </Container>
        </Box>
    )
}