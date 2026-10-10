# UX and Design System

## هویت
نام پنل: **Sourena Brand Control Center**. امضای ثانویه: **Powered by NOVA**. برند عمومی Sourena است؛ NOVA فقط سیستم داخلی است.

## Visual direction
حرفه‌ای، مینیمال، دقیق، premium؛ نه شلوغ و نه gamified.
- `#171717` سطح تیره
- `#2B2B2B` سطح ثانویه
- `#5B1E2D` accent بورگاندی
- سفید/خاکستری برای متن و hierarchy
رنگ‌ها به‌صورت design tokens؛ contrast باید بررسی شود.

## Navigation پیشنهادی
Overview; Projects; Skills & Evidence; Memory; Content Lab; Reports/Activity (اگر لازم است); Settings & Export. ساختار فعلی را بی‌دلیل بازنویسی نکن.

## تعامل
- next action و اولویت از KPI تزئینی مهم‌ترند.
- empty/loading/error/success states.
- عملیات حذف تأیید بگیرد.
- draft با `DRAFT — NOT PUBLISHED` مشخص باشد.
- Connected/Not connected/Error فقط بر اساس وضعیت واقعی.
- keyboard navigation و focus indicator حفظ شود.
- فارسی/RTL باید در صورت پشتیبانی زبان فارسی درست نمایش داده شود؛ ترجمهٔ کامل UI بدون تصمیم لازم نیست.

## Dashboard
Active projects, Next actions, Blocked items, Drafts awaiting review, Recent changes, Memory health. تمام اعداد از دادهٔ واقعی؛ در نبود داده empty state.

## Approval UX
نمایش متن دقیق و پلتفرم، claims و شواهد، privacy checklist، تأیید صریح، نسخهٔ تأییدشده؛ هر تغییر وضعیت را به review برگرداند. در MVP publish واقعی وجود نداشته باشد.
