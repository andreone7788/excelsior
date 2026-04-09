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