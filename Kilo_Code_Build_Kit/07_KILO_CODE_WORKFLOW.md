# Step-by-step — ساخت با Kilo Code

## 0. آماده‌سازی
1. VS Code را باز کن و افزونهٔ رسمی Kilo Code نصب کن: https://marketplace.visualstudio.com/items?itemName=kilocode.Kilo-Code
2. راهنمای رسمی: https://kilo.ai/docs
3. Provider/model را تنظیم کن و هزینه و privacy را بررسی کن؛ رایگان بودن را فرض نکن.
4. مخزن `Sourrna/nova-brand-ai` را در GitHub باز کن و وضعیت فعلی را ببین.
5. اگر محلی نیست، با GitHub Desktop یا git clone بگیر.
6. قبل از تغییر، working tree را بررسی و تغییرات مهم را commit/backup کن.
7. پوشهٔ Kilo_Code_Build_Kit را در ریشهٔ repo بگذار یا مسیرش را به Kilo بده.

## 1. Audit فقط‌خواندنی
1. repo را در VS Code باز کن.
2. Kilo sidebar را باز کن.
3. از Plan mode استفاده کن (نام دقیق mode ممکن است با نسخه فرق کند).
4. Prompt 1 را از `08_KILO_PROMPTS.md` بفرست.
5. خروجی باید stack، routes، storage، scripts، tests، privacy risks و gaps را با مسیر فایل مستند کند.
6. هیچ edit را تا بررسی گزارش تأیید نکن.

## 2. برنامه‌ریزی
هر requirement را `implemented / partial / missing / cannot_verify` علامت بزن. هر وضعیت باید شاهد فایل/تست داشته باشد. از Kilo بخواه فازها را با acceptance criteria بنویسد؛ بازنویسی کامل ممنوع مگر دلیل قوی.

## 3. پیاده‌سازی مرحله‌ای
1. اول privacy/approval gate، اگر واقعاً ناقص است.
2. بعد projects/evidence.
3. بعد memory import/export.
4. بعد dashboard و polish.
هر فاز: diff → tests → build/typecheck → بررسی خروجی؛ اگر تست شکست خورد، فاز بعد را شروع نکن.

## 4. استفاده از Kilo
- Plan/Architect: audit و طراحی بدون تغییر.
- Code: پیاده‌سازی محدود و مشخص.
- Review/Debug: بررسی diff و علت تست شکست‌خورده.
- دسترسی shell را فقط برای command قابل‌فهم تأیید کن.
- هیچ promptی به‌معنای اجازهٔ خودکار برای commit/push/deploy نیست.

## 5. پایان
build، typecheck، tests و lint موجود را اجرا کن؛ `git diff` و `git status` را ببین؛ secrets را جست‌وجو کن؛ commit کوچک بساز؛ push فقط پس از بررسی و تأیید خودت.

## 6. بعد از MVP
گزارش دوره‌ای، AI adapter، PWA/offline enhancements، GitHub integration و LinkedIn integration فقط بعد از تثبیت P0ها و بررسی هزینه/مجوز/امنیت.
