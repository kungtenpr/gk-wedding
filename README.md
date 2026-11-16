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
7. Venue — QR from the card (`q.me-qr.com/xzmaoeii`), Google Maps embed
8. Gallery + lightbox (`CONFIG.photos` in `script.js`)
9. RSVP form
10. Wedding gift (PromptPay — placeholder)
11. Thank you / #GKWEDDING

## Files

- `index.html`, `style.css`, `script.js`
- `images/photo-01..12.jpg` — random picks from `~/Pictures/Export/wedding-gift-kungten`, resized to 1600px (placeholders until final selection)
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
- [x] เพลงพื้นหลัง A Thousand Years ที่ 25% (`audio/bgm.mp3`)
- [x] วิธีเก็บ RSVP: Google Sheets + Apps Script — ตัดสินใจแล้ว
- [x] Responsive มือถือ + คอม

### รอข้อมูล ⏳
- [ ] **รูปที่คัดแล้ว**: รูปหน้าแรก (แนวตั้ง) · รูปคั่นเต็มจอ (แนวตั้ง) · gallery 8–12 รูป — ตอนนี้เป็นรูปสุ่ม
- [ ] **ชื่อภาษาอังกฤษบ่าวสาว** — ตอนนี้ `Worawee & Pawornrut` (เดา)
- [ ] **ของขวัญ**: QR PromptPay + ชื่อบัญชี + เลขพร้อมเพย์/เลขบัญชี
- [ ] **วันปิดรับ RSVP** — ตอนนี้ 20 ก.พ. 2570 (ชั่วคราว)
- [ ] **RSVP endpoint**: Claude เขียน Apps Script ให้ → เจ้าของ deploy → ใส่ URL ใน `CONFIG.rsvpEndpoint`

### ไม่บังคับ
- [ ] รูปเดี่ยวเจ้าบ่าว / เจ้าสาว (section แนะนำตัวแยก)
- [ ] ข้อมูลที่จอดรถ / ทางเข้า / เบอร์ผู้ประสานงาน
- [ ] รูปพรีวิวตอนแชร์ลิงก์ใน LINE (ตอนนี้ใช้ `photo-04.jpg`)

### ขึ้นจริง
- [ ] Deploy GitHub Pages

## Music

`audio/bgm.mp3`: *A Thousand Years* — Christina Perri, from the owners' own file (`~/Downloads/Christina Perri - A Thousand Years .mp3`).
Changes: trimmed 1.1 s → 268.7 s, loudness normalised, 1.5 s fade-in / 3 s fade-out, 96 kbps MP3 (~3.2 MB).

⚠️ Copyrighted song, no licence — chosen knowingly (2026-11-16). If a takedown notice comes, delete `audio/bgm.mp3` (the music button hides itself) or swap in a free recording.
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
- Setup (one time): create the Sheet → Extensions → Apps Script → paste script → Deploy as Web App (execute as me, access: anyone) → put the URL in `CONFIG.rsvpEndpoint` in `script.js`.
- Optional: email notification on each new reply; summary formulas (guests per side, total attending).
