'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Box, Container, useTheme, useMediaQuery } from '@mui/material'
import { Menu as MenuIcon, Close } from '@mui/icons-material'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Navbar() {
    const { t } = useTranslation()
    const { user } = useAuth()
    const pathname = usePathname()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const navLinks = [
        { label: t('nav.home'), href: '/' },
        { label: t('nav.about'), href: '/about' },
        { label: t('nav.contact'), href: '/contact' },
        { label: t('nav.rooms'), href: '/rooms' },
    ]

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="h6" fontWeight={700} color="primary">
                    EXCELSIOR
                </Typography>
                <IconButton onClick={handleDrawerToggle}>
                    <Close />
                </IconButton>
            </Box>
            <List>
                {navLinks.map((item) => (
                    <ListItem key={item.href} disablePadding>
                        <ListItemButton
                            component={Link}
                            href={item.href}
                            selected={pathname === item.href}
                            sx={{ textAlign: 'center' }}
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
                {!user ? (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/login" sx={{ textAlign: 'center' }}>
                                <ListItemText primary={t('nav.login')} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/register" sx={{ textAlign: 'center' }}>
                                <ListItemText primary={t('nav.register')} />
                            </ListItemButton>
                        </ListItem>
                    </>
                ) : (
                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/user/dashboard" sx={{ textAlign: 'center' }}>
                            <ListItemText primary={t('nav.dashboard')} />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Box>
    )

    return (
        <>
            <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: 1, borderColor: 'divider' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* Logo */}
                        <Typography
                            variant="h5"
                            component={Link}
                            href="/"
                            sx={{
                                mr: 4,
                                fontWeight: 700,
                                color: 'primary.main',
                                textDecoration: 'none',
                                letterSpacing: '0.5px',
                            }}
                        >
                            EXCELSIOR
                        </Typography>

                        {/* Desktop Menu */}
                        {!isMobile && (
                            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                                {navLinks.map((item) => (
                                    <Button
                                        key={item.href}
                                        component={Link}
                                        href={item.href}
                                        sx={{
                                            color: pathname === item.href ? 'primary.main' : 'text.primary',
                                            fontWeight: pathname === item.href ? 600 : 400,
                                            '&:hover': { bgcolor: 'action.hover' },
                                        }}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                            </Box>
                        )}

                        {/* Right Side */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                            {/* Language Switcher */}
                            <LanguageSwitcher />

                            {/* Auth Buttons */}
                            {!isMobile && (
                                <>
                                    {!user ? (
                                        <>
                                            <Button component={Link} href="/login" variant="outlined">
                                                {t('nav.login')}
                                            </Button>
                                            <Button component={Link} href="/register" variant="contained">
                                                {t('nav.register')}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button component={Link} href="/user/dashboard" variant="contained">
                                            {t('nav.dashboard')}
                                        </Button>
                                    )}
                                </>
                            )}

                            {/* Mobile Menu Icon */}
                            {isMobile && (
                                <IconButton color="inherit" onClick={handleDrawerToggle}>
                                    <MenuIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
                {drawer}
            </Drawer>
        </>
    )
}