# 🏨 Hotel Excelsior - Sistema di Gestione Alberghiera

> Piattaforma full-stack moderna per la gestione completa di hotel con AI integrata, dashboard amministrativa avanzata e sistema di prenotazioni in tempo reale.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.3.8-0081CB?logo=mui)](https://mui.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📋 Indice

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Prerequisites](#-prerequisites)
- [🚀 Installazione](#-installazione)
- [⚙️ Configurazione](#️-configurazione)
- [🗄️ Database Setup](#️-database-setup)
- [💻 Development](#-development)
- [🔐 Test Credentials](#-test-credentials)
- [📁 Struttura Progetto](#-struttura-progetto)
- [📝 Logging System](#-logging-system)
- [🤖 AI Integration](#-ai-integration)
- [🚢 Deployment](#-deployment)
- [📄 License](#-license)

---

## ✨ Features

### 🔑 **Autenticazione & Autorizzazione**
- Sistema JWT con HttpOnly cookies
- Ruoli multi-livello (USER/ADMIN)
- Password hashing con bcrypt
- Middleware di protezione route

### 👨‍💼 **Dashboard Amministratore**
- **Gestione Utenti**: CRUD completo, cambio ruoli, monitoraggio attività
- **Gestione Stanze**: Creazione, modifica, eliminazione con galleria immagini
- **Gestione Prenotazioni**: Approvazione, rifiuto, modifica stati
- **Gestione Conversazioni**: Risposta ai clienti con AI-assisted replies
- **Statistiche Real-time**: Occupancy rate, revenue, analytics

### 👤 **Dashboard Utente**
- Profilo personalizzabile con avatar
- Storico prenotazioni con filtri avanzati
- Chat diretta con supporto
- Sistema di conversazioni thread-based

### 🤖 **AI Integration (Google Gemini)**
- **Chat Widget Pubblico**: Assistente virtuale 24/7 per informazioni hotel
- **Room Suggestions**: Raccomandazioni personalizzate basate su preferenze
- **Admin Assistant**: Suggerimenti intelligenti per risposte ai clienti
- **Context-Aware**: Integrazione con dati reali (stanze, prenotazioni)

### 🏠 **Sistema Stanze**
- Gestione multi-immagine con carousel
- Caricamento immagini con order, caption, isPrimary
- Filtri per disponibilità, prezzo, capacità
- Calcolo automatico disponibilità per date

### 📅 **Sistema Prenotazioni**
- Date picker con validazione (check-in/out)
- Calcolo automatico prezzi
- Prevenzione overbooking
- Modifiche prenotazione con tracking differenze
- Notifiche email automatiche

### 🌐 **Internazionalizzazione**
- i18next per traduzioni dinamiche
- Supporto Italiano/Inglese
- Language switcher persistente
- Traduzioni complete UI/API

### 📧 **Email System**
- React Email templates professionali
- Conferme prenotazione
- Notifiche admin
- Simulated send in development

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: Material-UI 7.3.8 + Emotion
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **Date Management**: Day.js + MUI X Date Pickers
- **i18n**: i18next, react-i18next

### **Backend**
- **Runtime**: Node.js (Next.js API Routes)
- **ORM**: Prisma 5.0.0
- **Database**: PostgreSQL
- **Authentication**: JWT (jose library)
- **Validation**: Zod 4.3.6
- **Password Hashing**: bcrypt 6.0.0

### **AI & Services**
- **AI Provider**: Google Generative AI (Gemini 2.5 Flash)
- **Email**: Resend + React Email

### **DevOps**
- **Package Manager**: pnpm
- **Linting**: ESLint 9 + Next.js config
- **Type Checking**: TypeScript strict mode

---

## 📦 Prerequisites

Prima di iniziare, assicurati di avere installato:

- **Node.js**: v18.0.0 o superiore
- **pnpm**: v8.0.0 o superiore (oppure npm/yarn)
- **PostgreSQL**: v14.0 o superiore
- **Git**: Per clonare il repository

---

## 🚀 Installazione

### 1. **Clona il Repository**
```bash
git clone https://github.com/andreone7788/excelsior.git
cd excelsior