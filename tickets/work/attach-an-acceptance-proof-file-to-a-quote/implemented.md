# Implemented — attach an acceptance proof file to a quote

Accepting a quote can now carry the file that shows the client said yes (built and checked by tests, not
yet tried on a live environment).

- When accepting a quote, a user can drop one PDF or image (JPG, PNG, WEBP, up to 5 MB) as the proof.
- Accepting without a file still works as before.
- The quote list shows an "Acceptance proof" link under an accepted quote that has one; it opens the file
  in a new tab.
- A proof can only be joined at the moment of the acceptance: never before, after, or on a refused or
  expired quote.
- Only a file uploaded from the back-office is taken as a proof; a link to another site is refused.
- Every new label and message exists in French, English and Malagasy.
