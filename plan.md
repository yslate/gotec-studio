# 🎧 GOTEC DJ-Studio Buchungssystem

## Projektübersicht

Ein Buchungs- und Check-in-System für Recording-Sessions im GOTEC Studio in Karlsruhe. **Gäste** (Fans, Tänzer, Leute mit gutem Vibe) können Termine buchen, um bei Recording-Sessions dabei zu sein und zuzuschauen.

**Beispiel:** Am 11.1. gibt es ein Recording mit 3 Slots (Secret Artist). Gäste mit Karte können sich online für diesen Termin anmelden.

------

## 🎯 Zwei getrennte Systeme

### 1️⃣ Gäste-Buchungssystem (Hauptsystem)

Für Leute die bei Recordings dabei sein wollen

### 2️⃣ Artist-Buchungen (Separates Formular)

Für Artists die Recording-Sessions buchen wollen → einfaches Formular, manuell bearbeitet

------

## 👥 Gäste-Typen

| Gruppe          | Zugang                                | Max. pro Termin |
| --------------- | ------------------------------------- | --------------- |
| Karteninhaber   | Physische "Black Card" (1-100)        | 15 Personen     |
| Warteliste      | Für Karteninhaber bei vollen Terminen | 5 Personen      |
| Gästeliste (GL) | QR-Code vom Artist                    | 10 Personen     |

------

## ⏱️ Zeitstruktur

| Element            | Dauer            | Details      |
| ------------------ | ---------------- | ------------ |
| 1 Recording-Termin | Ganzer Tag (~4h) | Inkl. Pausen |
| Recording-Slots    | 3 × 1 Stunde     | Pro Termin   |

------

## 🎫 Karten-System (Black Cards)

### So funktioniert's:

1. Yanis verteilt **100 physische Karten** im Club an Leute mit gutem Vibe
2. Karteninhaber gehen online und **wählen einen Termin** (z.B. "11.01. - Secret Artist Recording")
3. Am Tag: **Karte abgeben** als Eintrittskarte
4. Nach Session: **Karte wird resettet** → bereit für nächsten Termin

### Karten-Details:

- **100 Karten** mit Nummerierung (1-100)
- Werden **neu produziert** mit Nummern
- Vergabe: **Persönlich im Club**
- Pro Termin: **Max. 15 Karteninhaber**

### ⚠️ No-Show Regelung

- Termine können gecancelt werden (keine Strafe)
- 1. No-Show: Warnung im System
- 1. No-Show: **Karte wird gesperrt** (z.B. Karte #44)
- Gesperrte Karten können vom Admin wieder entsperrt werden

------

## ⭐ Gästeliste (GL) System

- Artists bekommen **GL-Tickets** die sie an ihre Fans/Freunde verteilen können
- Anzahl pro Artist wird **manuell vom Admin** festgelegt
- Gäste erhalten **QR-Code**
- Vor Ort: **Personal scannt QR-Code** per Handy-WebApp
- Max. **10 GL-Gäste** pro Termin (zusätzlich zu den 15 Karteninhabern)

------

## 🖥️ System-Komponenten

### A) Team Admin-Panel (Yanis + Team)

| Feature            | Beschreibung                                               |
| ------------------ | ---------------------------------------------------------- |
| 📅 Kalender         | Übersicht aller Recording-Termine                          |
| Termine anlegen    | z.B. "11.01. - Secret Artist Recording"                    |
| Karten verwalten   | 100 Karten, Status einsehen (aktiv/gesperrt)               |
| Karten resetten    | Nach Session Karte wieder freigeben                        |
| GL-Kontingent      | Pro Artist festlegen wie viele GL-Tickets er vergeben darf |
| Sperren/Entsperren | Karten bei No-Shows sperren oder wieder freigeben          |
| Buchungen einsehen | Wer hat sich für welchen Termin angemeldet                 |
| Check-in Status    | Live sehen wer schon da ist                                |

### B) Gäste-Bereich (Karteninhaber)

| Feature          | Beschreibung                                  |
| ---------------- | --------------------------------------------- |
| Termin auswählen | Verfügbare Recording-Termine sehen und buchen |
| Termin canceln   | Buchung stornieren ohne Strafe                |
| Registrierung    | Name + Handynummer pro Buchung                |

### C) Personal-App (Handy)

| Feature             | Beschreibung                          |
| ------------------- | ------------------------------------- |
| QR-Scanner          | GL-Gäste einscannen zur Verifizierung |
| Check-in bestätigen | Gast ist angekommen                   |

### D) Artist-Formular (Separat)

| Feature              | Beschreibung                         |
| -------------------- | ------------------------------------ |
| Recording anfragen   | Einfaches Kontaktformular            |
| Manuelle Bearbeitung | Yanis bearbeitet Anfragen persönlich |

------

## 📊 Kapazitäten pro Termin

| Gruppe                         | Maximum         |
| ------------------------------ | --------------- |
| Karteninhaber (Gäste)          | 15              |
| Warteliste (nur Karteninhaber) | 5               |
| Gästeliste (GL)                | 10              |
| **TOTAL vor Ort**              | **25 Personen** |

------

## 🔄 Ablauf

| Schritt | Aktion                                                       | Wer      |
| ------- | ------------------------------------------------------------ | -------- |
| 1       | Yanis legt Recording-Termin an (z.B. "11.01. Secret Artist") | Admin    |
| 2       | Yanis verteilt Black Cards im Club                           | Admin    |
| 3       | Gast geht online und wählt Termin                            | Gast     |
| 4       | Artist bekommt GL-Kontingent zugewiesen                      | Admin    |
| 5       | Artist verteilt GL-Tickets (QR-Codes) an seine Leute         | Artist   |
| 6       | Am Tag: Gäste erscheinen, Karte abgeben / QR scannen         | Personal |
| 7       | Recording-Session (~4h)                                      | Alle     |
| 8       | Admin resettet Karten im System                              | Admin    |

------

## ✅ Nächste Schritte

- [ ]  Neue Karten mit Nummerierung produzieren
- [ ]  Web-App entwickeln (Gäste-Buchung + Admin)
- [ ]  QR-Scanner für Personal-Handys einrichten
- [ ]  Separates Artist-Formular erstellen
- [ ]  Erste Testläufe

------

## 🛠️ Tech Stack

### Frontend
| Technologie | Verwendung |
|-------------|------------|
| **Next.js 15** | React Framework mit App Router |
| **TypeScript** | Type Safety |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | UI Components |

### Backend & Datenbank
| Technologie | Verwendung |
|-------------|------------|
| **Next.js API Routes** | Backend API |
| **PostgreSQL** | Datenbank |
| **Drizzle ORM** | Type-safe Database Queries |
| **Better Auth** | Authentication (falls benötigt) |

### E-Mail
| Technologie | Verwendung |
|-------------|------------|
| **Postmark** | Transaktionale E-Mails (Buchungsbestätigungen, QR-Codes) |

### Deployment & Infrastruktur
| Technologie | Verwendung |
|-------------|------------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-Container Setup (App + PostgreSQL) |
| **Hetzner Cloud** | Server Hosting |
| **Nginx** | Reverse Proxy (optional) |

### Sicherheit & DSGVO
| Anforderung | Umsetzung |
|-------------|-----------|
| **HTTPS** | SSL/TLS via Let's Encrypt |
| **Datenverschlüsselung** | Sensible Daten verschlüsselt speichern |
| **Rate Limiting** | Schutz vor Brute-Force |
| **Input Validation** | Zod Schema Validation |
| **DSGVO-konform** | Datensparsamkeit, Löschkonzept, Einwilligung |
| **Cookie Consent** | Nur notwendige Cookies, Consent Banner |
| **Impressum & Datenschutz** | Rechtliche Seiten |
| **Datenexport** | Nutzer können ihre Daten anfordern |
| **Löschung** | Automatische Löschung nach Aufbewahrungsfrist |

------

*GOTEC DJ-Studio Buchungssystem | Projektplan v1.2 | Januar 2026*