# VOX Beauty Salon — site de prezentare

Site static (HTML / CSS / JavaScript, fără build) pentru VOX Beauty Salon, Oradea.
Design editorial „Didone” — ivoriu & auriu, cu motivul arcadei aurii preluat din oglinzile salonului.

## Structură

```
index.html        Pagina principală (hero, despre, servicii, echipă, galerie, recenzii, program, contact)
servicii.html     Meniul complet de servicii, cu prețuri și durate
echipa.html       Cele trei specialiste (Camelia, Sara, Lia)
galerie.html      Galerie filtrabilă, cu lightbox
contact.html      Formular de întrebări + program + hartă
assets/
  css/styles.css  Tot stilul (tokens de culoare, tipografie, componente)
  js/main.js      Interacțiuni (meniu mobil, animații, galerie, formular)
  img/            Imagini optimizate + logo (auriu / ivoriu) + favicon
```

## Fonturi
- **Bodoni Moda** (titluri, display) și **Jost** (text) — încărcate de la Google Fonts.

## De personalizat înainte de publicare

1. **Email de contact** — este un placeholder și, pentru protecție anti-spam, **nu apare în HTML**;
   se compune în JavaScript. Schimbă adresa într-un singur loc: în `assets/js/main.js`, constanta
   `EMAIL` (`"salut" + ... + "voxbeautysalon" + "." + "ro"`). Formularul deschide aplicația de email
   a vizitatorului (`mailto:`) — nu necesită server.
2. **Instagram** — link-urile duc deja la `instagram.com/voxbeautysalon`.
3. **Hartă** — se afișează un panou stilizat cu locația care duce la Google Maps. Dacă vrei o hartă
   interactivă încorporată, înlocuiește `src`-ul din `<iframe class="visit-map">` cu codul oficial de
   „Embed a map" din Google Maps (Share → Embed).
4. **Programări** — la cerere, butoanele de programare au fost eliminate; site-ul folosește doar
   email + Instagram pentru întrebări.

## Imagini
Imaginile folosite se află în `assets/img/` (nume descriptive). Fișierele originale, cu nume codificate,
au rămas în rădăcina proiectului și pot fi șterse fără efect asupra site-ului.

## Securitate & anti-bot (formular)
- **Email ascuns** de scrapere (compus în JS, nu în HTML).
- **Honeypot** (câmp invizibil `company`) — dacă e completat, mesajul e ignorat.
- **Time-trap** — trimiterile în primele ~3,5 secunde sunt blocate (comportament de bot).
- **Rate limiting** — 45 de secunde între mesaje, per browser.
- **Validare** — nume, email și mesaj verificate înainte de trimitere.
> Fiind un site static (fără server), aceste măsuri sunt pe partea de client. Pentru rate limiting
> „dur", de neocolit, ar fi nevoie de un serviciu de formular (ex. Formspree) sau un mic backend.

## GDPR / cookie-uri
- Banner de consimțământ (Acceptă / Doar necesare) la prima vizită.
- **Google Maps se încarcă doar după acord** — până atunci se vede un panou static, fără cookie-uri.
- Pagina `confidentialitate.html` (linkată în footer) acoperă datele, cookie-urile și drepturile GDPR.
- **Google Fonts** este disclosat în politică. Pentru conformitate maximă, fonturile pot fi găzduite
  local (elimină transferul de IP către Google) — descarcă fonturile Fraunces/Jost și înlocuiește
  link-ul `<link ... fonts.googleapis.com>` cu `@font-face` local.

## Antete de securitate
`_headers` (Netlify) și `.htaccess` (Apache) setează CSP, X-Frame-Options, Referrer-Policy,
Permissions-Policy și HSTS. Există și un `<meta>` CSP în fiecare pagină, ca protecție și pe hosturi
care nu permit antete (ex. GitHub Pages).

## Imagini
Toate imaginile din `assets/img/` au fost mărite 2× și clarificate. Fișierele originale (nume codificate)
au rămas în rădăcină și pot fi șterse.

## Publicare
Fiind un site static, poate fi găzduit oriunde: Netlify, Vercel, GitHub Pages, cPanel etc.
Se urcă pur și simplu toate fișierele. Nu necesită pași de build.

Local, pentru previzualizare: `python -m http.server` din folderul proiectului.
