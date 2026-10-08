#!/usr/bin/env ruby
# Rebuild the inverse topic index from the imported article records.
require 'csv'
require 'yaml'
require 'json'
rows = CSV.read('_data/morais-ledger.csv', headers: true)
existing = CSV.read('_data/term_pids.csv', headers: true).map(&:to_h)
by_label = existing.to_h { |r| [r['label'], r] }
# Preserve the old birthday heading URL while repairing its truncated label.
by_label['70th Birthday'] ||= by_label['th Birthday']&.merge('label' => '70th Birthday', 'no_spaces' => '70thBirthday')
used_pids = existing.map { |r| r['pid'] }
next_term = existing.map { |r| r['term_no'].to_s[/\d+/].to_i }.max.to_i
inverse = Hash.new { |h, k| h[k] = [] }
rows.each do |r|
  r['index_terms'].to_s.split('|').map(&:strip).reject(&:empty?).uniq.each do |term|
    inverse[term] << r['pid'].delete_prefix('obj')
  end
end
terms = inverse.keys.sort_by(&:downcase).map do |label|
  term = by_label[label]&.dup
  unless term
    base = label.downcase.gsub(/[^a-z0-9]/, '')
    base = 'topic' if base.empty?
    pid = base
    suffix = 2
    while used_pids.include?(pid)
      pid = "#{base}#{suffix}"
      suffix += 1
    end
    used_pids << pid
    next_term += 1
    term = {'label' => label, 'term_no' => "term#{next_term}", 'no_spaces' => label.gsub(/\s+/, ''), 'pid' => pid}
  end
  term['pages'] = inverse[label].join('|') # Article IDs, not physical scan labels.
  term
end
headers = %w[label term_no pages no_spaces pid]
CSV.open('_data/term_pids.csv', 'w', write_headers: true, headers: headers) do |csv|
  terms.each { |t| csv << headers.map { |h| t[h] } }
end
terms.each_with_index do |term, i|
  path = File.join('_index-headings', "#{term.fetch('pid')}.md")
  body = File.exist?(path) ? File.read(path).split(/^---\s*$\n?/, 3)[2].to_s : ''
  data = term.merge('order' => format('%04d', i + 1), 'layout' => 'generic_index_term', 'collection' => 'index-headings')
  File.write(path, YAML.dump(data) + "---\n" + body)
end
search_path = 'search/index.json'
front, content = File.read(search_path).split(/^---\s*$\n?/, 3).drop(1)
docs = JSON.parse(content)
by_pid = rows.to_h { |r| [r['pid'], r] }
docs.each do |doc|
  row = by_pid.fetch(doc.fetch('pid'))
  doc.keys.each { |k| doc[k] = row[k] if row.headers.include?(k) }
end
File.write(search_path, "---\n#{front}---\n" + JSON.pretty_generate(docs) + "\n")
puts "Synchronized #{terms.length} topics, #{inverse.values.sum(&:length)} article/topic associations and #{docs.length} search records."
