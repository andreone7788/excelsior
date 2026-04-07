'use client'

import { Box, Container, Typography, Link, IconButton, Divider } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Facebook, Instagram, Twitter } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

export default function Footer() {
    const { t } = useTranslation()
    const currentYear = new Date().getFullYear()

    return (
        <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', py: 6, mt: 'auto' }}>
            <Container maxWidth="xl">
                <Grid container spacing={4}>
                    {/* Brand */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
                            EXCELSIOR
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {t('footer.address')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('footer.phone')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('footer.email')}
                        </Typography>
                    </Grid>

                    {/* Quick Links */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            {t('footer.quickLinks')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Link href="/" color="text.secondary" underline="hover">
                                {t('nav.home')}
                            </Link>
                            <Link href="/about" color="text.secondary" underline="hover">
                                {t('nav.about')}
                            </Link>
                            <Link href="/contact" color="text.secondary" underline="hover">
                                {t('nav.contact')}
                            </Link>
                            <Link href="/rooms" color="text.secondary" underline="hover">
                                {t('nav.rooms')}
                            </Link>
                        </Box>
                    </Grid>

                    {/* Social */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            {t('footer.followUs')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton color="primary" aria-label="Facebook">
                                <Facebook />
                            </IconButton>
                            <IconButton color="primary" aria-label="Instagram">
                                <Instagram />
                            </IconButton>
                            <IconButton color="primary" aria-label="Twitter">
                                <Twitter />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Bottom */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {t('footer.copyright', { year: currentYear })}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Link href="/privacy" variant="body2" color="text.secondary" underline="hover">
                            {t('footer.privacy')}
                        </Link>
                        <Link href="/terms" variant="body2" color="text.secondary" underline="hover">
                            {t('footer.terms')}
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}