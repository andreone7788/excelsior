# 📋 Excelsior Hotel - Note Tecniche di Sviluppo

Documentazione tecnica dei problemi risolti, decisioni architetturali e best practices adottate durante lo sviluppo del progetto.

**Progetto:** Sistema di Gestione Hotel con AI  
**Stack:** Next.js 15, TypeScript, Prisma, Material-UI, PostgreSQL  
**Periodo:** Marzo-Aprile 2026

---

## 🐛 Problemi Risolti

### #1 - Loop Infinito in Hook React (useUnreadCount)

**📅 Data:** 9 Aprile 2026  
**📂 File:** `lib/hooks/useUnreadCount.tsx`  
**🔴 Severità:** Alta - Performance Critica  
**⏱️ Tempo risoluzione:** ~30 minuti

#### 🔍 Problema

Il sistema di notifiche real-time causava chiamate API infinite ogni millisecondo, bloccando completamente l'applicazione:

```bash
GET /api/user/unread-count 200 in 9ms
GET /api/user/unread-count 200 in 9ms
GET /api/user/unread-count 200 in 9ms
# ... continuo senza fine

Questo causava:
Congelamento dell’interfaccia utente
Sovraccarico del backend
Comportamento non deterministico nei componenti che usavano il conteggio notifiche
🧪 Causa
pollInterval impostato a valori molto bassi (es. 100) in alcuni test.
useEffect con dipendenze non corrette che ri-triggeravano refetch.
Mancanza di guard contro richieste concorrenti.
🛠 Soluzione
Aggiunta di un useRef per bloccare richieste multiple contemporanee:

// CODICE AGGIORNATO
const isFetchingRef = useRef(false);

const fetchUnreadCount = useCallback(async () => {
  if (!isAuthenticated || !user?.role || isFetchingRef.current) return;

  try {
    isFetchingRef.current = true;
    setLoading(true);
    // ...
  } finally {
    isFetchingRef.current = false;
    setLoading(false);
  }
}, [isAuthenticated, user?.role]);


### #2 Errore Zod: Unknown field 'role' in Message

Data: 9 Aprile 2026
File: app/api/chat/[id]/route.ts, schema.prisma
Severità: 🟡 Media — Blocco della pagina dettaglio conversazione
🔍 Problema
Errore runtime in produzione:

Unknown field `role` for select statement on model `Message`.
Available options are listed in green.

🧪 Causa
Nella query Prisma era presente:

select: { id: true, content: true, role: true, createdAt: true }

Ma nel modello Message di Prisma non esisteva il campo role, perché non era stato definito nello schema.

🛠 Soluzione
Due opzioni possibili:
1 - ✅ Rimuovere role: true dal select (scelta adottata, poiché il campo non era necessario)
2 - Aggiungere role String? allo schema Prisma (se futuramente necessario)

Modifica applicata:

// Prima
select: { id: true, content: true, role: true, createdAt: true }

// Dopo
select: { id: true, content: true, createdAt: true }

✅ Risultato:
Pagina conversazione funzionante
Nessun errore di validazione Prisma

🏗️ Decisioni Architetturali
#3 — Struttura modulare delle cartelle
Data: 9 Aprile 2026
Percorso: src/components/, src/lib/hooks/, src/types/
🎯 Motivazione
Evitare il caos di file sparsi e facilitare l’espansione del progetto (es. aggiunta di nuove feature come “Promozioni”, “Analytics”, ecc.).

src/
├── components/
│   ├── chat/
│   │   ├── ChatWidget.tsx
│   │   └── usePublicChat.ts
│   ├── language/
│   │   └── LanguageSwitcher.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── rooms/
│   │   ├── RoomGallery.tsx
│   │   └── RoomCard.tsx
│   └── ...
├── lib/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useRooms.ts
│   │   └── useConversations.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   └── ...
└── types/
    └── index.ts

    ✅ Benefici:
- Codice più leggibile e manutenibile
- Facilità di riuso (es. chat/ può essere estratto come pacchetto)
- Migliore esperienza per chi si unisce al progetto

#4 — YAGNI applicato con consapevolezza
Data: 9 Aprile 2026
File: app/api/user/unread-count/route.ts, app/api/admin/unread-count/route.ts
🎯 Principio
"You Aren’t Gonna Need It" — non implementare funzionalità o complessità fino a quando non sono effettivamente necessarie.
🧠 Esempi
Nessuno schema Zod nei route API che non ricevono input dall’utente (es. GET /unread-count)
Nessun useMemo o useCallback dove non serve (evita overhead inutili)
Componenti semplici senza state extra se non richiesti
✅ Risultato:
Codice più snello e performante
Minor tempo di compilazione
Maggiore leggibilità

### #5 — Badge notifiche non si aggiornava  
**Data**: 10 Aprile 2026  
**File**: `app/api/chat/[id]/route.ts`, `app/user/conversations/[id]/page.tsx`  
**Severità**: 🟡 Media — UX compromessa

#### 🔍 Problema
Il badge di notifica (es. `Badge badgeContent={unreadCount} color="error"`) non si aggiornava immediatamente quando l’utente apriva una conversazione.  
Anche se i messaggi venivano visualizzati, il conteggio rimaneva invariato, creando confusione.

#### 🧪 Causa
- I messaggi ricevuti non venivano automaticamente contrassegnati come letti all’apertura della conversazione.
- Il conteggio `unreadCount` veniva aggiornato solo tramite polling (es. ogni 30 secondi), quindi non in tempo reale.

#### 🛠 Soluzioni Implementate

1. **Backend**: Aggiornamento automatico messaggi come letti all’apertura conversazione
```ts
// In app/api/chat/[id]/route.ts
await prisma.message.updateMany({
    where: {
        conversationId: conversationId,
        senderId: { not: userId },  // Solo messaggi ricevuti
        isRead: false               // Solo quelli non ancora letti
    },
    data: {
        isRead: true
    }
})
}

--- LATO FRONTEND

// In app/user/conversations/[id]/page.tsx
useEffect(() => {
    if (conversation && !loading) {
        // Timeout di attesa API che marca i messaggi come letti
        setTimeout(() => {
            refetchUnreadCount()
        }, 500)
    }
}, [conversation, loading, refetchUnreadCount])

### #6 — Approfondimento: "You Might Not Need an Effect"  
**Data**: 10 Aprile 2026  
**File**: `app/user/profile/page.tsx`  
**Severità**: 🔧 Educativa — Ottimizzazione architetturale

#### 🧠 Concetto Chiave
Durante lo sviluppo della pagina profilo (`ProfilePage`), è emerso un errore comune:

Calling setState synchronously within an effect can trigger cascading renders

Questo errore è collegato a un principio fondamentale di React illustrato nella documentazione ufficiale:  
["You Might Not Need an Effect"](https://react.dev/learn/you-might-not-need-an-effect)

#### 🔍 Problema Iniziale
Nella prima versione del componente, lo stato `profileForm` veniva inizializzato in modo simile a questo:
```ts
const [profileForm, setProfileForm] = useState<UpdateProfileInput>({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    phone: user?.phone || '',
})

In alcuni casi, quando user arrivava dopo il primo render (es. durante caricamento asincrono), si tentava di aggiornare lo stato direttamente nel corpo del componente, causando un loop di render.
🧪 Soluzione Errata (da evitare)

// ❌ MAI fare così
if (user && !profileForm.name && ...) {
  setProfileForm({ ... })
}

✅ Soluzione Corretta Adottata
Abbiamo inizializzato lo stato direttamente con i valori disponibili da user, evitando useEffect per trasformare dati derivati:

const [profileForm, setProfileForm] = useState<UpdateProfileInput>({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    phone: user?.phone || ''
})

Inoltre, abbiamo aggiunto un key al wrapper principale per garantire il reset completo dello stato se l’utente cambia:

<Box key={user?.id || 'no-user'}>

🧠 Principi Applicati
"You don’t need an Effect to transform data for rendering"
→ Se puoi calcolare qualcosa da props o state, fallo direttamente nel componente.
Evitare "cascading renders"
→ Non aggiornare lo stato immediatamente in un useEffect se non necessario.
Usare key per resettare lo stato
→ Quando un componente deve "ricominciare da zero", usa key={qualcosaDiUnico}.

✅ Risultato
Nessun errore di React
Codice più chiaro e manutenibile
Nessun rischio di loop infiniti
Migliore performance grazie all’eliminazione di render inutili

📚 Approfondimento
La lettura di "You Might Not Need an Effect" è stata fondamentale per risolvere alcuni errori di architettura e comprendere quando NON usare useEffect:
Non usarlo per trasformare dati
Non usarlo per gestire eventi utente
Usarlo solo per sincronizzare con sistemi esterni (es. API, DOM, WebSocket)
Conclusione: Capire quando non usare useEffect è cruciale per scrivere codice React efficiente e privo di bug.

---

### #7 — Pattern UI Diversi: Dialog (Admin) vs Routing (User)
**📅 Data:** 14 Aprile 2026  
**📂 Files:** 
- `app/admin/conversations/page.tsx` (Dialog pattern)
- `app/user/conversations/[id]/page.tsx` (Routing pattern, da implementare)

**🎯 Contesto**

Durante lo sviluppo delle interfacce di gestione conversazioni, è emersa la domanda: 
**"Dobbiamo usare lo stesso pattern UI per admin e user?"**

#### 🧠 Analisi dei Contesti

**Admin (`/admin/conversations`):**
- Gestisce **MOLTE** conversazioni (di tutti gli utenti del sistema)
- Necessità di **switching rapido** tra conversazioni diverse
- Deve mantenere **filtri e stato** della lista durante la navigazione
- Visualizzazione a **tabella** con statistiche aggregate

**User (`/user/conversations`):**
- Gestisce solo le **PROPRIE** conversazioni (tipicamente 1-5 in un contesto hotel)
- **Non** serve switching rapido
- Focus su **una conversazione alla volta**
- Esperienza più **lineare e semplice**

#### 🎨 Decisione Architetturale

**✅ SCELTA:** Pattern diversi per contesti diversi

| Aspetto | Admin | User |
|---------|-------|------|
| **Pattern** | Dialog (MUI) | Routing classico |
| **URL** | `/admin/conversations` (statico) | `/user/conversations/[id]` (dinamico) |
| **Navigazione** | Click → Dialog overlay | Click → Nuova pagina |
| **Back button** | Chiudi Dialog | Browser back naturale |
| **Deep linking** | ❌ Non supportato | ✅ URL condivisibili |
| **Complessità** | ✅ Giustificata per bulk operations | ❌ Overkill per poche conversazioni |

#### 📊 Benefici della Scelta

**Per Admin (Dialog):**
- ✅ Preserva filtri e posizione scroll nella tabella
- ✅ Transizioni fluide senza page reload
- ✅ UX ottimale per gestione volumi alti
- ✅ Stato conversazione non interferisce con lista

**Per User (Routing):**
- ✅ URL significativi e condivisibili
- ✅ Browser back/forward funziona naturalmente
- ✅ Codice più semplice e manutenibile
- ✅ Meglio per SEO (se necessario)
- ✅ Esperienza più familiare per utenti finali

#### 💡 Principio Generale

**"Non forzare pattern per consistenza superficiale quando i contesti d'uso sono sostanzialmente diversi"**

La consistenza UI non significa usare sempre gli stessi componenti, ma:
- **Consistenza concettuale** → Stesso comportamento per azioni simili
- **Consistenza visiva** → Stesso design system (colori, tipografia, spacing)
- **Pattern contestuali** → Soluzioni ottimali per ogni caso d'uso

#### 🔍 Alternative Valutate

1. **❌ Dialog anche per user**
   - Pro: Consistenza con admin
   - Contro: Overkill, perde deep linking, back button innaturale

2. **❌ Routing anche per admin**
   - Pro: Consistenza con user
   - Contro: Perde filtri, scroll position, switching lento

3. **✅ Pattern diversi basati sul contesto** ← Scelta adottata

#### 📚 Riferimenti

- [Material-UI Dialog Best Practices](https://mui.com/material-ui/react-dialog/)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- Principio YAGNI: Non aggiungere complessità dove non serve

---

### #8 — Implementazione Modifica Prenotazioni User
**📅 Data:** 14 Aprile 2026  
**📂 Files:**
- `app/user/bookings/page.tsx` (UI modifica prenotazione)
- `app/api/bookings/[id]/route.ts` (endpoint PUT già esistente)
- `lib/validations/booking.ts` (schema già esistente)

**🎯 Situazione**

L'endpoint backend per la modifica prenotazioni (`PUT /api/bookings/:id`) era già completamente implementato con:
- ✅ Validazione Zod (`requestBookingModificationSchema`)
- ✅ Verifica disponibilità nuove date/camera
- ✅ Calcolo differenza prezzo (`priceDifference`)
- ✅ Cambio status → `PENDING_MODIFICATION`
- ✅ Invio email a utente e admin
- ✅ Gestione stato `originalStartDate`, `originalEndDate`, `originalRoomId`

**❌ Mancava:** L'interfaccia utente per permettere agli utenti di richiedere modifiche.

#### 🛠 Implementazione Frontend

**Aggiunte a `app/user/bookings/page.tsx`:**

1. **Nuovo stato modifica:**
```tsx
const [modifyDialogOpen, setModifyDialogOpen] = useState(false)
const [modifying, setModifying] = useState(false)
const [modifyError, setModifyError] = useState<string | null>(null)
const [modifyForm, setModifyForm] = useState({
    newStartDate: '',
    newEndDate: '',
    reason: ''
})
```

2. **Handler apertura dialog modifica:**
```tsx
const handleModifyClick = (booking: BookingWithRelations) => {
    setSelectedBooking(booking)
    setModifyError(null)
    
    // Pre-compila date esistenti
    const startDate = new Date(booking.startDate).toISOString().split('T')[0]
    const endDate = new Date(booking.endDate).toISOString().split('T')[0]
    
    setModifyForm({
        newStartDate: startDate,
        newEndDate: endDate,
        reason: ''
    })
    setModifyDialogOpen(true)
}
```

3. **Handler invio richiesta modifica:**
```tsx
const handleModifyConfirm = async () => {
    // Validazione motivazione (min 10 caratteri)
    if (!modifyForm.reason || modifyForm.reason.trim().length < 10) {
        setModifyError('Inserisci una motivazione di almeno 10 caratteri')
        return
    }

    const payload = { reason: modifyForm.reason }
    
    // Includi solo date modificate (confronto con originali)
    const originalStart = new Date(selectedBooking.startDate).toISOString().split('T')[0]
    const originalEnd = new Date(selectedBooking.endDate).toISOString().split('T')[0]
    
    if (modifyForm.newStartDate !== originalStart) {
        payload.newStartDate = modifyForm.newStartDate
    }
    if (modifyForm.newEndDate !== originalEnd) {
        payload.newEndDate = modifyForm.newEndDate
    }

    await apiClient.put(`/bookings/${selectedBooking.id}`, JSON.stringify(payload))
    await refetch()
    // Mostra messaggio successo
}
```

4. **Tab "In Modifica":**
```tsx
<Tabs value={statusFilter} onChange={...}>
    <Tab label="Tutte" value="ALL" />
    <Tab label="In Attesa" value="PENDING" />
    <Tab label="Confermate" value="CONFIRMED" />
    <Tab label="In Modifica" value="PENDING_MODIFICATION" /> {/* ← NUOVO */}
    <Tab label="Completate" value="REPLACED" />
    <Tab label="Cancellate" value="CANCELLED" />
</Tabs>
```

5. **Bottone Modifica nelle Card:**
```tsx
const canModify = booking.status === 'CONFIRMED'

{canModify && (
    <Button
        variant="outlined"
        color="primary"
        size="small"
        startIcon={<Edit />}
        onClick={() => handleModifyClick(booking)}
        fullWidth
    >
        Modifica
    </Button>
)}
```

6. **Dialog Modifica Prenotazione:**
```tsx
<Dialog open={modifyDialogOpen} onClose={...} maxWidth="sm" fullWidth>
    <DialogTitle>Richiedi Modifica Prenotazione</DialogTitle>
    <DialogContent>
        <DialogContentText>
            Modifica le date della tua prenotazione.
            La richiesta sarà valutata dall'amministrazione.
        </DialogContentText>

        {modifyError && <Alert severity="error">{modifyError}</Alert>}

        <Stack spacing={2}>
            <TextField
                label="Nuova Data Check-in"
                type="date"
                value={modifyForm.newStartDate}
                onChange={(e) => setModifyForm(prev => ({ 
                    ...prev, 
                    newStartDate: e.target.value 
                }))}
                InputLabelProps={{ shrink: true }}
                helperText="Modifica la data di arrivo"
            />
            <TextField
                label="Nuova Data Check-out"
                type="date"
                value={modifyForm.newEndDate}
                onChange={(e) => setModifyForm(prev => ({ 
                    ...prev, 
                    newEndDate: e.target.value 
                }))}
                InputLabelProps={{ shrink: true }}
                helperText="Modifica la data di partenza"
            />
            <TextField
                label="Motivazione *"
                multiline
                rows={4}
                value={modifyForm.reason}
                onChange={(e) => setModifyForm(prev => ({ 
                    ...prev, 
                    reason: e.target.value 
                }))}
                required
                helperText="Spiega brevemente il motivo (min. 10 caratteri)"
                error={!!modifyError && modifyForm.reason.length < 10}
            />
        </Stack>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setModifyDialogOpen(false)}>
            Annulla
        </Button>
        <Button
            onClick={handleModifyConfirm}
            variant="contained"
            disabled={modifying || modifyForm.reason.trim().length < 10}
        >
            {modifying ? 'Invio...' : 'Invia Richiesta'}
        </Button>
    </DialogActions>
</Dialog>
```

#### 🔄 Flusso Completo

1. **User** → Apre `/user/bookings`
2. **User** → Vede prenotazione `CONFIRMED`, clicca "Modifica"
3. **Dialog** → Si apre con date pre-compilate
4. **User** → Modifica date e inserisce motivazione (min 10 caratteri)
5. **Frontend** → Chiama `PUT /api/bookings/:id` con payload `{ newStartDate?, newEndDate?, reason }`
6. **Backend** → Verifica disponibilità, calcola `priceDifference`, aggiorna status → `PENDING_MODIFICATION`
7. **Backend** → Invia email a user e admin
8. **Frontend** → Ricarica lista, mostra prenotazione in tab "In Modifica"
9. **Admin** → Riceve richiesta in `/admin/bookings`, approva o rifiuta

#### ✅ Benefici

- ✅ **Funzionalità completa**: User può modificare date senza contattare admin manualmente
- ✅ **UX trasparente**: Dialog modale chiaro con validazione in tempo reale
- ✅ **Tracciabilità**: Stato `PENDING_MODIFICATION` visibile in tab dedicato
- ✅ **Notifiche**: Email automatiche a user e admin
- ✅ **Validazione robusta**: Frontend + Backend validano motivazione e disponibilità
- ✅ **Calcolo prezzo**: Backend calcola automaticamente differenza di costo

#### 🧪 Test Consigliati

1. ✅ Modifica solo data check-in
2. ✅ Modifica solo data check-out
3. ✅ Modifica entrambe le date
4. ✅ Tentativo modifica senza motivazione (deve bloccare)
5. ✅ Tentativo modifica prenotazione già in modifica (backend rifiuta)
6. ✅ Tentativo modifica con date non disponibili (backend rifiuta con 409)
7. ✅ Verifica email inviate correttamente

#### 💰 Calcolo Differenza Prezzo

Il backend calcola automaticamente:
```ts
// Se modifichi solo le date
const oldNights = (endDate - startDate) / (1000 * 60 * 60 * 24)
const newNights = (newEndDate - newStartDate) / (1000 * 60 * 60 * 24)
const pricePerNight = totalPrice / oldNights
const priceDifference = (pricePerNight * newNights) - totalPrice

// Se modifichi anche la camera (non ancora implementato in UI)
priceDifference += (newRoom.price - oldRoom.price) * nights
```

#### 📝 Note Implementative

- **Solo date modificabili**: Per ora l'UI permette solo modifica date. L'endpoint supporta anche cambio camera (`newRoomId`), ma non è esposto nel form (decisione UX: evitare complessità)
- **Validazione motivazione**: Min 10 caratteri richiesti (conforme a schema backend)
- **Pre-compilazione form**: Date esistenti caricate automaticamente per comodità
- **Invio solo campi modificati**: Il frontend confronta date originali e invia solo quelle cambiate
- **Stato prenotazione**: Solo `CONFIRMED` può essere modificata (logica backend)

---

### #9 — Gestione Utenti Admin: Bug state management e validazione Zod
**📅 Data:** 18 Aprile 2026  
**📂 Files:**
- `app/admin/users/page.tsx` (Interfaccia gestione utenti)
- `app/api/admin/users/[id]/route.ts` (Endpoint PUT e DELETE)
- `lib/validations/user.ts` (Schema `updateUserSchema`)
- `lib/api-client.ts` (Metodo `delete`)

**🎯 Contesto**

Implementazione della pagina di gestione utenti per admin con funzionalità CRUD complete:
- ✅ Lista utenti con filtri (ruolo, ricerca)
- ✅ Visualizzazione dettaglio utente (Dialog)
- ✅ Cambio ruolo (promuovi/degrada)
- ❌ Eliminazione utente (non funzionante)

#### 🐛 Problema #1: Errore Zod su cambio ruolo

**🔍 Errore:**

**🧪 Causa:**
Lo schema `updateUserSchema` richiedeva il campo `userId` nel body, ma l'ID era già presente nell'URL come path param:

```typescript
// ❌ Schema errato
export const updateUserSchema = z.object({
    userId: z.coerce.number().int().positive("ID utente non valido"),  // ← Campo richiesto
    name: z.string().min(2).optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    // ...
})

// Frontend inviava solo
{ role: "ADMIN" }  // ← Mancava userId

// Ma userId era già in /api/admin/users/3

// ✅ Schema corretto
export const updateUserSchema = z.object({
    // userId RIMOSSO - è già in params.id
    name: z.string().min(2, "Il nome deve contenere almeno 2 caratteri").optional(),
    surname: z.string().min(2, "Il cognome deve contenere almeno 2 caratteri").optional(),
    email: z.string().email("Indirizzo email non valido").optional(),
    phone: z.string().min(10).max(20).optional(),  // ← Validazione più flessibile (era min 15)
    password: z.string().min(8)
        .regex(/[A-Z]/, "Almeno una maiuscola")
        .regex(/[a-z]/, "Almeno una minuscola")
        .regex(/[0-9]/, "Almeno un numero")
        .regex(/[^A-Za-z0-9]/, "Almeno un carattere speciale").optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
})
```
🐛 Problema #2: DELETE utente non funzionava
**🧪 Causa:**
// ❌ Codice errato
const handleOpenDeleteDialog = (user: AdminUser) => {
    setMenuUser(user)           // 1. Imposta menuUser = user
    handleCloseMenu()            // 2. ❌ Azzera menuUser = null!
    setDeleteDialogOpen(true)    // 3. Dialog si apre con menuUser già null
}

const handleCloseMenu = () => {
    setAnchorEl(null)
    setMenuUser(null)  // ← Qui azzera menuUser!
}

1 - User clicca "Elimina Utente" nel menu
2 - handleOpenDeleteDialog(user) viene chiamato
3 - setMenuUser(user) → menuUser diventa l'utente selezionato
4 - handleCloseMenu() → menuUser diventa null immediatamente
5 - Dialog si apre, ma menuUser è già null
6 - Nel dialog non appare il nome utente (perché menuUser?.name è undefined)
7 - Clic su "Conferma Eliminazione" → if (!menuUser) return → nessuna azione

🛠 Soluzione:
// ✅ Codice corretto
const handleOpenDeleteDialog = (user: AdminUser) => {
    setMenuUser(user)
    setAnchorEl(null)           // Chiude solo il menu (non azzera menuUser)
    setDeleteDialogOpen(true)
}

// menuUser viene azzerato solo quando:
// - L'utente viene eliminato con successo (in handleConfirmDelete)
// - Il dialog viene chiuso senza confermare (nell'onClose del Dialog)

---

🐛 Problema #3: DELETE API richiedeva body ridondante

🔍 Situazione iniziale:
Endpoint DELETE richiedeva un body con userId:

// ❌ Backend iniziale
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // ...
    const body = await request.json();
    const validateData = deleteUserSchema.parse(body);  // ← Richiede { userId: number }
    const { userId: validatedUserId } = validateData;
    
    await prisma.user.delete({ where: { id: validatedUserId } });
}

// ❌ Frontend doveva inviare
await apiClient.delete(`/admin/users/${menuUser.id}`, JSON.stringify({ userId: menuUser.id }))
//                                                      ↑ Body ridondante!


Perfetto! Completo la documentazione della sezione #9 nel file DEVELOPMENT.md:

Vedo che il file ha duplicazioni. Aggiungo la sezione #9 completa alla fine del file corretto:

PUT /api/admin/users/3 500 in 1004ms
Zod validation error

🛠 Soluzione:
Rimosso il campo userId dallo schema perché ridondante (l'ID viene dal path param):

✅ Beneficio aggiuntivo:
Validazione telefono più realistica (da min 15 a min 10/max 20 caratteri per numeri italiani).

🐛 Problema #2: DELETE utente non funzionava
🔍 Sintomi:

Clic su "Conferma Eliminazione" → nessuna azione
Nessuna richiesta DELETE nella tab Network del browser
Console: handleConfirmDelete chiamato! → ⚠️ menuUser è null!
🧪 Causa:
Bug nella sequenza di chiamate in handleOpenDeleteDialog:

Sequenza eventi:

User clicca "Elimina Utente" nel menu
handleOpenDeleteDialog(user) viene chiamato
setMenuUser(user) → menuUser diventa l'utente selezionato
handleCloseMenu() → menuUser diventa null immediatamente
Dialog si apre, ma menuUser è già null
Nel dialog non appare il nome utente (perché menuUser?.name è undefined)
Clic su "Conferma Eliminazione" → if (!menuUser) return → nessuna azione
🛠 Soluzione:
Chiudere solo il menu senza azzerare menuUser:

✅ Risultato:

Nome utente visibile nel dialog di conferma
Statistiche prenotazioni/conversazioni visibili
DELETE API chiamata correttamente
Utente eliminato dal database
Lista utenti aggiornata automaticamente
🐛 Problema #3: DELETE API richiedeva body ridondante
🔍 Situazione iniziale:
Endpoint DELETE richiedeva un body con userId:

🧠 Problema architetturale:

- L'ID è già nell'URL (/admin/users/3)
- Richiedere l'ID anche nel body è ridondante e non RESTful
- Il metodo apiClient.delete non supportava il body per default
- Confusione su dove prendere l'ID (URL vs body)

🛠 Soluzione:
DELETE senza body (RESTful pattern):

// ✅ Backend corretto
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const adminUserId = await verifyAdmin(request);
    
    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId) || userId <= 0) {
        return NextResponse.json({ error: 'ID utente non valido' }, { status: 400 });
    }
    
    // Verifica esistenza
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
        return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }
    
    // Elimina (cascade automatico da Prisma schema)
    await prisma.user.delete({ where: { id: userId } });
    
    logger.info(`Admin (ID: ${adminUserId}) ha eliminato l'utente ID: ${userId}`);
    return NextResponse.json({ message: 'Utente eliminato con successo' }, { status: 200 });
}

// ✅ Frontend semplificato
await apiClient.delete(`/admin/users/${menuUser.id}`)  // ← Nessun body!

**✅ Vantaggi:**
- ✅ Più RESTful (DELETE su risorsa identificata dall'URL)
- ✅ Meno codice (nessun parsing body)
- ✅ Meno confusione (un solo posto dove prendere l'ID)
- ✅ Standard HTTP corretto
- ✅ Cascade delete automatico gestito da Prisma schema

---

#### 📋 Riepilogo Modifiche

1. **Schema Zod `updateUserSchema`:**
   - Rimosso campo `userId` (ridondante)
   - Validazione telefono più flessibile (10-20 caratteri)

2. **Route DELETE `/api/admin/users/[id]`:**
   - Rimossa validazione body
   - ID preso solo da path params
   - Cascade delete gestito da Prisma

3. **Frontend `handleOpenDeleteDialog`:**
   - Usa `setAnchorEl(null)` invece di `handleCloseMenu()`
   - Mantiene `menuUser` popolato fino alla conferma/annullamento

4. **apiClient.delete:**
   - Parametro `body` opzionale già supportato
   - Nessuna modifica necessaria

---

#### 💡 Lezioni Apprese

1. **Evitare ridondanza tra URL e body**
   - Se l'ID è nell'URL, non serve nel body
   - Pattern RESTful: `DELETE /resource/:id` (basta l'URL)

2. **State management nei Dialog**
   - Attenzione alla sequenza di `setState` calls
   - Verificare sempre quando/dove lo stato viene azzerato
   - Usare logger.info per debugging stato

3. **Validazione Zod context-aware**
   - Non tutti i campi devono essere validati in ogni endpoint
   - Adattare schema al contesto (path params vs body)

4. **Debugging metodico**
   - Identificare dove si blocca il flusso (logger.info strategici)
   - Verificare Network tab per vedere se API viene chiamata
   - Controllare stato componente con React DevTools

---

#### 🧪 Test Completati

- ✅ Cambio ruolo USER → ADMIN
- ✅ Cambio ruolo ADMIN → USER
- ✅ Eliminazione utente senza prenotazioni/conversazioni
- ✅ Eliminazione utente con prenotazioni (cascade)
- ✅ Eliminazione utente con conversazioni (cascade)
- ✅ Dialog conferma mostra nome utente e statistiche
- ✅ Lista utenti si aggiorna automaticamente dopo eliminazione
- ✅ Filtri (ruolo, ricerca) funzionano correttamente

---

### #10 — Error Handling TypeScript: Plain Objects vs NextResponse

**📅 Data:** 26 Aprile 2026  
**📂 File:** `lib/auth-helpers.ts`, tutte le route API  
**🔴 Severità:** Critica - Blocco Deploy Vercel  
**⏱️ Tempo risoluzione:** ~45 minuti

---

#### 🔍 Problema

Build falliva su Vercel con errore TypeScript:

Type '{ error: string; status: number; }' is not assignable to type 'void | Response'
Property 'error' does not exist on type 'NextResponse<{ error: string; }>'


**Sintomo:** Funzionava in sviluppo (`npm run dev`) ma falliva in produzione (`pnpm run build`).

---

#### 🧪 Causa Radice

La funzione helper `handleAuthError()` restituiva un **plain object** invece di una `Response`:

```typescript
// ❌ PRIMA (SBAGLIATO)
export function handleAuthError(error: unknown) {
    if (error instanceof Error) {
        switch (error.message) {
            case 'NON_AUTENTICATO':
                return { error: 'Non autenticato', status: 401 }  // ← Plain object!
            case 'TOKEN_INVALIDO':
                return { error: 'Token non valido', status: 401 }
            // ...
        }
    }
    return { error: 'Errore del server', status: 500 }
}

Nei catch delle route API:

catch (error) {
    const { error: errorMessage, status } = handleAuthError(error)  // Destrutturazione
    return NextResponse.json({ error: errorMessage }, { status })  // Ricostruzione manuale
}

Perché TypeScript si lamentava?

Next.js Route Handlers devono restituire:

Response (Web API standard)
NextResponse (wrapper Next.js)
void (streaming/redirect)
NON possono restituire oggetti plain come { error: string, status: number }.

```
#### 🛠 Soluzione
1. Modificato handleAuthError() per restituire NextResponse direttamente:

```typescript
// ✅ ADESSO (CORRETTO)
export function handleAuthError(error: unknown) {
    logger.error('Errore autenticazione:', error)

    if (error instanceof Error) {
        switch (error.message) {
            case 'NON_AUTENTICATO':
                return NextResponse.json(
                    { error: 'Non autenticato' },
                    { status: 401 }
                )
            case 'TOKEN_INVALIDO':
                return NextResponse.json(
                    { error: 'Token non valido o scaduto' },
                    { status: 401 }
                )
            case 'ACCESSO_NEGATO':
                return NextResponse.json(
                    { error: 'Accesso negato. Solo amministratori.' },
                    { status: 403 }
                )
            case 'UTENTE_NON_TROVATO':
                return NextResponse.json(
                    { error: 'Utente non trovato' },
                    { status: 404 }
                )
        }
    }

    // Errore generico
    return NextResponse.json(
        { error: 'Errore del server' },
        { status: 500 }
    )
}

2. Semplificato tutti i catch nelle route API (22 file

// ✅ Pattern pulito e consistente
catch (error) {
    return handleAuthError(error)  // 1 riga invece di 3!
}

✅ Vantaggi della Soluzione
Aspetto	Prima ❌	Dopo ✅
Type Safety	Plain object incompatibile	NextResponse type-safe
Codice	3 righe per gestire errore	1 riga pulita
Consistenza	Mix di pattern diversi	Pattern unico ovunque
Build Vercel	❌ Fallisce	✅ Passa
Manutenibilità	Destrutturazione ridondante	DRY principle applicato

22 route API files (pattern Find & Replace globale):

app/api/bookings/route.ts
app/api/bookings/[id]/route.ts
app/api/admin/bookings/route.ts
app/api/admin/bookings/[id]/route.ts
app/api/admin/users/route.ts
app/api/admin/users/[id]/route.ts
app/api/admin/conversations/route.ts
app/api/admin/conversations/[id]/route.ts
app/api/admin/conversations/[id]/messages/route.ts
app/api/admin/ai/suggest-reply/route.ts
app/api/admin/unread-count/route.ts
app/api/user/bookings/route.ts
app/api/user/conversations/route.ts
app/api/user/conversations/[id]/messages/route.ts
app/api/user/profile/route.ts
app/api/user/password/route.ts
app/api/user/me/route.ts
app/api/user/unread-count/route.ts
app/api/chat/route.ts
app/api/chat/[id]/route.ts
app/api/rooms/[id]/route.ts

Sostituzione applicata:

// TROVA:
const { error: errorMessage, status } = handleAuthError(error);
return NextResponse.json({ error: errorMessage }, { status });

// SOSTITUISCI CON:
return handleAuthError(error)


✅ Ottima idea! Questo è un pattern importante da documentare.

Prima verifico che tutto sia pulito:

Perfetto! Aggiungo la nuova sezione #10 subito dopo il problema #9.

Ecco la sezione da aggiungere al DEVELOPMENT.md (riga ~825, prima delle "Conclusioni"):

Type '{ error: string; status: number; }' is not assignable to type 'void | Response'
Property 'error' does not exist on type 'NextResponse<{ error: string; }>'

Nei catch delle route API:

Perché TypeScript si lamentava?

Next.js Route Handlers devono restituire:

Response (Web API standard)
NextResponse (wrapper Next.js)
void (streaming/redirect)
NON possono restituire oggetti plain come { error: string, status: number }.

🛠 Soluzione
1. Modificato handleAuthError() per restituire NextResponse direttamente:

2. Semplificato tutti i catch nelle route API (22 file):

✅ Vantaggi della Soluzione
Aspetto	Prima ❌	Dopo ✅
Type Safety	Plain object incompatibile	NextResponse type-safe
Codice	3 righe per gestire errore	1 riga pulita
Consistenza	Mix di pattern diversi	Pattern unico ovunque
Build Vercel	❌ Fallisce	✅ Passa
Manutenibilità	Destrutturazione ridondante	DRY principle applicato
📋 File Modificati
lib/auth-helpers.ts - Funzione handleAuthError() ora restituisce NextResponse

22 route API files (pattern Find & Replace globale):

app/api/bookings/route.ts
app/api/bookings/[id]/route.ts
app/api/admin/bookings/route.ts
app/api/admin/bookings/[id]/route.ts
app/api/admin/users/route.ts
app/api/admin/users/[id]/route.ts
app/api/admin/conversations/route.ts
app/api/admin/conversations/[id]/route.ts
app/api/admin/conversations/[id]/messages/route.ts
app/api/admin/ai/suggest-reply/route.ts
app/api/admin/unread-count/route.ts
app/api/user/bookings/route.ts
app/api/user/conversations/route.ts
app/api/user/conversations/[id]/messages/route.ts
app/api/user/profile/route.ts
app/api/user/password/route.ts
app/api/user/me/route.ts
app/api/user/unread-count/route.ts
app/api/chat/route.ts
app/api/chat/[id]/route.ts
app/api/rooms/[id]/route.ts
Sostituzione applicata:

💡 Lezioni Apprese
TypeScript strict mode in build vs dev:

npm run dev: TypeScript più permissivo, warning ignorabili
pnpm run build (Vercel): strict compilation, ogni type error blocca
Helper functions devono rispettare i vincoli del framework:

Next.js richiede che Route Handlers restituiscano Response | NextResponse | void
Non è possibile restituire oggetti plain e aspettarsi che funzionino
DRY principle applicato correttamente:

Prima: logica di gestione errori duplicata in 22 file (destrutturazione + ricostruzione)
Dopo: logica centralizzata, chiamata pulita ovunque
Error handling professionale:

Helper che restituiscono Response dirette sono il pattern standard
Codice più manutenibile e type-safe
Riduce il rischio di errori futuri
🧪 Test Completati
✅ Build locale passa (pnpm run build)
✅ Build Vercel passa senza errori TypeScript
✅ Tutte le route API gestiscono errori di autenticazione correttamente
✅ Status code HTTP corretti (401, 403, 404, 500)
✅ Error messages consistenti in tutta l'applicazione
✅ Logger integrato per debugging produzione


---

## 📝 Conclusioni e Prossimi Step

Il progetto Excelsior Hotel è quasi completo. Gli ultimi problemi di state management e validazione sono stati risolti, garantendo un'interfaccia admin robusta e funzionale.

**✅ Completato:**
- Sistema di autenticazione JWT
- Gestione camere, prenotazioni, conversazioni
- Interfaccia user completa con modifica prenotazioni
- Interfaccia admin completa (users, bookings, conversations)
- Integrazione AI (Gemini) per chat e suggerimenti
- Sistema di notifiche real-time
- Internazionalizzazione (i18n)
- Validazione robusta (Zod)

**🚀 Rimane da fare:**
- Admin rooms page (gestione inventario camere)
- Test end-to-end completi
- Ottimizzazioni performance
- Deploy produzione

---

*Documento aggiornato al 18 Aprile 2026*

