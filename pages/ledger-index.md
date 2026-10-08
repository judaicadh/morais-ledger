---
layout: page
title: Index
permalink: /ledger-index/
---

Select a term to see its articles, or a scrapbook page number to open the corresponding article. Several articles may share a scrapbook page.

{% for term in site.data.term_pids %}
<p>
<a href="{{ '/index-headings/' | append: term.pid | relative_url }}">{{ term.label | escape }}</a> can be found on scrapbook page(s)
{% assign values = term.pages | split: "|" %}
{% for val in values %}
  {% assign item_pid = "obj" | append: val %}
  {% assign item = site.morais-ledger | where: "pid", item_pid | first %}
  <a href="{{ item.url | relative_url }}" title="{{ item.label | escape }}">{{ item["pepper's pages"] }}</a>{% if forloop.last %}.{% else %}; {% endif %}
{% endfor %}
</p>
{% endfor %}
