#!/usr/bin/env ruby
# Usage: ruby scripts/update-ledger-images.rb SOURCE.csv MANIFEST.json
# The manifest is Penn Libraries' current IIIF presentation manifest.
require 'csv'
require 'json'
require 'yaml'

source, manifest_path = ARGV
abort 'Usage: ruby scripts/update-ledger-images.rb SOURCE.csv MANIFEST.json' unless source && manifest_path
manifest = JSON.parse(File.read(manifest_path))
canvases = manifest.fetch('sequences').first.fetch('canvases')
services = canvases.to_h do |canvas|
  [canvas.fetch('label'), canvas.fetch('images').first.fetch('resource').fetch('service').fetch('@id')]
end
known_services = services.values
rows = CSV.read(source, headers: true)
abort 'Expected unique item IDs' unless rows.map { |r| r['pid'] }.uniq.length == rows.length
mapped = 0
rows.each do |row|
  # Use explicit page labels only; toc is an item number, not a scan number.
  pages = row["pepper's pages"].to_s.split(/[,，]/).map(&:strip).reject(&:empty?)
  links = row["pepper's links"].to_s.split(',').map(&:strip).reject(&:empty?).map do |url|
    url.sub(%r{/info\.json\z}, '').sub('/iiif/3/', '/iiif/2/')
  end
  page_services = pages.map { |label| services.fetch(label) }
  links = page_services unless page_services.empty?
  abort "Unrecognized service for #{row['pid']}" unless (links - known_services).empty?
  mapped += 1 unless links.empty?
  first = links.first.to_s
  row['manifest_all'] = manifest.fetch('@id')
  row['manifest_indiv'] = links.join('|')
  row['thumb'] = first.empty? ? nil : "#{first}/full/!200,200/0/default.jpg"
  row['full'] = first.empty? ? nil : "#{first}/full/3500,/0/default.jpg"

  path = File.join('_morais-ledger', "#{row['pid']}.md")
  text = File.read(path)
  _, front, body = text.split(/^---\s*$\n?/, 3)
  data = YAML.safe_load(front)
  row.to_h.each { |key, value| data[key] = value unless key == '@' }
  File.write(path, YAML.dump(data).gsub(/[ \t]+$/, '') + "---\n" + body.to_s)
end
headers = rows.headers.reject { |header| header == '@' }
CSV.open('_data/morais-ledger.csv', 'w', write_headers: true, headers: headers) do |csv|
  rows.each { |row| csv << headers.map { |header| row[header] } }
end
puts "Updated #{rows.length} records: #{mapped} with mapped scans, #{rows.length - mapped} without a supplied page mapping."

# Keep the inverse index and search records synchronized with every import.
require 'rbconfig'
abort 'Topic index synchronization failed' unless system(RbConfig.ruby, File.join(__dir__, 'sync-ledger-index.rb'))
