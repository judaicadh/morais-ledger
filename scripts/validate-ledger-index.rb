#!/usr/bin/env ruby
require 'csv'
require 'yaml'
require 'json'
rows = CSV.read('_data/morais-ledger.csv', headers: true)
abort 'Expected 831 distinct articles' unless rows.length == 831 && rows.map { |r| r['pid'] }.uniq.length == 831
expected = Hash.new { |h, k| h[k] = [] }
rows.each do |row|
  data = YAML.safe_load(File.read("_morais-ledger/#{row['pid']}.md").split(/^---\s*$\n?/, 3)[1])
  row.each { |k, v| abort "Article mismatch #{row['pid']}: #{k}" unless data[k] == v }
  terms = row['index_terms'].to_s.split('|').map(&:strip).reject(&:empty?).uniq
  abort "Missing topics #{row['pid']}" if terms.empty?
  terms.each { |t| expected[t] << row['pid'].delete_prefix('obj') }
end
actual = {}
CSV.read('_data/term_pids.csv', headers: true).each do |term|
  abort "Duplicate topic #{term['label']}" if actual.key?(term['label'])
  actual[term['label']] = term['pages'].split('|')
  heading = YAML.safe_load(File.read("_index-headings/#{term['pid']}.md").split(/^---\s*$\n?/, 3)[1])
  term.each { |k, v| abort "Heading mismatch #{term['pid']}: #{k}" unless heading[k] == v }
end
abort 'Inverse index differs from article topics' unless actual == expected
search = JSON.parse(File.read('search/index.json').split(/^---\s*$\n?/, 3)[2])
by_pid = rows.to_h { |r| [r['pid'], r] }
abort 'Search article IDs differ' unless search.map { |r| r['pid'] }.sort == by_pid.keys.sort
search.each { |d| %w[label index_terms].each { |k| abort "Search mismatch #{d['pid']}: #{k}" unless d[k] == by_pid[d['pid']][k] } }
if ARGV[0]
  manifest = JSON.parse(File.read(ARGV[0]))
  services = manifest['sequences'][0]['canvases'].to_h { |c| [c['label'], c['images'][0]['resource']['service']['@id']] }
  rows.each do |r|
    expected_services = r["pepper's pages"].split(/[,，]/).map { |p| services.fetch(p.strip) }
    abort "Manifest mismatch #{r['pid']}" unless r['manifest_indiv'].split('|') == expected_services
    link_services = r["pepper's links"].split(',').map { |v| v.strip.sub('/iiif/3/', '/iiif/2/').sub('/info.json', '') }
    abort "Page link mismatch #{r['pid']}" unless link_services == expected_services
  end
end
puts "PASS: #{rows.length} articles, #{actual.length} topic headings, #{expected.values.sum(&:length)} exact associations, search records and manifest links."
