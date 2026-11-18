# GK Wedding — online invitation

Static one-page wedding invitation (HTML/CSS/JS, no build step). Responsive for mobile and desktop.
Theme follows the printed card `การ์ดงานแต่งแบบที่1 (5 x 7 นิ้ว).pdf`: navy on white, engraved peony line art, Cormorant Garamond + Kanit.

## Run locally

```bash
python3 -m http.server 5173
```

Open http://localhost:5173

## Sections

1. Envelope intro (tap the GK seal to open)
2. Save the date — monogram, date, venue, countdown, hero photo
3. Invitation — parents, bride & groom names
4. Full-width photo band
5. Schedule (07.09 พิธีสงฆ์ · 08.09 แห่ขันหมาก · 10.39 ผูกข้อมือ · 11.30 รับประทานอาหาร) + add-to-calendar
6. Dress code — Navy / Sky / Cocoa / Ivory
7. Gallery carousel (9 photos, 2:3 portrait, scroll-snap; 1 per view on mobile, 3 on desktop paging 1–3 / 4–6 / 7–9; arrows wrap around; autoplay every 4.5 s while on screen, pauses on hover, stops for good on touch/swipe/click, off with reduced motion) + lightbox (`CONFIG.photos` in `script.js`)
8. Venue — QR from the card (`q.me-qr.com/xzmaoeii`), Google Maps embed
9. RSVP form
10. Wedding gift (PromptPay — placeholder)
11. Thank you / #GKWEDDING

## Files

- `index.html`, `style.css`, `script.js`
- `images/photo-01..09.jpg` (10–12 unused) — random picks from `~/Pictures/Export/wedding-gift-kungten`, resized to 1600px (placeholders until final selection)
- `images/deco/peony-lg.png`, `peony-sm.png`, `qr-venue.png` — extracted from the card PDF

## Checklist (อัปเดต 2026-11-16)

### ได้แล้ว ✅
- [x] ธีมตามการ์ด PDF (กรมท่า-ขาว, ลายดอกโบตั๋น, monogram GK)
- [x] ชื่อบ่าวสาว ชื่อพ่อแม่ สถานที่ วันที่ จากการ์ด PDF
- [x] กำหนดการ 4 พิธี (07.09 / 08.09 / 10.39 / 11.30)
- [x] QR แผนที่ + Google Maps (โรงเรียนอนุบาลไพศาลี)
- [x] เวลาเลิกงานในปุ่มเพิ่มลงปฏิทิน 07.09–14.00 น. — ยืนยันแล้ว
- [x] ข้อความที่แต่งไว้ (คำคมบนรูป, dress code, ขอบคุณ, ของขวัญ) — ใช้ตามนี้ไปก่อน
- [x] ชื่อโทนสี dress code Navy / Sky / Cocoa / Ivory — ยืนยันแล้ว
- [x] เพลงพื้นหลัง A Thousand Years → Perfect วนสลับ ที่ 25% (`audio/bgm.mp3`, `audio/bgm-2.mp3`)
- [x] RSVP → Google Sheet "GK Wedding RSVP" ผ่าน Apps Script — deploy แล้ว 2026-11-19, URL อยู่ใน `CONFIG.rsvpEndpoint`, ทดสอบส่งจริงผ่าน
- [x] Responsive มือถือ + คอม
- [x] รูปหน้าแรก `images/hero.jpg` (kungten46) · รูปคั่นเต็มจอ `images/band.jpg` (kungten269)
- [x] Monogram G & K และตราปิดซอง ดึง vector จาก PDF (`images/deco/monogram.svg`, `monogram-white.svg`)
- [x] รูปพรีวิวตอนแชร์ลิงก์ `images/og-image.jpg` 1200×630 (ครึ่งซ้ายจากการ์ด PDF + รูปหน้าแรก) · og tags ใช้ URL เต็ม
- [x] ไอคอนเว็บ = ตรา GK สีกรมท่า (`icon.svg`, `icon-32.png`, `apple-touch-icon.png` 180px; source `images/deco/icon-square.svg`)

### รอข้อมูล ⏳
- [ ] **รูป gallery 9 รูป (แนวตั้ง 2:3)** — ตอนนี้เป็นรูปสุ่ม `photo-01..09`
- [ ] **ชื่อภาษาอังกฤษบ่าวสาว** — ตอนนี้ `Worawee & Pawornrut` (เดา)
- [ ] **ของขวัญ**: QR PromptPay + ชื่อบัญชี + เลขพร้อมเพย์/เลขบัญชี
- [ ] **วันปิดรับ RSVP** — ตอนนี้ 20 ก.พ. 2570 (ชั่วคราว)

### ไม่บังคับ
- [ ] รูปเดี่ยวเจ้าบ่าว / เจ้าสาว (section แนะนำตัวแยก)
- [ ] ข้อมูลที่จอดรถ / ทางเข้า / เบอร์ผู้ประสานงาน

### ขึ้นจริง
- [x] Deploy GitHub Pages — https://kungtenpr.github.io/gk-wedding/ (repo `kungtenpr/gk-wedding`, public, Pages from `main` /)

## Deploy

GitHub account: **kungtenpr** (not Kungten). Commit identity is set locally in this repo
(`kungtenpr <297358441+kungtenpr@users.noreply.github.com>`).

```bash
gh auth switch --user kungtenpr   # if gh is on the other account
git push                          # Pages rebuilds automatically in ~1 min
```

## Music

Playlist in `CONFIG.music` (`script.js`): plays in order, then starts over (no `loop` on `<audio>`). A missing file is skipped.

1. `audio/bgm.mp3`: *A Thousand Years* — Christina Perri, from the owners' own file (`~/Downloads/Christina Perri - A Thousand Years .mp3`).
   Changes: trimmed 1.1 s → 268.7 s, loudness normalised, 1.5 s fade-in / 3 s fade-out, 96 kbps MP3 (~3.2 MB).
2. `audio/bgm-2.mp3`: *Perfect* — Ed Sheeran, from the owners' own file (`~/Downloads/Ed Sheeran - Perfect .mp3`, added 2026-11-17).
   Changes: trimmed 1.75 s → 274.5 s (drops the silent gap and hidden tail), −1.7 dB to match track 1 (~−19 LUFS), 1.5 s fade-in / 3 s fade-out, 96 kbps MP3 (~3.3 MB).

⚠️ Both are copyrighted songs, no licence — chosen knowingly (2026-11-16, 2026-11-17). If a takedown notice comes, delete the files and empty `CONFIG.music` (the music button hides itself) or swap in a free recording.
Free fallback already vetted: *Gymnopédie No.1* by Daria Baiocchi, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Satie_Gymnop%C3%A8die_n.1_DariaBaiocchi.wav), CC BY-SA 4.0 (needs a credit line in the footer).

## RSVP storage (production)

Decided 2026-11-16: **Google Sheets + Google Apps Script**, in the owner's own Google account.

```
Guest submits form (GitHub Pages)
   │  POST JSON { name, side, attend, guests, message, submittedAt }
   ▼
Apps Script Web App (doPost → appendRow)
   ▼
Google Sheet "GK Wedding RSVP"
   submittedAt | name | side | attend | guests | message
```

- GitHub Pages is static-only, so the Apps Script Web App is the receiver. Free, data stays in the owner's account.
- The site posts with `mode: 'no-cors'`, so it cannot read the response; a failed request still shows the thank-you message.
- Script: [`apps-script/Code.gs`](apps-script/Code.gs) (tested against a mocked Sheets API). Click-by-click setup in Thai: [`apps-script/README.md`](apps-script/README.md) → owner deploys, sends the `/exec` URL → put it in `CONFIG.rsvpEndpoint` in `script.js`.
- `setup()` also builds a สรุป tab (replies / guests per side). Email alerts: Sheets' own Tools → Notification settings, no extra script permission.
