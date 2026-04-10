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