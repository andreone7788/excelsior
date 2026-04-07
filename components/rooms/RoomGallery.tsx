'use client'

import { useState } from 'react'
import { Box, IconButton, Modal, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight, Close } from '@mui/icons-material'
import { RoomImage } from '@/types'

interface RoomGalleryProps {
    images: RoomImage[]
    roomName: string
}

export default function RoomGallery({ images, roomName }: RoomGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [modalOpen, setModalOpen] = useState(false)

    if (!images || images.length === 0) {
        return (
            <Box
                component="img"
                src="/placeholder-room.jpg"
                alt={roomName}
                sx={{
                    width: '100%',
                    height: 400,
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: 3
                }}
            />
        )
    }

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    const currentImage = images[currentIndex]

    return (
        <>
            {/* Immagine principale con controlli */}
            <Box sx={{ position: 'relative', mb: 2 }}>
                <Box
                    component="img"
                    src={currentImage.url}
                    alt={currentImage.caption || `${roomName} - Immagine ${currentIndex + 1}`}
                    onClick={() => setModalOpen(true)}
                    sx={{
                        width: '100%',
                        height: 400,
                        objectFit: 'cover',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'transform 0.3s',
                        '&:hover': {
                            transform: 'scale(1.02)'
                        }
                    }}
                />

                {/* Pulsanti navigazione (solo se più di 1 immagine) */}
                {images.length > 1 && (
                    <>
                        <IconButton
                            onClick={handlePrev}
                            sx={{
                                position: 'absolute',
                                left: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                '&:hover': { bgcolor: 'white' }
                            }}
                        >
                            <ChevronLeft />
                        </IconButton>
                        <IconButton
                            onClick={handleNext}
                            sx={{
                                position: 'absolute',
                                right: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                '&:hover': { bgcolor: 'white' }
                            }}
                        >
                            <ChevronRight />
                        </IconButton>

                        {/* Indicatore posizione */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                right: 16,
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                px: 2,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: 14
                            }}
                        >
                            {currentIndex + 1} / {images.length}
                        </Box>
                    </>
                )}
            </Box>

            {/* Thumbnail gallery (solo se più di 1 immagine) */}
            {images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto' }}>
                    {images.map((image, index) => (
                        <Box
                            key={image.id}
                            component="img"
                            src={image.url}
                            alt={image.caption || `${roomName} - Thumbnail ${index + 1}`}
                            onClick={() => setCurrentIndex(index)}
                            sx={{
                                width: 100,
                                height: 70,
                                objectFit: 'cover',
                                borderRadius: 1,
                                cursor: 'pointer',
                                border: currentIndex === index ? '3px solid' : '2px solid transparent',
                                borderColor: currentIndex === index ? 'primary.main' : 'transparent',
                                opacity: currentIndex === index ? 1 : 0.6,
                                transition: 'all 0.3s',
                                '&:hover': {
                                    opacity: 1,
                                    transform: 'scale(1.05)'
                                }
                            }}
                        />
                    ))}
                </Box>
            )}

            {/* Modal fullscreen */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                    <IconButton
                        onClick={() => setModalOpen(false)}
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            '&:hover': { bgcolor: 'white' }
                        }}
                    >
                        <Close />
                    </IconButton>
                    <Box
                        component="img"
                        src={currentImage.url}
                        alt={currentImage.caption || roomName}
                        sx={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            objectFit: 'contain'
                        }}
                    />
                    {currentImage.caption && (
                        <Typography
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                p: 2,
                                textAlign: 'center'
                            }}
                        >
                            {currentImage.caption}
                        </Typography>
                    )}
                </Box>
            </Modal>
        </>
    )
}