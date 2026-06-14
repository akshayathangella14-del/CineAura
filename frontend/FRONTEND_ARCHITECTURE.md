# CineAura Frontend Architecture

## Purpose

This document defines the official frontend architecture of CineAura.

Every frontend implementation must follow this document.

The frontend must always remain aligned with:

* CINEAURA_BACKEND_DOCUMENTATION.md
* UI_DESIGN_SYSTEM.md
* FRONTEND_ROADMAP.md

---

# Frontend Vision

CineAura is not a movie database.

CineAura is an AI-powered cinematic movie discovery platform.

The frontend must feel:

* Premium
* Cinematic
* Intelligent
* Personalized
* Modern
* Smooth
* Emotional

Users should feel that CineAura understands their taste.

---

# Technology Stack

Framework:

* React

Build Tool:

* Vite

Routing:

* React Router DOM

State Management:

* Zustand

Animations:

* Framer Motion

API Communication:

* Axios

Icons:

* Lucide React

Notifications:

* React Hot Toast

---

# Folder Structure

frontend/
└── src/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   ├── movie/
│   ├── recommendation/
│   ├── profile/
│   └── admin/
│
├── pages/
├── routes/
├── hooks/
├── services/
├── store/
├── styles/
├── utils/
├── App.jsx
└── main.jsx

---

# Avatar Storage

Location:

public/
└── avatars/

All avatar images must be stored here.

Example:

public/avatars/avatar1.png

Usage:

/avatars/avatar1.png

---

# Store Architecture

store/
├── authStore.js
├── movieStore.js
├── recommendationStore.js
├── profileStore.js
├── searchStore.js
├── adminStore.js
└── uiStore.js

---

# API Layer

services/
├── authService.js
├── movieService.js
├── recommendationService.js
├── profileService.js
├── adminService.js

Services must be responsible for all backend communication.

Components must never call axios directly.

---

# Page Architecture

Pages:

* Login
* Register
* Home
* Movie Details
* Search
* Profile
* Aura
* Journey
* Watchlist
* Admin Dashboard

Pages are containers.

Business logic must remain in stores/services.

---

# Component Rules

Components must:

* Be reusable
* Be small
* Have single responsibility

Avoid giant components.

Split whenever complexity increases.

---

# Backend Integration Rule

Frontend must use backend APIs exactly as documented.

Never create mock APIs when real APIs exist.

Backend is the source of truth.

---

# AI Features

Frontend must expose:

* Aura
* Taste Journey
* Perfect Picks
* Similar Users
* Explainable Recommendations
* Analytics

These are CineAura's differentiators.

---

# Performance Goals

Initial Load:
< 3 seconds

Page Transition:
< 500ms

Search Suggestions:
Real-time

Animations:
60fps

---

# Accessibility

Support:

* Keyboard navigation
* Screen readers
* Focus indicators
* Proper contrast

---

# Final Rule

Do not imitate Netflix, IMDb, Trakt, or Letterboxd.

Take inspiration from them.

CineAura must have its own identity.
