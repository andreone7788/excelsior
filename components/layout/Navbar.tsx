'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Box,
    Container,
    useTheme,
    useMediaQuery,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon
} from '@mui/material'
import { Menu as MenuIcon, Close, AccountCircle, Logout } from '@mui/icons-material'
import LanguageSwitcher from '@/components/language/LanguageSwitcher'

export default function Navbar() {
    const { t } = useTranslation()
    const { user, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const [mobileOpen, setMobileOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = async () => {
        handleMenuClose()
        await logout()
        router.push('/login')
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
                    <>
                        <ListItem disablePadding>
                            <ListItemButton
                                component={Link}
                                href={user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'}
                                sx={{ textAlign: 'center' }}
                            >
                                <ListItemText primary={t('nav.dashboard')} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout} sx={{ textAlign: 'center', color: 'error.main' }}>
                                <ListItemText primary={t('nav.logout') || 'Logout'} />
                            </ListItemButton>
                        </ListItem>
                    </>
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
                                        <>
                                            <Button
                                                component={Link}
                                                href={user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'}
                                                variant="contained"
                                            >
                                                {t('nav.dashboard')}
                                            </Button>
                                            {/* User Avatar Menu */}
                                            <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                                                    {user.name?.[0]?.toUpperCase()}
                                                </Avatar>
                                            </IconButton>
                                        </>
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

            {/* User Menu Dropdown */}
            {user && (
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                        elevation: 3,
                        sx: { mt: 1.5, minWidth: 200 },
                    }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {user.name} {user.surname}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                            {user.email}
                        </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => {
                        handleMenuClose()
                        router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/user/profile')
                    }}>
                        <ListItemIcon>
                            <AccountCircle fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{user.role === 'ADMIN' ? 'Dashboard' : t('nav.profile')}</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon sx={{ color: 'error.main' }}>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('nav.logout') || 'Logout'}</ListItemText>
                    </MenuItem>
                </Menu>
            )}

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
                }}
            >
                {drawer}
            </Drawer>

            {/* Spacer */}
            <Toolbar />
        </>
    )
}