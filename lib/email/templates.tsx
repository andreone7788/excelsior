import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

/**
 * TEMPLATE - Email utente: richiesta ricevuta
 */
interface BookingRequestUserTemplateProps {
  userName: string
  roomName: string
  checkIn: string
  checkOut: string
  bookingId: number
}

export const BookingRequestUserTemplate = ({
  userName,
  roomName,
  checkIn,
  checkOut,
  bookingId,
}: BookingRequestUserTemplateProps) => (
  <Html>
    <Head />
    <Preview>Richiesta di prenotazione ricevuta - Hotel Excelsior</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Richiesta di Prenotazione Ricevuta</Heading>

        <Text style={text}>Gentile {userName},</Text>

        <Text style={text}>
          Abbiamo ricevuto la tua richiesta di prenotazione presso l&apos;Hotel Excelsior.
          Il nostro team la prenderà in carico a breve.
        </Text>

        <Section style={infoBox}>
          <Text style={infoTitle}>Dettagli Prenotazione:</Text>
          <Text style={infoItem}><strong>Camera:</strong> {roomName}</Text>
          <Text style={infoItem}><strong>Check-in:</strong> {checkIn}</Text>
          <Text style={infoItem}><strong>Check-out:</strong> {checkOut}</Text>
          <Text style={infoItem}><strong>ID Prenotazione:</strong> #{bookingId}</Text>
        </Section>

        <Text style={text}>
          Ti invieremo un&apos;email di conferma non appena la prenotazione sarà approvata.
        </Text>

        <Text style={footer}>
          Cordiali saluti,<br />
          <strong>Team Hotel Excelsior</strong>
        </Text>
      </Container>
    </Body>
  </Html>
)

/**
 * TEMPLATE - Email admin: nuova richiesta
 */
interface BookingRequestAdminTemplateProps {
  userName: string
  userEmail: string
  roomName: string
  checkIn: string
  checkOut: string
  bookingId: number
}

export const BookingRequestAdminTemplate = ({
  userName,
  userEmail,
  roomName,
  checkIn,
  checkOut,
  bookingId,
}: BookingRequestAdminTemplateProps) => (
  <Html>
    <Head />
    <Preview>Nuova richiesta di prenotazione - #{bookingId.toString()}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔔 Nuova Richiesta Prenotazione</Heading>

        <Text style={text}>
          È stata ricevuta una nuova richiesta di prenotazione da gestire.
        </Text>

        <Section style={infoBox}>
          <Text style={infoTitle}>Dettagli Cliente:</Text>
          <Text style={infoItem}><strong>Nome:</strong> {userName}</Text>
          <Text style={infoItem}><strong>Email:</strong> {userEmail}</Text>
        </Section>

        <Section style={infoBox}>
          <Text style={infoTitle}>Dettagli Prenotazione:</Text>
          <Text style={infoItem}><strong>Camera:</strong> {roomName}</Text>
          <Text style={infoItem}><strong>Check-in:</strong> {checkIn}</Text>
          <Text style={infoItem}><strong>Check-out:</strong> {checkOut}</Text>
          <Text style={infoItem}><strong>ID:</strong> #{bookingId}</Text>
        </Section>

        <Section style={{ textAlign: 'center', marginTop: '30px' }}>
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/admin/bookings/${bookingId}`}
          >
            Gestisci Prenotazione
          </Button>
        </Section>

        <Text style={footer}>
          Accedi al pannello admin per approvare o rifiutare la richiesta.
        </Text>
      </Container>
    </Body>
  </Html>
)

/**
 * TEMPLATE - Email utente: prenotazione confermata
 */
interface BookingConfirmedTemplateProps {
  userName: string
  roomName: string
  checkIn: string
  checkOut: string
  bookingId: number
  totalPrice: number
}

export const BookingConfirmedTemplate = ({
  userName,
  roomName,
  checkIn,
  checkOut,
  bookingId,
  totalPrice,
}: BookingConfirmedTemplateProps) => (
  <Html>
    <Head />
    <Preview>Prenotazione Confermata - Hotel Excelsior</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>✅ Prenotazione Confermata!</Heading>

        <Text style={text}>Gentile {userName},</Text>

        <Text style={text}>
          Siamo lieti di confermare la tua prenotazione presso l&apos;Hotel Excelsior.
        </Text>

        <Section style={infoBox}>
          <Text style={infoTitle}>Riepilogo Prenotazione:</Text>
          <Text style={infoItem}><strong>Camera:</strong> {roomName}</Text>
          <Text style={infoItem}><strong>Check-in:</strong> {checkIn}</Text>
          <Text style={infoItem}><strong>Check-out:</strong> {checkOut}</Text>
          <Text style={infoItem}><strong>Totale:</strong> €{totalPrice.toFixed(2)}</Text>
          <Text style={infoItem}><strong>Codice Prenotazione:</strong> #{bookingId}</Text>
        </Section>

        <Text style={text}>
          Ti aspettiamo il giorno del check-in. Per qualsiasi informazione, non esitare a contattarci.
        </Text>

        <Section style={{ textAlign: 'center', marginTop: '30px' }}>
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/bookings/${bookingId}`}
          >
            Visualizza Prenotazione
          </Button>
        </Section>

        <Text style={footer}>
          A presto,<br />
          <strong>Team Hotel Excelsior</strong>
        </Text>
      </Container>
    </Body>
  </Html>
)

/**
 * TEMPLATE - Email utente: prenotazione rifiutata
 */
interface BookingRejectedTemplateProps {
  userName: string
  roomName: string
  checkIn: string
  checkOut: string
  bookingId: number
  reason?: string
}

export const BookingRejectedTemplate = ({
  userName,
  roomName,
  checkIn,
  checkOut,
  bookingId,
  reason,
}: BookingRejectedTemplateProps) => (
  <Html>
    <Head />
    <Preview>Prenotazione Non Approvata - Hotel Excelsior</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Prenotazione Non Approvata</Heading>

        <Text style={text}>Gentile {userName},</Text>

        <Text style={text}>
          Ci dispiace informarti che la tua richiesta di prenotazione non può essere accettata.
        </Text>

        <Section style={infoBox}>
          <Text style={infoTitle}>Dettagli Richiesta:</Text>
          <Text style={infoItem}><strong>Camera:</strong> {roomName}</Text>
          <Text style={infoItem}><strong>Check-in:</strong> {checkIn}</Text>
          <Text style={infoItem}><strong>Check-out:</strong> {checkOut}</Text>
          <Text style={infoItem}><strong>ID Richiesta:</strong> #{bookingId}</Text>
        </Section>

        {reason && (
          <Section style={infoBox}>
            <Text style={infoTitle}>Motivo:</Text>
            <Text style={infoItem}>{reason}</Text>
          </Section>
        )}

        <Text style={text}>
          Ti invitiamo a contattarci per trovare alternative disponibili o modificare le date.
        </Text>

        <Section style={{ textAlign: 'center', marginTop: '30px' }}>
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/rooms`}
          >
            Cerca Altre Camere
          </Button>
        </Section>

        <Text style={footer}>
          Siamo a disposizione,<br />
          <strong>Team Hotel Excelsior</strong>
        </Text>
      </Container>
    </Body>
  </Html>
)

/**
 * TEMPLATE - Email utente: Richiesta modifica prenotazione
 */
interface BookingModificationRequestTemplateProps {
  userName: string
  roomName: string
  originalDates: string
  newDates: string
  bookingId: number
  priceDifference: number
  reason?: string
}

export const BookingModificationRequestTemplate = ({
  userName,
  roomName,
  originalDates,
  newDates,
  bookingId,
  priceDifference,
  reason,
}: BookingModificationRequestTemplateProps) => (
  <Html>
    <Head />
    <Preview>Richiesta Modifica Prenotazione - Hotel Excelsior</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Richiesta Modifica Prenotazione</Heading>

        <Text style={text}>Gentile {userName},</Text>

        <Text style={text}>
          Abbiamo ricevuto una richiesta di modifica per la tua prenotazione.
        </Text>

        <Section style={infoBox}>
          <Text style={infoTitle}>Dettagli Prenotazione:</Text>
          <Text style={infoItem}><strong>Camera:</strong> {roomName}</Text>
          <Text style={infoItem}><strong>Date Originali:</strong> {originalDates}</Text>
          <Text style={infoItem}><strong>Nuove Date:</strong> {newDates}</Text>
          <Text style={infoItem}><strong>ID Prenotazione:</strong> #{bookingId}</Text>
          <Text style={infoItem}><strong>Differenza di Prezzo:</strong> €{priceDifference.toFixed(2)}</Text>
        </Section>

        {reason && (
          <Section style={infoBox}>
            <Text style={infoTitle}>Motivo:</Text>
            <Text style={infoItem}>{reason}</Text>
          </Section>
        )}

        <Text style={text}>
          Ti invitiamo a contattarci per confermare o modificare ulteriormente la tua prenotazione.
        </Text>

        <Section style={{ textAlign: 'center', marginTop: '30px' }}>
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/bookings/${bookingId}`}
          >
            Visualizza Prenotazione
          </Button>
        </Section>

        <Text style={footer}>
          Siamo a disposizione,<br />
          <strong>Team Hotel Excelsior</strong>
        </Text>
      </Container>
    </Body>
  </Html>
)

/**
 * TEMPLATE - Email Admin: Richiesta modifica prenotazione
 */
interface BookingModificationRequestAdminTemplateProps {
  userName: string
  userEmail: string
  roomName: string
  checkIn: string
  checkOut: string
  bookingId: number
}

export const BookingModificationRequestAdminTemplate = ({
   userName,
  userEmail,
  roomName,
  checkIn,
  checkOut,
  bookingId,
}: BookingModificationRequestAdminTemplateProps) => (
  <Html>
    <Head />
    <Preview>Richiesta Modifica Prenotazione - #{bookingId.toString()}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔔 Richiesta Modifica Prenotazione</Heading>
        <Text style={text}>Gentile {userName},</Text>
        <Text style={text}>
          Abbiamo ricevuto una richiesta di modifica per la prenotazione #{bookingId}.
        </Text>
        <Section style={infoBox}>
          <Text style={infoTitle}>Dettagli Prenotazione:</Text>
          <Text style={infoItem}><strong>Camera:</strong> {roomName}</Text>
          <Text style={infoItem}><strong>Email Utente:</strong> {userEmail}</Text>
          <Text style={infoItem}><strong>Date Originali:</strong> {checkIn} - {checkOut}</Text>
          <Text style={infoItem}><strong>ID Prenotazione:</strong> #{bookingId}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

/**
 * TEMPLATE - Email utente: Modifica prenotazione approvata
 */
interface BookingModificationApprovedTemplateProps {
  userName: string
  roomName: string
  newDates: string
  bookingId: number
  priceDifference: number
}

export const BookingModificationApprovedTemplate = ({
  userName,
  roomName,
  newDates,
  bookingId,
  priceDifference,
}: BookingModificationApprovedTemplateProps) => (
  <Html>
    <Head />
    <Preview>Modifica Prenotazione Approvata - Hotel Excelsior</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Modifica Prenotazione Approvata</Heading>
        <Text style={text}>Gentile {userName},</Text>
        <Text style={text}>
          La tua richiesta di modifica per la prenotazione #{bookingId} è stata approvata.
        </Text>
        <Section style={infoBox}>
          <Text style={infoTitle}>Nuovi Dettagli Prenotazione:</Text>
          <Text style={infoItem}><strong>Camera:</strong> {roomName}</Text>
          <Text style={infoItem}><strong>Nuove Date:</strong> {newDates}</Text>
          <Text style={infoItem}><strong>Differenza di Prezzo:</strong> €{priceDifference.toFixed(2)}</Text>
        </Section>
        <Text style={text}>
          Ti aspettiamo nelle nuove date. Per qualsiasi informazione, non esitare a contattarci.
        </Text>
        <Section style={{ textAlign: 'center', marginTop: '30px' }}>
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/bookings/${bookingId}`}
          >
            Visualizza Prenotazione
          </Button>
        </Section>
        <Text style={footer}>
          A presto,<br />
          <strong>Team Hotel Excelsior</strong>
        </Text>
      </Container>
    </Body>
  </Html>
)

/**
 * TEMPLATE - Email utente: Modifica prenotazione rifiutata
 */
interface BookingModificationRejectedTemplateProps {
  userName: string
  roomName: string
  bookingId: number
  reason?: string
}

export const BookingModificationRejectedTemplate = ({
  userName,
  roomName,
  bookingId,
  reason,
}: BookingModificationRejectedTemplateProps) => (
  <Html>
    <Head />
    <Preview>Modifica Prenotazione Non Approvata - Hotel Excelsior</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Modifica Prenotazione Non Approvata</Heading>
        <Text style={text}>Gentile {userName},</Text>
        <Text style={text}>
          Ci dispiace informarti che la tua richiesta di modifica per la prenotazione #{bookingId} non può essere accettata.
        </Text>
        <Section style={infoBox}>
          <Text style={infoTitle}>Dettagli Prenotazione:</Text>
          <Text style={infoItem}><strong>Camera:</strong> {roomName}</Text>
          <Text style={infoItem}><strong>ID Prenotazione:</strong> #{bookingId}</Text>
        </Section>
        {reason && (
          <Section style={infoBox}>
            <Text style={infoTitle}>Motivo:</Text>
            <Text style={infoItem}>{reason}</Text>
          </Section>
        )}
        <Text style={text}>
          Ti invitiamo a contattarci per discutere ulteriori opzioni o modificare la tua prenotazione.
        </Text>
        <Section style={{ textAlign: 'center', marginTop: '30px' }}>
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/bookings/${bookingId}`}
          >
            Visualizza Prenotazione
          </Button>
        </Section>
        <Text style={footer}>
          Siamo a disposizione,<br />
          <strong>Team Hotel Excelsior</strong>
        </Text>
      </Container>
    </Body>
  </Html>
)

/**
 * ========================================
 * STILI
 * ========================================
 */
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 30px',
  textAlign: 'center' as const,
}

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const infoBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  padding: '20px',
  margin: '20px 0',
}

const infoTitle = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 10px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const infoItem = {
  color: '#484848',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '30px',
  textAlign: 'center' as const,
}