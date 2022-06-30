---
layout: page
title: Index
permalink: /ledger-index/
---
 
 Select the term to view a list of items associated with that term, or select a number to go directly to the page. 
 
 # this list should be sorted alphabetically
 
 {% for term in site.data.term_pids %}
  {% assign termlink = "../index-headings/" %}
 <p>
 <a href="{{ termlink | append: term.pid }}">{{ term.label }}</a> can be found on page(s) 
 {% assign values = term.pages | split: "|"  %}
 {% for val in values %}
 {% assign pagelink = "../morais-ledger/obj" %}
 <a href="{{ pagelink | append: val }}">{{ val }}</a>,  
 {% endfor %}
 {% endfor %}
</p>