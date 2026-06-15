# Horns & Heritage — Automation Setup Guide

Your site is a **static site** (EdgeOne / plain hosting). Static hosting cannot run server
code, so it cannot *by itself* send emails/WhatsApp or store orders across devices.

Everything below is **optional**. The site already works without it:

- ✅ **Order numbers** are generated automatically as `HH-YYYYMMDD-001` (resets daily).
- ✅ At checkout the customer gets a **"Send copy on WhatsApp"** button (pre-filled order
  summary + "Delivery within 24–48 hours in Kabula Village" + thank-you) and an
  **"Email me a receipt"** button (pre-filled `mailto:`).
- ✅ The **Sales Dashboard** (`Sales Dashboard.html`, password `HornsAdmin2026`) reads every
  order placed *in that browser*.

To make confirmations **fully automatic** and the dashboard **work across all devices**,
connect a free Google Sheet using the steps below. (~15 minutes, no coding experience needed.)

---

## A. Create the order-log Google Sheet

1. Go to <https://sheets.google.com> → **Blank spreadsheet**. Name it `H&H Orders`.
2. In row 1, add these headers (one per column):
   `Timestamp | OrderRef | Name | Phone | Email | Address | District | Method | Items | Total`

## B. Add the webhook (Google Apps Script)

1. In the sheet: **Extensions → Apps Script**.
2. Delete any sample code and paste this:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  var d = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(), d.ref, d.name, d.phone, d.email,
    d.addr, d.district, d.method, d.items, d.total
  ]);

  // --- Optional: email the customer a receipt automatically ---
  if (d.email) {
    MailApp.sendEmail({
      to: d.email,
      replyTo: 'hello@hornsheritage.ug',
      subject: 'Horns & Heritage — Order ' + d.ref,
      body: 'Hi ' + d.name + ',\n\n' +
            'Thank you for your order (' + d.ref + ').\n\n' +
            d.items + '\n\nTotal: ' + d.total + '\n\n' +
            'Delivery within 24–48 hours in Kabula Village.\n\n' +
            'Thank you for supporting Horns & Heritage – a family ranch since 1947.'
    });
  }
  return ContentService.createTextOutput('ok');
}
```

3. **Deploy → New deployment → Web app.**
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
   - Click **Deploy**, authorise, and **copy the Web app URL** (ends in `/exec`).

## C. Point the site at your webhook

In `hh-enhance.js`, inside the `confirmOrder` function (right after the order is built),
add this — replacing the URL with your `/exec` URL from step B:

```javascript
fetch('PASTE_YOUR_WEB_APP_URL_HERE', {
  method: 'POST',
  mode: 'no-cors',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ref: ref, name: details.name, phone: details.phone, email: email,
    addr: details.addr, district: details.district, method: details.method,
    items: items.map(function (it) { return it.name + ' x' + it.qty; }).join(', '),
    total: fmtUGX(total)
  })
});
```

Now every confirmed order is logged to your sheet **and** the customer is emailed
automatically — from any device.

---

## D. Automatic WhatsApp messages

`wa.me` links (already on the site) only *open* WhatsApp for the customer to tap send —
they cannot auto-send. For true automatic WhatsApp confirmations you need an approved
**WhatsApp Business API** provider (e.g. Twilio, 360dialog, or Meta Cloud API). Once you
have an API key, add a second `UrlFetchApp.fetch(...)` call inside the Apps Script `doPost`
above to POST the message to your provider. Most ranches find the email + tap-to-send
WhatsApp flow already in place is enough to start.

---

## E. Cross-device dashboard (read from the sheet)

The dashboard currently reads this browser's saved orders. To show **all** orders from the
sheet instead:

1. In your `H&H Orders` sheet: **File → Share → Publish to web** → publish as **CSV**.
2. Copy the published CSV link.
3. Tell me the link and I'll wire `Sales Dashboard.html` to fetch and total that CSV —
   giving you live revenue (today / week / month / all-time) across every device.

---

## Reference numbers used on the site

- WhatsApp / business number: `+256 764 250 125` (used in all `wa.me` links)
- Email sender / reply-to: `hello@hornsheritage.ug`
- Dashboard password: `HornsAdmin2026` (change it in `Sales Dashboard.html`, variable
  `ADMIN_PASSWORD`)

> **Security note:** a password kept in front-end code is a light gate, not real security —
> it keeps casual visitors out. For a strictly private dashboard, host it behind your
> hosting provider's password protection or a Google login.

---

## Membership tags — 1-year auto-expiry (method used)

When a customer checks out with any membership in their cart (Bronze, Silver, Gold or
Premium), their profile is tagged with that tier. **The tag is valid for exactly one year.**

Because the site is static (no server cron is available), the expiry is handled with the
**"store the expiration timestamp with the tag and check it at login"** method:

1. On purchase, `confirmOrder()` (in `hh-enhance.js`) stamps the profile with:
   - `membership` — the tier name (e.g. `gold`)
   - `membershipSince` — the purchase timestamp
   - `membershipExpires` — exactly one calendar year later (`oneYearFrom()`)
   These are saved on both the active session (`hh_user`) and the stored account
   (`hh_accounts`).
2. On **every page load and at login**, `pruneExpiredMembership()` runs. If
   `Date.now()` is past `membershipExpires`, the `membership` tag (and its dates) are
   removed from both the session and the account, so member-only benefits stop and the
   "Active – Paid" badge disappears.
3. **Renewing / buying again** simply re-runs step 1, stamping a fresh one-year window
   from the new purchase date.

No external service or cron job is required — the check happens client-side whenever the
customer opens the site or signs in. The account dropdown also shows the renewal date
(e.g. *"Membership: Gold – Paid · renews 1 Jun 2027"*).

---

## F. Command Centre modules (Pending Orders, Low Stock, Carts, Customers, Goal, Inquiry Log)

The Sales Dashboard now includes an admin-only **Command Centre**. It reads the same data
the storefront already saves, and stores its own admin notes under new keys **in your
browser** (nothing is sent anywhere, nothing on the customer site changes):

| Module | Reads | Admin data it saves |
|---|---|---|
| **Pending Orders** | `hh_orders` | `hh_order_status` — confirm / deliver / cancel + reason per order |
| **Monthly Goal** | `hh_orders` | `hh_goal` — your monthly UGX target (default 10,000,000) |
| **Low Stock** | product catalogue | `hh_stock` — stock count + reorder threshold per product |
| **Abandoned Carts** | `hh_cart_v1`, `hh_user` | `hh_cart_meta` — when the cart was first seen |
| **Top Customers** | `hh_orders` | — (calculated live) |
| **Inquiry Log** | `hh_inquiries` | `hh_inquiry_status` — New / Contacted / Converted / Lost |

**Order status:** every order starts as **Pending**. *Confirm order* marks it Confirmed and
opens a pre-filled WhatsApp + email confirmation to the customer. *Mark delivered* and
*Cancel* (with optional reason) update the status. The sidebar badge counts open orders.

**Restock buttons** open WhatsApp to the supplier number set at the top of
`dashboard-command-centre.js` (`SUPPLIER_WA`) — change it to your real supplier.

**Daily report** (top bar) shows today's revenue, pending orders, top product, top cattle
inquiry, and new signups. Use **Print / Save as PDF** or **Copy as text**.

### Making the Command Centre work across all devices (Google Sheet as database)

Because the site is static, all of the above lives in **one browser**. To run the Command
Centre from any device, use a Google Sheet as a shared database — the same webhook from
sections A–C, extended with a few sheets:

1. **Orders + status.** Add an `OrderRef` and a `Status` column to the `H&H Orders` sheet
   from section A. When you confirm/deliver/cancel an order, the dashboard can write the
   new status back with a second Apps Script function (`doPost` with an `action:'status'`
   field updating the matching `OrderRef` row).
2. **Stock.** Add a second tab `Stock` with columns `Product | Stock | Threshold`. Publish
   it to web as CSV (File → Share → Publish to web) and the dashboard can read live stock
   instead of the in-browser defaults.
3. **Inquiries.** Add an `Inquiries` tab (`Timestamp | Item | Phone | Status`). To capture
   the customer's phone with each WhatsApp inquiry click, the storefront's `trackInquiry()`
   would POST to the webhook — but that touches the live site, so only do it when you're
   ready.
4. Send me the published CSV link(s) and I'll wire the dashboard to read/write them, so
   pending orders, stock, customers, and inquiries are shared across every device.

Until then everything works fully offline in the browser you use for admin — which is the
right setup for a single-laptop or single-phone command centre.
