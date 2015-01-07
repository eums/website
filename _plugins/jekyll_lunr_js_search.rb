require 'json'
require 'nokogiri'

module Jekyll::LunrJsSearch
VERSION = "0.1.1"

class Indexer < Jekyll::Generator
  def initialize(config = {})
    super(config)

    lunr_config = {
      'excludes' => [],
      'strip_index_html' => false,
      'min_length' => 3,
      'stopwords' => 'stopwords.txt'
    }.merge!(config['lunr_search'] || {})

    @excludes = lunr_config['excludes']

    # if web host supports index.html as default doc, then optionally exclude
    # it from the url
    @strip_index_html = lunr_config['strip_index_html']

    @min_length = lunr_config['min_length']
    @stopwords_file = lunr_config['stopwords']
  end

  # Index all pages except pages matching any value in config['lunr_excludes']
  # or with date['exclude_from_search']
  # The main content from each page is extracted and saved to disk as json
  def generate(site)
    Jekyll.logger.info 'Running the search indexer...'

    # gather pages and posts
    items = pages_to_index(site)
    content_renderer = PageRenderer.new(site)
    index = []

    items.each do |item|
      entry = SearchEntry.create(item, content_renderer)

      entry.strip_index_suffix_from_url! if @strip_index_html
      if File.exists?(@stopwords_file)
        entry.strip_stopwords!(stopwords, @min_length)
      end

      index << {
        :title => entry.title,
        :url => entry.url,
        :date => entry.date,
        :categories => entry.categories,
        :body => entry.body
      }

      Jekyll.logger.debug('Indexed ' << "#{entry.title} (#{entry.url})")
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
  # load the stopwords file
  def stopwords
    @stopwords ||= IO.readlines(@stopwords_file).map { |l| l.strip }
  end

  def pages_to_index(site)
    # Deep copy pages & posts
    items = (site.pages + site.posts).map(&:dup)

    # only process files that will be converted to .html and only non excluded
    # files
    items.select {|i| i.output_ext == '.html' && !excluded?(i) }
  end

  def excluded?(item)
    @excludes.any? {|s| item.url =~ Regexp.new(s) } ||
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

  attr_reader :title, :url, :date, :categories, :body

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
end

class SearchIndexFile < Jekyll::StaticFile
  # Override write as the search.json index file has already been created
  def write(dest)
    true
  end
end

end
