'use client'

import Footer from './Footer'
import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, useTheme, useMediaQuery, Badge } from '@mui/material'
import { Menu as MenuIcon, Dashboard, CalendarMonth, ChatBubble, AccountCircle, Logout, Home, Notifications } from '@mui/icons-material'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../language/LanguageSwitcher'

interface DashboardLayoutProps {
    children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { t } = useTranslation()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = async () => {
        handleClose()
        await logout()
        router.push('/login')
    }

    // Definizione dei menu di navigazione
    const menuItems = [
        { text: t('nav.home'), icon: <Home />, path: '/' },
        { text: t('nav.dashboard'), icon: <Dashboard />, path: '/user/dashboard' },
        { text: t('nav.bookings'), icon: <CalendarMonth />, path: '/user/bookings' },
        { text: 'AI Assistant', icon: <ChatBubble />, path: '/user/chat' },
        { text: t('nav.profile'), icon: <AccountCircle />, path: '/user/profile' },
    ]

    // Contenuto del drawer (sidebar)
    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h5" fontWeight={700} color="primary">
                    EXCELSIOR
                </Typography>
            </Box>

            {/* User Info */}
            {user && (
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                            {user.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                                {user.name} {user.surname}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user.email}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Menu Items */}
            <List sx={{ flexGrow: 1, pt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ px: 2, mb: 0.5 }}>
                        <ListItemButton
                            component={Link}
                            href={item.path}
                            selected={pathname === item.path}
                            onClick={() => isMobile && handleDrawerToggle()}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    )

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - 280px)` },
                    ml: { md: '280px' },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderBottom: 1,
                    borderColor: 'divider',
                    boxShadow: 0,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
                        {menuItems.find((item) => item.path === pathname)?.text || 'Dashboard'}
                    </Typography>

                    {/* Language Switcher */}
                    <LanguageSwitcher />

                    {/* Notifications */}
                    <IconButton color="inherit" sx={{ ml: 1 }}>
                        <Badge badgeContent={3} color="error">
                            <Notifications />
                        </Badge>
                    </IconButton>

                    {/* User Menu */}
                    <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                            {user?.name?.[0]?.toUpperCase()}
                        </Avatar>
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* User Menu Dropdown */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    elevation: 3,
                    sx: { mt: 1.5, minWidth: 200 },
                }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {user?.name} {user?.surname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                        {user?.email}
                    </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { handleClose(); router.push('/user/profile') }}>
                    <ListItemIcon>
                        <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('nav.profile')}</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon sx={{ color: 'error.main' }}>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('nav.logout')}</ListItemText>
                </MenuItem>
            </Menu>

            {/* Sidebar Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={isMobile ? mobileOpen : true}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: 280,
                            borderRight: 1,
                            borderColor: 'divider',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content + Footer */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - 280px)` },
                    mt: '64px',
                    bgcolor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 'calc(100vh - 64px)', // Altezza minima meno l'AppBar
                }}
            >
                <Box sx={{ flexGrow: 1, p: 3 }}>
                    {children}
                </Box>

                {/* Footer dashboard - allineato con sidebar */}
                <Footer />
            </Box>
        </Box>
    )
}