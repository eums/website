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
    json = generate_search_index_json(site, config)

    Dir.mkdir(site.dest) unless File.directory?(site.dest)
    File.open(File.join(site.dest, index_filename), "w") do |file|
      file.write(json)
    end

    # Keep the search.json file from being cleaned by Jekyll
    site.static_files <<
      SearchIndexFile.new(site, site.dest, "/", index_filename)

    Jekyll.logger.info 'Search indexer complete.'
  end

  private
  def index_filename
    'search.json'
  end

  def generate_search_index_json(site, config)
    index = generate_search_index(site, config)
    JSON.generate({:entries => index})
  end

  def generate_search_index(site, config)
    entry_creator = SearchEntryCreator.new(
      ItemRenderer.new(site),
      get_stopwords(config['stopwords_file']),
      config['strip_index_html'],
      config['min_length'])

    excludes = Utils.as_array(config['excludes'])

    items_to_index(site, excludes).
      map { |item| entry_creator.create(item) }
  end

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

class ItemRenderer
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

class SearchEntryCreator
  attr_reader :renderer, :stopwords, :strip_index_html, :min_length

  def initialize(renderer, stopwords, strip_index_html, min_length)
    @renderer, @stopwords, @strip_index_html, @min_length =
      renderer, stopwords, strip_index_html, min_length
  end

  def create(item)
    {
      :title       => get_title(item),
      :url         => get_url(item),
      :body        => get_body(item),
      :date        => Utils.try(item, :date),
      :categories  => Utils.try(item, :categories),
    }
  end

  def get_title(item)
    item.to_liquid['title']
  end

  def get_url(item)
    l = item.to_liquid
    self.strip_index_html ?
      l['url'] : l['url'].gsub(/index\.html$/, '')
  end

  def get_body(item)
    self.renderer.render(item).
      split.reject { |x|
        word = x.downcase.gsub(/[^a-z]/, '')
        word.length < self.min_length || self.stopwords.include?(word)
      }.join(' ')
  end

  private
end

class SearchIndexFile < Jekyll::StaticFile
  # Override write as the search.json index file has already been created
  def write(dest)
    true
  end
end

module Utils
  extend self

  def try(obj, meth)
    obj.public_send(meth) if obj.respond_to?(meth)
  end

  def as_array(obj)
    obj.is_a?(Array) ? obj : [obj]
  end
end

end