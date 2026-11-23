---
'portfolio-bo': minor
'portfolio-server': minor
'portfolio-web': minor
---

The field saying where an article, a page or a category is published is now `targets` (was `websites`), with the values `portfolio` and `agency` (was `box`). The offer details asked for Aldaron content are `offerIncludes`, `offerPrice` and `offerDurationDays` (were `boxIncludes`, `boxPrice`, `boxDurationDays`), and the public article read takes a `target` instead of a `website`.

Run `renameContentTargetFieldsJob` once right after deploying: it moves the existing rows to the new names, and the value `aldaron` stored on articles, pages, categories, projects and roles to `agency`. Until it has run, content kept for Aldaron alone is read as the portfolio's.
