'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { AppBar, Toolbar, Typography, Button, IconButton, Avatar, Menu, MenuItem, Container, Box, Divider } from '@mui/material'
import { AccountCircle, Dashboard, Logout, CalendarMonth, ChatBubble, AdminPanelSettings } from '@mui/icons-material'
import { useState, MouseEvent } from 'react'

export function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = async () => {
        handleClose()
        try {
            await logout()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <AppBar
            position="sticky"
            color="default"
            elevation={1}
            sx={{ bgcolor: 'background.page' }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                    {/* LOGO */}
                    <Typography
                        variant="h6"
                        component={Link}
                        href="/"
                        sx={{
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            color: 'primary.main',
                            textDecoration: 'none',
                            letterSpacing: '-0.5px',
                            '&:hover': {
                                opacity: 0.8,
                            },
                        }}
                    >
                        EXCELSIOR
                    </Typography>

                    {/* NAV LINKS */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: { xs: 'none', md: 'flex' },
                            ml: 6,
                            gap: 1
                        }}
                    >
                        <Button
                            component={Link}
                            href="/rooms"
                            color="inherit"
                            sx={{ fontWeight: 500 }}
                        >
                            Camere
                        </Button>
                        {isAuthenticated && (
                            <Button
                                component={Link}
                                href="/user/chat"
                                color="inherit"
                                startIcon={<ChatBubble />}
                                sx={{ fontWeight: 500 }}
                            >
                                AI Assistant
                            </Button>
                        )}
                    </Box>

                    {/* USER MENU */}
                    {isAuthenticated ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    display: { xs: 'none', sm: 'block' },
                                    color: 'text.secondary',
                                    mr: 1
                                }}
                            >
                                {user?.name}
                            </Typography>
                            <IconButton
                                size="large"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: 'primary.main',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {user?.name?.charAt(0).toUpperCase()}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                PaperProps={{
                                    elevation: 3,
                                    sx: {
                                        mt: 1.5,
                                        minWidth: 220,
                                    }
                                }}
                            >
                                <Box sx={{ px: 2, py: 1 }}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {user?.name}
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {user?.email}
                                    </Typography>
                                </Box>
                                <Divider />
                                <MenuItem
                                    component={Link}
                                    href={isAdmin ? '/admin/dashboard' : '/user/dashboard'}
                                    onClick={handleClose}
                                >
                                    {isAdmin ? (
                                        <AdminPanelSettings sx={{ mr: 1.5 }} fontSize="small" />
                                    ) : (
                                        <Dashboard sx={{ mr: 1.5 }} fontSize="small" />
                                    )}
                                    Dashboard
                                </MenuItem>
                                <MenuItem
                                    component={Link}
                                    href="/user/profile"
                                    onClick={handleClose}
                                >
                                    <AccountCircle sx={{ mr: 1.5 }} fontSize="small" />
                                    Profilo
                                </MenuItem>
                                <MenuItem
                                    component={Link}
                                    href="/user/bookings"
                                    onClick={handleClose}
                                >
                                    <CalendarMonth sx={{ mr: 1.5 }} fontSize="small" />
                                    Prenotazioni
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                    <Logout sx={{ mr: 1.5 }} fontSize="small" />
                                    Logout
                                </MenuItem>
                            </Menu>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                component={Link}
                                href="/login"
                                color="inherit"
                                variant="outlined"
                            >
                                Login
                            </Button>
                            <Button
                                component={Link}
                                href="/register"
                                variant="contained"
                            >
                                Registrati
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    )
}