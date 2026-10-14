# The Sabato Morais Ledger

Open index.html or serve this folder with a static web server. No installation is required.

The site contains all 831 original item descriptions, transcribed from 464 archived SCETI bibliographic pages. Each item retains its archived source URL, original wording, and original bibliographic fields alongside display corrections. Whitespace is normalized. The reader includes original subtitles, descriptions, annotations, references, and bibliography where present.

The original archived A–Z index supplies 1,120 headings and 2,672 item references. All 831 item-to-scan mappings have been checked against the original image filenames and Penn Libraries’ current 624-canvas IIIF manifest. The later website’s subject assignments are not used.

Display corrections repair documented diacritics, unambiguous possessive apostrophes, and seven stray ampersand semicolons. Corrections are logged in corrections.csv. Original wording remains in data.json; original-text disclosures are omitted from the interface as requested.

Scans are served by Penn Libraries. GitHub Pages publishes this folder at https://judaicadh.github.io/morais-ledger/.

## Publishing

GitHub Pages uses the `main` branch and `/docs` folder. Changes pushed to this folder publish automatically. No build step or dependencies are required; `.nojekyll` serves these static files directly. The repository root retains the preceding site source for reference.
