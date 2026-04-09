'use client'

import { useState } from 'react'
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material'
import { Language } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const languages = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
]

export default function LanguageSwitcher() {
    const { i18n } = useTranslation()
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleChangeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode)
        localStorage.setItem('i18nextLng', langCode)
        handleClose()
    }

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

    return (
        <>
            <IconButton
                onClick={handleClick}
                color="inherit"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <Box component="span" sx={{ fontSize: '1.5rem' }}>
                    {currentLanguage.flag}
                </Box>
                <Language />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    elevation: 3,
                    sx: { mt: 1.5, minWidth: 180 },
                }}
            >
                {languages.map((lang) => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => handleChangeLanguage(lang.code)}
                        selected={lang.code === i18n.language}
                        sx={{
                            '&.Mui-selected': {
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                },
                            },
                        }}
                    >
                        <ListItemIcon sx={{ fontSize: '1.5rem', minWidth: 40 }}>
                            {lang.flag}
                        </ListItemIcon>
                        <ListItemText>{lang.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}