# Dynamic QR Code Platform - Architecture & Product Specification

## 1. Product Overview
The **Dynamic QR Code Platform** is a SaaS application that allows users to generate QR codes with mutable destination URLs. Unlike static QR codes, these "dynamic" QR codes point to a short link hosted by the platform, which then redirects to the final destination. This enables users to change the target URL without reprinting the QR code and allows for detailed scan analytics.

### Key Features
- **Dynamic Redirection**: Change the destination URL anytime.
- **Static Short Links**: Permanent short URLs (e.g., `qr.app/xYz123`) assigned to each QR code.
- **Advanced Analytics**: Track total scans, unique visitors, device types, locations, and time of scans.
- **Custom Design**: customize QR code colors, shapes, and logos.
- **Subscription Model**: 7-Day Free Trial followed by tiered paid subscriptions.

---

## 2. User Architecture & Flow

### 2.1 Core User Flow
1.  **Registration/Login**: User signs up (Magic Link / OAuth).
2.  **Onboarding**: User starts a 7-day free trial immediately or upon first premium action.
3.  **Dashboard**: User views an overview of active QRs and recent performance.
4.  **Create QR**:
    -   User enters destination URL (e.g., `https://mysite.com`).
    -   System generates a unique short code (e.g., `abc12`).
    -   User customizes QR design (dots, corners, color).
    -   QR is generated and ready for download/printing.
5.  **Management**: User can update the destination URL for `abc12` to `https://myshop.com` at any time. The QR code image remains valid.
6.  **Analytics**: User views charts showing scan velocity and demographics.

### 2.2 Redirection Flow (The Engine)
When a user scans the QR Code:
1.  **Scan**: User's phone camera reads the QR code containing `https://qr.app/abc12`.
2.  **Request**: Browser requests `GET https://qr.app/abc12`.
3.  **Lookup**: Server looks up the active destination for `abc12`.
    -   *Check*: Is the subscription active? If no, redirect to "Service Paused" page.
4.  **Log**: Server asynchronously logs the scan event (IP, User Agent, Time) to the analytics queue.
5.  **Redirect**: Server responds with `302 Found` (or `307 Temporary Redirect`) to the destination URL.

---

## 3. Technical Architecture

### 3.1 Tech Stack
-   **Monorepo Strategy**: Turborepo for workspace management.
-   **Frontend (`apps/web`)**:
    -   **Framework**: React (Vite).
    -   **Routing**: TanStack Router.
    -   **State/Data**: TanStack Query.
    -   **Styling**: TailwindCSS (v4).
    -   **UI Library**: Shadcn UI / Radix primitives.
-   **Backend (`apps/server`)**:
    -   **Runtime**: Bun.
    -   **Framework**: ElysiaJS (High performance).
    -   **API Protocol**: oRPC (End-to-end type safety).
    **Database**: PostgreSQL (via Drizzle ORM).
    -   **Auth**: Better Auth.
-   **Infrastructure**:
    -   **Key-Value Store**: Redis (for caching redirects and rate limiting).
    -   **Analytics DB**: ClickHouse or TimescaleDB (optional, or optimized Postgres tables for MVP).

### 3.2 Database Schema (Conceptual)

#### `users`
-   `id` (PK)
-   `email`
-   `name`
-   `createdAt`

#### `subscriptions`
-   `id` (PK)
-   `userId` (FK)
-   `status` (active, past_due, canceled, trialing)
-   `planId`
-   `currentPeriodEnd`
-   `trialEndsAt`

#### `qr_codes`
-   `id` (PK)
-   `userId` (FK)
-   `shortCode` (Unique Index, e.g., "xYz123")
-   `destinationUrl` (The dynamic target)
-   `title`
-   `designConfig` (JSON: colors, shapes)
-   `status` (active, archived)
-   `createdAt`

#### `scan_events`
-   `id` (PK)
-   `qrCodeId` (FK)
-   `timestamp`
-   `ipAddress` (Hashed for privacy compliance)
-   `userAgent`
-   `country`
-   `city`
-   `deviceType` (Mobile/Desktop)
-   `os` (iOS/Android)

---

## 4. Detailed Component Implementation

### 4.1 Short Link & Redirect Service
This is the most critical part of the system. It must be extremely fast.
-   **Endpoint**: `GET /:shortCode`
-   **Logic**:
    1.  Check Redis Cache for `shortCode` -> `destinationUrl`.
    2.  If miss, query Database, populate Redis (TTL 60s).
    3.  Emit "Scan Event" to a background job/queue (don't block the response).
    4.  Return 302 Redirect.

### 4.2 Analytics Processing
-   **Ingestion**: The redirect service pushes raw event data to a queue.
-   **Processor**: A worker Service consumes the queue, enriches data (IP Geolocation), and writes to `scan_events`.
-   **Aggregation**: Pre-calculated stats (e.g., daily counts) can be stored in a separate table for fast dashboard loading.

### 4.3 Payment & Subscription flow
-   **Provider**: Stripe or LemonSqueezy.
-   **Logic**:
    -   **Free Trial**: On sign-up, user gets a "Pro-Trial" plan in DB with `trialEndsAt = now + 7 days`.
    -   **Enforcement**: Middleware checks `subscription.status` or `trialEndsAt`. If expired and no payment method, block access to "Create QR" and disable redirects (or show a "Upgrade to continue" interstitial).
    -   **Webhooks**: Listen for `invoice.paid`, `customer.subscription.deleted`, etc., to sync local DB state.

### 4.4 QR Code Generator
-   **Library**: `qrcode.react` or similar on frontend for preview.
-   **Export**: Server-side rendering (using `node-canvas` or similar) might be needed for high-res PNG/SVG exports if the client-side canvas isn't sufficient.

---

## 5. Security & Compliance
-   **Malicious URL Protection**: Integrate with Google Safe Browsing API to prevent users from shortening phishing links.
-   **Rate Limiting**: Prevent abuse of the redirect endpoints.
-   **GDPR**: Anonymize IP addresses and offer "Do Not Track" options.
