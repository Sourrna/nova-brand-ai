# Data Model, Provenance, Privacy, and Consent

## Metadata مشترک
`id`, `createdAt`, `updatedAt`, `state`, `visibility`, `publicationApproved`, `source`, `notes`.
- state: `VERIFIED`, `USER_PROVIDED`, `INFERRED`, `NEEDS_CONFIRMATION`
- visibility: `PUBLIC`, `INTERNAL_STRATEGY`, `PRIVATE`, `SENSITIVE`
- publicationApproved پیش‌فرض `false`.

## Entityها
### Project
`id, name, summary, status, priority, goal, nextAction, blockers, timestamps, visibility, publicationApproved, claims[], evidence[], links[]`

### SkillClaim
`id, skill, selfRating?, proficiencyState, evidenceIds[], notes`. خودارزیابی و مهارت تأییدشده دو فیلد متفاوت باشند.

### Evidence
`id, type, title, urlOrPath, description, contribution, verificationMethod, createdAt, visibility, publicationApproved`.

### MemoryRecord
`id, domain, title, value, state, visibility, publicationApproved, source, updatedAt, notes`.

### ContentDraft
`id, platform, audience, objective, body, claims[], status, version, timestamps, approval`. approval باید نسخه، پلتفرم و محدودهٔ دقیق را ثبت کند.

## Approval policy — سخت و غیرقابل دور زدن
- PUBLIC بودن به معنی رضایت نیست.
- همه‌چیز با approval=false شروع شود.
- approval برای متن دقیق، نسخه و پلتفرم است؛ ویرایش متن یا تغییر پلتفرم آن را باطل می‌کند.
- public export به‌صورت deny-by-default باشد.
- PRIVATE/SENSITIVE هیچ‌گاه وارد public export نشود.
- اطلاعات پزشکی، رابطه‌ای، دارویی، مکان دقیق و سایر جزئیات شخصی نامرتبط نباید وارد خروجی برند حرفه‌ای شوند.
- اطلاعات مشتری، نقش در پروژه، درآمد، کاربران و نتیجهٔ تجاری بدون شواهد و مجوز دقیق منتشر نشود.
- MVP دکمهٔ انتشار واقعی نداشته باشد.

## Security
- API keys, tokens, passwords, cookies, private keys ممنوع در Markdown/JSON/Git.
- `.env` در `.gitignore`; `.env.example` فقط با placeholder.
- در صورت وجود backend، authorization باید سمت سرور باشد؛ مخفی‌کردن دکمه امنیت نیست.
- import با schema validation و محدودیت نوع/حجم انجام شود.
