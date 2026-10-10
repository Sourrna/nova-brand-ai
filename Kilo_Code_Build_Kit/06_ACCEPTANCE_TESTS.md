# Acceptance Tests and Definition of Done

## Projects
- [ ] ایجاد/ویرایش پروژه کار می‌کند و پس از refresh داده حفظ می‌شود.
- [ ] وضعیت، اولویت و nextAction قابل ویرایش‌اند.
- [ ] حذف پس از تأیید است.
- [ ] پروژه صرفاً با داشتن رکورد completed نمی‌شود.

## Memory/evidence
- [ ] هر رکورد state و visibility دارد.
- [ ] self-rating از verified proficiency جداست.
- [ ] تعارض بی‌صدا overwrite نمی‌شود.
- [ ] evidence به پروژه/مهارت متصل می‌شود.

## Import/export
- [ ] JSON شامل schemaVersion است.
- [ ] Markdown خواناست و secret ندارد.
- [ ] import قبل از اعمال validate می‌شود.
- [ ] import نامعتبر دادهٔ فعلی را خراب نمی‌کند.
- [ ] export → import round-trip داده‌های معادل می‌دهد.
- [ ] رکورد PRIVATE/SENSITIVE و تأییدنشده در public export نیست.

## Approval
- [ ] draft جدید approval=false دارد.
- [ ] PUBLIC بدون approval اجازهٔ انتشار نمی‌دهد.
- [ ] تغییر body یا platform approval را باطل می‌کند.
- [ ] هیچ publish action در MVP وجود ندارد.
- [ ] approval به draft دیگری سرایت نمی‌کند.

## Security/integrations
- [ ] جست‌وجوی secrets hardcoded انجام شده.
- [ ] `.env` track نمی‌شود.
- [ ] GitHub/LinkedIn بدون اتصال واقعی Connected نشان داده نمی‌شود.
- [ ] نبود LinkedIn API استفاده از MVP را مختل نمی‌کند.

## Quality
- [ ] build واقعی موفق است.
- [ ] typecheck، tests و lint موجود اجرا شده‌اند.
- [ ] صفحات اصلی responsive هستند.
- [ ] keyboard, focus, contrast و RTL در صورت کاربرد بررسی شده‌اند.

MVP فقط وقتی Done است که P0ها کامل، تست‌های حیاتی پاس، build/test واقعی اجرا و موارد باقی‌مانده مستند شده باشند.
