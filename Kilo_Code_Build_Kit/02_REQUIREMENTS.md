# Functional and Non-functional Requirements

اولویت‌ها: P0 = ضروری برای MVP، P1 = بعد از P0، P2 = آینده.

## Functional
- **FR-01 Dashboard (P0):** پروژه‌های فعال، next actions، موارد مسدود، پیش‌نویس‌های نیازمند بازبینی و تغییرات اخیر. اعداد فقط از دادهٔ واقعی؛ empty/error/loading states لازم‌اند.
- **FR-02 Projects (P0):** شناسه، نام، توضیح، وضعیت، اولویت، هدف، nextAction، blockers، تاریخ‌ها، حریم خصوصی و شواهد. وضعیت‌ها: `idea`, `planned`, `active`, `blocked`, `paused`, `completed`, `archived`.
- **FR-03 Skills & Evidence (P0):** خوداظهاری از مهارت تأییدشده جدا باشد. هر ادعا به repo/commit/demo/test/document یا روش تأیید متصل شود.
- **FR-04 Memory (P0):** CRUD، منبع، وضعیت `VERIFIED | USER_PROVIDED | INFERRED | NEEDS_CONFIRMATION`، سطح دسترسی، export/import و گزارش تعارض؛ تعارض بی‌صدا overwrite نشود.
- **FR-05 Content drafts (P0):** پلتفرم، مخاطب، هدف، متن، ادعاها، وضعیت و نسخه. وضعیت‌ها: `idea`, `draft`, `review`, `approved`, `published`, `rejected`. MVP انتشار واقعی ندارد.
- **FR-06 Approval gate (P0):** visibility=PUBLIC رضایت محسوب نمی‌شود. approval پیش‌فرض false، مخصوص متن/نسخه/پلتفرم، و پس از هر تغییر محتوا باطل شود.
- **FR-07 Import/Export (P0):** JSON نسخه‌دار و Markdown خوانا؛ import ابتدا اعتبارسنجی شود؛ خطای import نباید دادهٔ موجود را خراب کند.
- **FR-08 Activity log (P1):** ثبت رخدادهای کاربردی بدون secrets یا دادهٔ حساس غیرضروری.
- **FR-09 AI adapter (P2):** هسته بدون AI کار کند؛ API key هرگز در frontend/Git/export نباشد؛ provider فقط با تصمیم روشن دربارهٔ هزینه و حریم خصوصی.

## Non-functional
- حفظ stack موجود مگر دلیل فنی قوی برای تغییر.
- TypeScript strict اگر سازگار با پروژهٔ موجود است.
- responsive، keyboard access، focus indicator و خطاهای قابل‌فهم.
- secretها در source/logها ممنوع؛ `.env` در `.gitignore`.
- import/export و approval تست رگرسیون داشته باشند.
- اتصال‌ها و وضعیت sync فقط در صورت تأیید واقعی نمایش داده شوند.
- MVP بدون LinkedIn/API پولی قابل استفاده بماند.

## Definition of Done
تمام P0ها، تست‌های پذیرش، build/typecheck و تست import/export واقعاً اجرا شده باشند؛ گزارش نهایی نتیجهٔ واقعی و موارد باقی‌مانده را مشخص کند.
