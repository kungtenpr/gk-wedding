# RSVP → Google Sheets (Apps Script)

`Code.gs` รับคำตอบจากฟอร์ม RSVP บนเว็บการ์ด แล้วเขียนลง Google Sheet ใน Google account ของเจ้าของงานเอง (ฟรี ไม่มี server)

```
แขกกดส่งฟอร์ม (GitHub Pages)
   │  POST JSON { name, side, attend, guests, message, submittedAt }
   ▼
Apps Script Web App  ── doPost() → appendRow()
   ▼
Google Sheet "GK Wedding RSVP"
   แท็บ RSVP : เวลาที่ส่ง | ชื่อ - นามสกุล | ฝ่าย | มาร่วมงาน | จำนวนคน | คำอวยพร
   แท็บ สรุป : ตอบรับ / จำนวนคนที่มา / ไม่สะดวก / ทั้งหมด แยกฝ่ายเจ้าสาว-เจ้าบ่าว
```

ตัว script ทำอะไรบ้าง
- แปลงค่าเป็นภาษาไทย (`bride` → เจ้าสาว, `yes` → มา)
- ถ้าตอบ "ไม่สะดวก" จำนวนคน = 0 · ถ้ามา จำกัด 1–10 คน
- ตัดข้อความยาวเกิน (ชื่อ 120 / คำอวยพร 1000 ตัวอักษร) และกันข้อความที่ขึ้นต้นด้วย `= + - @` ไม่ให้กลายเป็นสูตร
- ใช้ lock กันแขกสองคนกดส่งพร้อมกันแล้วแถวทับกัน
- เปิด URL ของ Web App ใน browser จะเห็น `{"ok":true,"service":"GK Wedding RSVP"}` ไว้เช็คว่าใช้งานได้

ขอ permission แค่ "ดู แก้ไข สร้าง ลบ spreadsheet ที่ script นี้ผูกอยู่" — ไม่มีการส่งอีเมลหรืออ่านไฟล์อื่น

---

## ขั้นตอนตั้งค่า (ครั้งเดียว ~10 นาที)

ทำบนคอม ใน Chrome profile ที่ login Google account ที่จะเก็บคำตอบ

### 1. สร้าง Google Sheet

1. เปิด https://sheets.new → ได้ spreadsheet ว่าง
2. คลิกชื่อ **"Untitled spreadsheet"** มุมซ้ายบน → พิมพ์ `GK Wedding RSVP` → Enter

### 2. เปิด Apps Script

```
┌──────────────────────────────────────────────────────────────┐
│ 📗 GK Wedding RSVP                                            │
│ File  Edit  View  Insert  Format  Data  Tools  [Extensions] … │  ← 🎯 แถบเมนูบนสุด
├──────────────────────────────────────────────────────────────┤
│      A        B        C        D                             │
│  1                                                            │
```

คลิก **Extensions** (แถบเมนูบนสุด ถัดจาก Tools) → **Apps Script**
→ เปิดแท็บใหม่เป็นหน้า editor

### 3. วางโค้ด

```
┌───────────────────────────────────────────────────────────────┐
│ Apps Script   Untitled project                [Deploy ▾]      │  ← ปุ่ม Deploy มุมขวาบน (สีน้ำเงิน)
├───────┬───────────────────────────────────────────────────────┤
│ <>    │ Files  +                                              │
│ ⏱     │  📄 Code.gs   ◀── ไฟล์ที่เปิดอยู่                     │
│ ⚙     │ ───────────────────────────────────────────────────── │
│       │ [💾] [↶] [↷]  [▶ Run]  [ setup ▾ ]  [Execution log]   │  ← แถบเครื่องมือเหนือโค้ด
│(แถบ   │                                                       │
│ซ้ายสุด)│  1  function myFunction() {                           │
│       │  2                                                    │
└───────┴───────────────────────────────────────────────────────┘
```

1. คลิก **"Untitled project"** มุมซ้ายบน → ตั้งชื่อ `GK Wedding RSVP` → Rename
2. ในช่องโค้ด กด `Cmd+A` แล้ว `Delete` ลบ `function myFunction()` ทิ้งให้หมด
3. เปิดไฟล์ `apps-script/Code.gs` ในโปรเจกต์นี้ → copy ทั้งไฟล์ → วางลงช่องโค้ด
4. กด `Cmd+S` (หรือไอคอน 💾 บนแถบเครื่องมือ)

### 4. ตั้งเขตเวลา

คลิกไอคอน **⚙ Project Settings** (แถบซ้ายสุด อันที่ 3 จากบน)
→ ช่อง **Time zone** 🎯 เลือก **(GMT+07:00) Bangkok**
→ กลับไปหน้าโค้ดด้วยไอคอน **<> Editor** (แถบซ้ายสุด อันบนสุด)

### 5. Run `setup` ครั้งแรก (สร้างแท็บ + ให้สิทธิ์)

1. บนแถบเครื่องมือเหนือโค้ด ดู dropdown ชื่อฟังก์ชัน (ข้างปุ่ม ▶ Run) 🎯 เลือก **setup**
2. คลิก **▶ Run**
3. ขึ้นกล่อง **Authorization required** → **Review permissions**
4. เลือก Google account ของคุณ
5. ขึ้นหน้า **"Google hasn't verified this app"** (ปกติ เพราะเป็น script ที่เราเขียนเอง)
   → คลิก **Advanced** (ตัวเล็กซ้ายล่าง) → **Go to GK Wedding RSVP (unsafe)**
6. หน้ารายการสิทธิ์ → **Allow** (หรือติ๊ก **Select all** ก่อน ถ้ามีช่องติ๊ก)
7. ด้านล่างขึ้น **Execution log** → `Execution completed` = สำเร็จ
8. กลับไปแท็บ Google Sheet → จะเห็นแท็บ **RSVP** (หัวตารางสีกรมท่า) และ **สรุป** ที่ด้านล่างจอ
   (แท็บ `Sheet1` เดิมลบทิ้งได้: คลิกขวาที่แท็บ → Delete)

### 6. Deploy เป็น Web App

1. กลับมาหน้า Apps Script → ปุ่ม **Deploy ▾** มุมขวาบน → **New deployment**
2. กล่องที่ขึ้นมา: ซ้ายบนข้างคำว่า *Select type* มีไอคอน **⚙** → คลิก → เลือก **Web app**
3. กรอกช่องทางขวา ตามลำดับบนลงล่าง
   - **Description**: `RSVP v1`
   - **Execute as**: 🎯 **Me (อีเมลของคุณ)**
   - **Who has access**: 🎯 **Anyone** ⚠️ ต้องเป็น *Anyone* เท่านั้น — ไม่ใช่ *Anyone with Google account* ไม่งั้นแขกส่งไม่ได้
4. คลิก **Deploy** (มุมขวาล่าง)
5. ขึ้นหน้า **Deployment successfully** → ช่อง **Web app — URL** ลงท้ายด้วย `/exec`
   → คลิก **Copy** แล้วส่ง URL นี้มาให้ Claude

### 7. (Claude ทำ) ใส่ URL ในเว็บ

ใส่ใน `CONFIG.rsvpEndpoint` ใน `script.js` → ทดสอบส่งจริง 1 ครั้ง → ลบแถวทดสอบใน Sheet → push

---

## ใช้งานหลังจากนั้น

- ดูคำตอบ: เปิด Google Sheet → แท็บ **RSVP** (เรียงตามเวลาที่ส่ง) / แท็บ **สรุป** (ยอดรวม)
- แจ้งเตือนเมื่อมีคำตอบใหม่ (ไม่ต้องแก้โค้ด): ใน Sheet → **Tools** → **Notification settings** → **Configure notifications** → *Any changes are made* + *Email – right away*

## ถ้าแก้ `Code.gs` ภายหลัง

การกด Save อย่างเดียว **ไม่** อัปเดตเว็บที่ deploy ไว้ ต้อง
**Deploy ▾** → **Manage deployments** → เลือกอันเดิม → ไอคอน ✏️ (Edit) → **Version**: *New version* → **Deploy**
URL เดิมใช้ต่อได้ ไม่ต้องแก้เว็บ (ถ้ากด *New deployment* จะได้ URL ใหม่ ต้องส่งมาใส่ใหม่)

## ถ้าส่งแล้วไม่ขึ้นใน Sheet

| อาการ | สาเหตุที่พบบ่อย |
|---|---|
| เปิด URL `/exec` แล้วขึ้นหน้า login Google | Who has access ไม่ใช่ **Anyone** → Manage deployments → Edit → แก้ |
| เปิด URL แล้วขึ้น `Script function not found: doGet` | ยังไม่ได้ Save ก่อน deploy หรือ deploy เวอร์ชันเก่า → Deploy new version |
| เวลาในแท็บ RSVP เพี้ยน 7 ชั่วโมง | ข้อ 4 Time zone ของ script / Sheet: **File → Settings → Time zone** = GMT+07:00 Bangkok |
| ดู error | Apps Script → ไอคอน ☰ **Executions** (แถบซ้าย) → แถว `doPost` ล่าสุด |

เว็บส่งแบบ `no-cors` จึงอ่านผลตอบกลับไม่ได้ — ฝั่งแขกจะเห็น "ขอบคุณ" เสมอ ต้องเช็คใน Sheet เอง
