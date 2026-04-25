/**
 * Pagina del dashboard per l'amministratore.
 * Mostra un riassunto delle statistiche principali dell'hotel:
 * - Prenotazioni totali, confermate, in attesa, annullate
 * - Conversazioni aperte/chiusi
 * - Numero di utenti registrati
 * - Disponibilità delle camere
 * 
 * @component
 * @example
 *   return <AdminDashboardPage />
 */

import AdminDashboard from '@/components/dashboard/AdminDashboard'

export default function AdminDashboardPage() {
  return <AdminDashboard />
}