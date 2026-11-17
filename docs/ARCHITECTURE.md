# System Architecture & Caching Strategy

## Rendering & Edge Delivery

* **Product Listing Pages (PLP):** Built using Incremental Static Regeneration (ISR) with on-demand revalidation webhooks triggered whenever inventory or pricing changes in the headless CMS.
* **Product Detail Pages (PDP):** Pre-rendered at the edge with client-side hydration for real-time variant stock availability.
* **Cart & Checkout:** Driven by React Server Actions paired with optimistic UI state reducers to eliminate perceived latency during high-traffic drops.

---

## Concurrency & Inventory Locking

1. **Optimistic UI Update:** Adding an item immediately updates local state and calculates subtotals in <50ms.
2. **Atomic Reservation:** A server action places a 5-minute TTL lock on the SKU variant in Redis/KV storage before redirecting to Stripe.
3. **Rollback Resilience:** If concurrent traffic depletes the SKU before the lock is acquired, the API returns a `409 Conflict` payload, triggering an automatic state rollback and user notification.

---

## Security & Observability

* **Webhook Verification:** All Stripe payment intents and inventory sync endpoints enforce cryptographic signature validation (`stripe-signature`).
* **Edge Rate Limiting:** Checkout reservation endpoints enforce sliding-window rate limits per IP to mitigate automated scalper bots.
