require 'json'
require 'nokogiri'

module Jekyll::LunrJsSearch
VERSION = '0.1.1'

class Indexer < Jekyll::Generator
  def initialize(config = {})
    super(config)

    @lunr_config = {
      'excludes' => [],
      'strip_index_html' => false,
    }.merge(config['lunr_search'] || {})
  end

  # Index all pages except pages matching any value in config['lunr_excludes']
  # or with date['exclude_from_search']
  # The main content from each page is extracted and saved to disk as json
  def generate(site)
    generate_with_config(site, @lunr_config)
  end

  def generate_with_config(site, config)
    Jekyll.logger.info 'Lunr:', 'building search index...'
    json = generate_search_index_json(site, config)

    site.static_files << SearchIndexFile.new(
                            json, site, site.dest, '/', index_filename)

    Jekyll.logger.info 'Lunr:', 'search index done.'
  end

  private
  def index_filename
    'search.json'
  end

  def generate_search_index_json(site, config)
    JSON.generate(generate_search_index(site, config))
  end

  def generate_search_index(site, config)
    entry_creator = SearchEntryCreator.new(
      ItemRenderer.new(site),
      config['strip_index_html'])

    excludes = Utils.as_array(config['excludes'])

    items_to_index(site, excludes).
      map { |item| entry_creator.create(item) }
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
      join(' ').
      gsub(/\s+/, ' ')
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
  attr_reader :renderer, :strip_index_html

  def initialize(renderer, strip_index_html)
    @renderer, @strip_index_html = renderer, strip_index_html
  end

  def create(item)
    {
      "title"       => get_title(item),
      "url"         => get_url(item),
      "body"        => get_body(item),
      "date"        => get_date(item),
      "categories"  => Utils.try(item, :categories),
    }
  end

  def get_title(item)
    item.to_liquid['title']
  end

  def get_url(item)
    l = item.to_liquid
    self.strip_index_html ?
      l['url'].gsub(/index\.html$/, '') : l['url']
  end

  def get_body(item)
    self.renderer.render(item)
  end

  def get_date(item)
    date = Utils.try(item, :date)
    if date
      {
        "displaydate" => date.strftime('%b %d, %Y'),
        "pubdate" => date.iso8601
      }
    end
  end
end

class SearchIndexFile < Jekyll::StaticFile
  def initialize(data, *args)
    @search_json_data = data
    super(*args)
  end

  def write(dest)
    dest_path = destination(dest)

    FileUtils.mkdir_p(File.dirname(dest_path))
    File.open(dest_path, 'w') { |f| f.write(@search_json_data) }

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
