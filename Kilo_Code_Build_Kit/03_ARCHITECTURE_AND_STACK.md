# Architecture and Stack Decision Record

## قانون اول: بررسی قبل از تصمیم
Kilo باید `package.json`, lockfile، routeها، `src/`, schemaها، storage، تست‌ها و اسکریپت‌های build را بررسی کند. مخزن شناخته‌شده `Sourrna/nova-brand-ai` است. از بازنویسی کامل خودداری شود.

## معماری منطقی
- **Presentation:** Overview, Projects, Skills & Evidence, Memory, Content Lab, Settings/Export.
- **Domain:** قوانین وضعیت، privacy labels، validation و approval gate.
- **Persistence adapter:** جدا از UI.
- **Import/Export adapters:** Markdown/JSON با schema version.
- **AI adapter اختیاری:** مستقل؛ بدون آن برنامه کار کند.
- **Integration adapters:** فقط برای اتصال واقعی و تأییدشده.

## انتخاب storage
اگر backend فعلی قابل‌اعتماد است، بدون دلیل آن را عوض نکن. اگر frontend-only و تک‌کاربره است، storage adapter و import/export نسخه‌دار بساز؛ IndexedDB برای دادهٔ ساختاریافتهٔ بیشتر از localStorage مناسب‌تر است. این فقط پیشنهاد مشروط است؛ تصمیم نهایی بعد از audit و ADR ثبت شود.

## Local-first در برابر cloud
Local-first هزینه و کنترل داده را بهتر می‌کند اما backup/sync را دشوارتر می‌کند. Cloud sync به auth، authorization، migration، قواعد امنیت و بررسی هزینه/حریم خصوصی نیاز دارد. دو منبع حقیقت بدون قواعد sync نساز.

## قواعد معماری
1. approval فقط در UI پیاده نشود؛ در domain/action logic enforce شود.
2. import ابتدا در staging validate شود و فقط پس از موفقیت اعمال شود.
3. destructive/overwrite operations تأیید لازم دارند.
4. وضعیت integration نباید حدسی باشد.
5. schema version و migration policy روشن باشد.
6. ADR کوتاه بنویس که stack واقعی، storage، trade-offs و علت حفظ/تغییر اجزا را توضیح دهد.

## Fallback در صورت شروع از صفر
TypeScript + React + Vite؛ حفظ UI/styling فعلی در اولویت؛ validation library فقط اگر واقعاً لازم است؛ تست‌ها با ابزار موجود. این پیشنهاد مجوز بازنویسی پروژهٔ موجود نیست.
