require 'json'
require 'nokogiri'

module Jekyll::LunrJsSearch
VERSION = "0.1.1"

class Indexer < Jekyll::Generator
  def initialize(config = {})
    super(config)

    @lunr_config = {
      'excludes' => [],
      'strip_index_html' => false,
      'min_length' => 3,
      'stopwords' => 'stopwords.txt'
    }.merge(config['lunr_search'] || {})
  end

  # Index all pages except pages matching any value in config['lunr_excludes']
  # or with date['exclude_from_search']
  # The main content from each page is extracted and saved to disk as json
  def generate(site)
    generate_with_config(site, @lunr_config)
  end

  def generate_with_config(site, config)
    Jekyll.logger.info 'Running the search indexer...'

    items = items_to_index(site, config['excludes'])
    renderer = PageRenderer.new(site)
    stopwords = get_stopwords(config['stopwords_file'])

    index = items.map do |item|
      entry = SearchEntry.create(item, renderer)

      entry.strip_index_suffix_from_url! if config['strip_index_html']
      entry.strip_stopwords!(stopwords, config['min_length'])

      entry.to_hash
    end

    json = JSON.generate({:entries => index})

    # Create destination directory if it doesn't exist yet. Otherwise, we
    # cannot write our file there.
    Dir::mkdir(site.dest) unless File.directory?(site.dest)

    # File I/O: create search.json file and write out pretty-printed JSON
    filename = 'search.json'

    File.open(File.join(site.dest, filename), "w") do |file|
      file.write(json)
    end

    # Keep the search.json file from being cleaned by Jekyll
    site.static_files << SearchIndexFile.new(site, site.dest, "/", filename)
  end

  private
  def get_stopwords(file)
    if file && File.exists?(file)
      IO.readlines(file).map(&:strip)
    else
      []
    end
  end

  def items_to_index(site, excludes)
    (site.pages + site.posts).
      map(&:dup).
      select {|i| i.output_ext == '.html' && !excluded?(i, excludes) }
  end

  def excluded?(item, excludes)
    excludes.any? {|e| item.url =~ Regexp.new(e) } ||
      item.data['exclude_from_search']
  end
end

class PageRenderer
  def initialize(site)
    @site = site
  end

  # render the item, parse the output and get all text
  def render(item_in)
    item = remove_layout(item_in)
    item.render({}, @site.site_payload)

    Nokogiri::HTML(item.output).
      search('//text()').
      map {|t| t.content }.
      join(" ").
      gsub(/\s+/, " ")
  end

  private
  def remove_layout(item)
    i = item.dup
    i.data = i.data.dup
    i.data['layout'] = nil
    i
  end
end

class SearchEntry
  def self.create(item, renderer)
    title, url = extract_title_and_url(item)
    body       = renderer.render(item)
    date       = item.respond_to?(:date) ? item.date : nil
    categories = item.respond_to?(:categories) ? item.categories : nil

    new(title, url, date, categories, body)
  end

  def self.extract_title_and_url(item)
    data = item.to_liquid
    [ data['title'], data['url'] ]
  end

  FIELDS = %i(title url date categories body)
  attr_reader(*FIELDS)

  def initialize(title, url, date, categories, body)
    @title, @url, @date, @categories, @body = title, url, date, categories, body
  end

  def strip_index_suffix_from_url!
    @url.gsub!(/index\.html$/, '')
  end

  # remove anything that is in the stop words list from the text to be indexed
  def strip_stopwords!(stopwords, min_length)
    @body = @body.split.delete_if { |x|
      t = x.downcase.gsub(/[^a-z]/, '')
      t.length < min_length || stopwords.include?(t)
    }.join(' ')
  end

  def to_hash
    Hash[FIELDS.map {|f| [f, public_send(f)] }]
  end
end

class SearchIndexFile < Jekyll::StaticFile
  # Override write as the search.json index file has already been created
  def write(dest)
    true
  end
end

end
