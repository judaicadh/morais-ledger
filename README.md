# The Sabato Morais Ledger
Learn about Sabato Morais' personal scrapbook of newspaper clippings, pamphlets, circulars, and typescripts that he collected during his lifetime (1823-1897).

## About the Project (completed May 2017)
The Sabato Morais Ledger, as it is now known, belonged to the leading representative of enlightened Orthodox Judaism in 19th century America. Morais was born in Livorno, in the Italian duchy of Tuscany in 1823. He was the descendant of Portuguese Conversos who returned to Judaism during the seventeenth century. Morais was a proud advocate of the Sephardic heritage as a model for creating what he called "a regenerated Judaism" on the "virgin soil" of America. Morais possessed a vivid historical imagination and a devout appreciation of the need to preserve Judaism. He relentlessly stressed the need to observe historical practices and taught the Jewish doctrines transmitted to him as a child and as a rabbinical student in Livorno. He also grew up during a period of revolutionary change. Both his father and grandfather were freemasons and actively involved in the Risorgimento, the movement to bring national unity and independence to the Italian peninsula. Morais received a traditional Sephardic religious education in Livorno but was also exposed from childhood to radical republican activism. After leaving Livorno for London in 1846 to seek employment at an Orphan School attached to the Spanish and Portuguese Congregation at Bevis Marks, Morais was befriended by many of the Italian emigre intellectuals, including Giuseppe Mazzini, perhaps the leading voice of the Italian cause. Morais, thus, brought to Philadelphia from Europe a distinct set of ideas about religion and politics. He devoted the remaining four decades of his life, beginning in 1851, espousing and defending his version of enlightened rabbinic Judaism. The scrapbook he kept is a unique record of the path he charted, the time through which he lived, and the highly charged controversies in which he became embroiled.

The national significance of this unique treasure is clearly evident, both in terms of its scope and content. Its 831 items of newspaper clippings, pamphlets, circulars and typescripts cover almost every major public event, political debate and theological controversy of that era. These items also reveal in a hitherto unknown way the fundamental role Morais played as founder of the Jewish Theological Seminary. In short, the Scrapbook alters the familiar picture of 19th century American Jewry as "German" and Reform in its orientation. It shows how Morais disseminated his traditional Sephardic religious worldview to a national audience through the medium of both the Jewish and especially the non-Jewish press. It contains rarely consulted or otherwise unknown primary sources that in turn bring into focus the religious humanist sources drawn upon by this Italian-born American Jewish leader.

### Partners
- Marvin Weiner (C'38)
- Herbert Weiner
- Sheila Weiner
- Jesselson Family Foundation
- Kaplan Family Foundation
- The National Foundation for Jewish Culture
- Leslie Delauter
- Gina Glasman
- Michael Overgaard
- Arthur Kiron
- Emily Esten
- Laura Newman Eckstein

# This is a Judaica Digital Humanities at the Penn Libraries repository.
Judaica Digital Humanities at the <a href="http://library.upenn.edu">Penn Libraries</a> (also referred to as Judaica DH) is a robust program of projects and tools for experimental digital scholarship with Judaica collections, informed by digital humanities, Jewish studies, and cultural heritage approaches. Visit our [website](https://judaicadh.library.upenn.edu/).

## Updating image data

Item pages are checked in under `_morais-ledger`; changing the CSV alone does not
update their front matter. To import a revised CSV and refresh those pages, download
the current [Penn Libraries manifest](https://digitalrepository.library.upenn.edu/iiif/2/items/dc71c7fc-63d6-40e0-908e-ba8930064eba/manifest), then run:

```sh
ruby scripts/update-ledger-images.rb '/path/to/Morais Ledger - morais-ledger.csv' '/path/to/manifest.json'
```

The importer matches the CSV's `pepper's pages` against manifest canvas labels,
using `pepper's links` only when page labels are absent. It generates IIIF Image API 2 URLs supported by the bundled
OpenSeadragon viewer. Multiple image services are separated by `|` in
`manifest_indiv`. Entries without an explicit mapping link to the complete scrapbook;
the `toc` value is an item number and must not be used as a scan number.

### Keeping topics aligned

The image importer also runs `scripts/sync-ledger-index.rb`. The article CSV's
pipe-separated `index_terms` are the source for the inverse topic table, topic
headings and search records. `_data/term_pids.csv` stores article ID suffixes in
its historical `pages` field; the Index page resolves those articles and shows
their actual `pepper's pages` labels. Topic results use exact terms.

Validate the imported records, inverse index, headings, search and image mappings:

```sh
ruby scripts/validate-ledger-index.rb MANIFEST.json
```
