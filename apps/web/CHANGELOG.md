# portfolio-web

## 0.1.0

### Minor Changes

- d593101: Articles, pages and categories can now be assigned to the websites they are written for: Portfolio, Box, or both. A Box-only content is meant for the Aldaron website. When Box is picked, the form asks what the box includes (static website, mobile, back-office, web application), and optionally its price in euros and its duration in days.

  The public article read accepts an optional website: the portfolio keeps the articles saved before the field existed, the box keeps only the ones that name it.

  The portfolio website only shows the articles, pages and categories written for the portfolio (the ones saved before the field existed included), in the blog, the pages, the categories, the sitemap and the search.

- ce0d381: The field saying where an article, a page or a category is published is now `targets` (was `websites`), with the values `portfolio` and `agency` (was `box`). The offer details asked for Aldaron content are `offerIncludes`, `offerPrice` and `offerDurationDays` (were `boxIncludes`, `boxPrice`, `boxDurationDays`), and the public article read takes a `target` instead of a `website`.

  Run `renameContentTargetFieldsJob` once right after deploying: it moves the existing rows to the new names, and the value `aldaron` stored on articles, pages, categories, projects and roles to `agency`. Until it has run, content kept for Aldaron alone is read as the portfolio's.

- ae7316f: A project now belongs to one website: the portfolio (the default) or Aldaron, never both. The project form has a "Published on" select in its settings, saved in the new `target` field.

  The public project read accepts an optional `target`. The portfolio website only shows the projects published on the portfolio (the ones saved before the field existed included), in the list, the project page, the sitemap and the search.

- 205f7ea: The contact form of the website has an optional phone number field, saved with the message and shown in the back-office, and the home projects title now reads "Mes dernières réalisations".
- 94d8c9c: The "Why me?" section of the home page follows the new design (new icons, shorter texts), and a malformed email now gets an "invalid email" message instead of "required" in the website and back-office forms.
- f5ad5a3: A page or an article can show a clickable table of contents of its section titles on the website, turned on with a new "Sommaire" switch in the settings of its back-office form, and the content editor of the back-office now lists the titles of the text next to it.
