'use client'

import { useUser } from '@/lib/hooks/useUser'

export default function AdminDashboard() {
    const { user, loading } = useUser()

    // 🔧 AGGIUNGI !user
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
        <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>
                    👑 Pannello Amministratore
                </h1>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Benvenuto, {user.name}! Gestisci il tuo hotel da qui
                </p>
            </div>

            {/* Statistiche */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                {/* Stat 1 */}
                <div style={{
                    padding: '25px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>👥</div>
                    <h3 style={{ fontSize: '16px', marginBottom: '5px', opacity: 0.9 }}>
                        Utenti Totali
                    </h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold' }}>
                        0
                    </p>
                </div>

                {/* Stat 2 */}
                <div style={{
                    padding: '25px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏨</div>
                    <h3 style={{ fontSize: '16px', marginBottom: '5px', opacity: 0.9 }}>
                        Camere Totali
                    </h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold' }}>
                        0
                    </p>
                </div>

                {/* Stat 3 */}
                <div style={{
                    padding: '25px',
                    backgroundColor: '#ffc107',
                    color: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📅</div>
                    <h3 style={{ fontSize: '16px', marginBottom: '5px', opacity: 0.9 }}>
                        Prenotazioni Attive
                    </h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold' }}>
                        0
                    </p>
                </div>

                {/* Stat 4 */}
                <div style={{
                    padding: '25px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>💰</div>
                    <h3 style={{ fontSize: '16px', marginBottom: '5px', opacity: 0.9 }}>
                        Fatturato Mese
                    </h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold' }}>
                        €0
                    </p>
                </div>
            </div>

            {/* Gestione rapida */}
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
                    Gestione Rapida
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px'
                }}>
                    {/* Card Gestione Utenti */}
                    <div style={{
                        padding: '25px',
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>👥</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>
                            Gestione Utenti
                        </h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            Visualizza, modifica ed elimina utenti registrati
                        </p>
                    </div>

                    {/* Card Gestione Camere */}
                    <div style={{
                        padding: '25px',
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏨</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>
                            Gestione Camere
                        </h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            Aggiungi, modifica e gestisci le camere disponibili
                        </p>
                    </div>

                    {/* Card Prenotazioni */}
                    <div style={{
                        padding: '25px',
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📅</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>
                            Tutte le Prenotazioni
                        </h3>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            Visualizza e gestisci tutte le prenotazioni
                        </p>
                    </div>
                </div>
            </div>

            {/* Ultime attività (placeholder) */}
            <div>
                <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
                    Ultime Attività
                </h2>
                <div style={{
                    padding: '30px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#666' }}>
                        📊 Nessuna attività recente
                    </p>
                </div>
            </div>
        </div>
    )
}