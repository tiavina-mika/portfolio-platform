---
'portfolio-bo': minor
'portfolio-server': minor
'portfolio-web': minor
---

A project now belongs to one website: the portfolio (the default) or Aldaron, never both. The project form has a "Published on" select in its settings, saved in the new `target` field.

The public project read accepts an optional `target`. The portfolio website only shows the projects published on the portfolio (the ones saved before the field existed included), in the list, the project page, the sitemap and the search.
