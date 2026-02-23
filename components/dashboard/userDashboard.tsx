'use client'

import { useUser } from '@/lib/hooks/useUser'

export default function UserDashboard() {
    const { user, loading } = useUser()

    // 🔍 Se sta caricando OPPURE non c'è ancora l'utente → mostra loader
    if (loading || !user) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 'calc(100vh - 70px)',
                fontSize: '18px',
                color: '#666'
            }}>
                Caricamento...
            </div>
        )
    }

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>
                    Benvenuto, {user.name}! 👋
                </h1>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Gestisci le tue prenotazioni e scopri le offerte
                </p>
            </div>

            {/* Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                {/* Card 1: Prenotazioni attive */}
                <div style={{
                    padding: '25px',
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📅</div>
                    <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>
                        Prenotazioni Attive
                    </h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
                        0
                    </p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        Nessuna prenotazione attiva
                    </p>
                </div>

                {/* Card 2: Prenotazioni passate */}
                <div style={{
                    padding: '25px',
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📋</div>
                    <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>
                        Storico
                    </h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
                        0
                    </p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        Prenotazioni completate
                    </p>
                </div>

                {/* Card 3: Prossima prenotazione */}
                <div style={{
                    padding: '25px',
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏰</div>
                    <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>
                        Prossima Prenotazione
                    </h3>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#666' }}>
                        Nessuna
                    </p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        -
                    </p>
                </div>
            </div>

            {/* Azioni rapide */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
                    Azioni Rapide
                </h2>
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    flexWrap: 'wrap'
                }}>
                    <button style={{
                        padding: '15px 30px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}>
                        🏨 Nuova Prenotazione
                    </button>
                    <button style={{
                        padding: '15px 30px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}>
                        🔍 Cerca Camere
                    </button>
                    <button style={{
                        padding: '15px 30px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}>
                        👤 Il Mio Profilo
                    </button>
                </div>
            </div>

            {/* Lista prenotazioni (vuota per ora) */}
            <div>
                <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
                    Le Mie Prenotazioni
                </h2>
                <div style={{
                    padding: '40px',
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #dee2e6',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '15px' }}>📭</div>
                    <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
                        Non hai ancora prenotazioni
                    </p>
                    <p style={{ fontSize: '14px', color: '#999' }}>
                        Clicca su Nuova Prenotazione per iniziare
                    </p>
                </div>
            </div>
        </div>
    )
}