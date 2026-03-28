'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Container, Avatar, Menu, MenuItem, useTheme, useMediaQuery } from '@mui/material'
import { Menu as MenuIcon, Dashboard, CalendarMonth, ChatBubble, AccountCircle, Logout, ChevronLeft, Home } from '@mui/icons-material'
import { useAuth } from '@/lib/hooks/useAuth'

// Definizione della larghezza del drawer
const DRAWER_WIDTH = 200

interface DashboardUserProps {
    children: ReactNode
}

export function DashboardUser({ children }: DashboardUserProps) {
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

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
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
        { text: 'Home', icon: <Home />, path: '/' },
        { text: 'Dashboard', icon: <Dashboard />, path: '/user/dashboard' },
        { text: 'Prenotazioni', icon: <CalendarMonth />, path: '/user/bookings' },
        { text: 'AI Assistant', icon: <ChatBubble />, path: '/user/chat' },
        { text: 'Profilo', icon: <AccountCircle />, path: '/user/profile' },
    ]

    // Contenuto del drawer (sidebar)
    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Sidebar Header */}
            <Box
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Typography
                    variant="h5"
                    fontWeight={700}
                    color="primary"
                    sx={{ letterSpacing: '0.5px' }}
                >
                    EXCELSIOR
                </Typography>
                {isMobile && (
                    <IconButton onClick={handleDrawerToggle}>
                        <ChevronLeft />
                    </IconButton>
                )}
            </Box>

            {/* User Info */}
            <Box
                sx={{
                    p: 3,
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'primary.main',
                    color: 'white',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        sx={{
                            bgcolor: 'white',
                            color: 'primary.main',
                            width: 50,
                            height: 50,
                            fontSize: '1.5rem',
                            fontWeight: 700,
                        }}
                    >
                        {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                            {user?.name} {user?.surname}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }} noWrap>
                            {user?.email}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Navigation Menu */}
            <List sx={{ flex: 1, px: 2, py: 2 }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                component={Link}
                                href={item.path}
                                onClick={() => isMobile && setMobileOpen(false)}
                                selected={isActive}
                                sx={{
                                    borderRadius: 2,
                                    py: 1.5,
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
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: isActive ? 'inherit' : 'text.secondary',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 400,
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>

            {/* Footer */}
            <Box
                sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                }}
            >
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                    © 2026 Excelsior Hotel
                </Typography>
            </Box>
        </Box>
    )

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderBottom: 1,
                    borderColor: 'divider',
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

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        {menuItems.find((item) => item.path === pathname)?.text || 'Dashboard'}
                    </Typography>

                    {/* User Menu */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="body2" fontWeight={600}>
                                {user?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user?.role}
                            </Typography>
                        </Box>
                        <IconButton onClick={handleMenu} size="large">
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'primary.main',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                }}
                            >
                                {user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Box>

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
                            <AccountCircle sx={{ mr: 1.5 }} fontSize="small" />
                            Profilo
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <Logout sx={{ mr: 1.5 }} fontSize="small" />
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer */}
            <Box
                component="nav"
                sx={{
                    width: { md: DRAWER_WIDTH },
                    flexShrink: { md: 0 },
                }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                            borderRight: 1,
                            borderColor: 'divider',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                    pt: 8,
                }}
            >
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    {children}
                </Container>
            </Box>
        </Box>
    )
}