class Post
  include ActiveModel::Model

  CONTENT_DIR = Rails.root.join("content", "posts")
  FRONT_MATTER = /\A---\s*\n(?<yaml>.*?)\n---\s*\n(?<body>.*)\z/m
  WORDS_PER_MINUTE = 220

  attr_accessor :slug, :title, :summary, :date, :tags, :cover_image, :status, :body

  class << self
    def all
      cache.fetch(cache_key) { load_all }
    end

    def published
      all.reject { |post| post.draft? && !Rails.env.development? }
    end

    def find_by_slug(slug)
      published.find { |post| post.slug == slug }
    end

    def tags
      published.flat_map(&:tags).tally.sort_by { |tag, count| [ -count, tag ] }.map(&:first)
    end

    private

    def cache
      @cache ||= ActiveSupport::Cache::MemoryStore.new
    end

    def cache_key
      return "posts" unless Rails.env.development?

      mtime = Dir.glob(CONTENT_DIR.join("*.md")).map { |path| File.mtime(path).to_i }.max
      "posts/#{mtime}"
    end

    def load_all
      Dir.glob(CONTENT_DIR.join("*.md")).filter_map { |path| parse(path) }
         .sort_by(&:date).reverse
    end

    def parse(path)
      raw = File.read(path)
      match = FRONT_MATTER.match(raw)

      unless match
        Rails.logger.warn("[Post] skipping #{File.basename(path)}: no front matter")
        return nil
      end

      meta = YAML.safe_load(match[:yaml], permitted_classes: [ Date, Time ]) || {}

      new(
        slug: meta["slug"].presence || File.basename(path, ".md").sub(/\A\d{4}-\d{2}-\d{2}-/, ""),
        title: meta["title"].to_s,
        summary: meta["summary"].to_s,
        date: meta["date"].to_date,
        tags: Array(meta["tags"]).map(&:to_s),
        cover_image: meta["cover_image"].presence,
        status: meta["status"].presence || "published",
        body: match[:body]
      )
    rescue StandardError => e
      Rails.logger.error("[Post] failed to parse #{File.basename(path)}: #{e.message}")
      nil
    end
  end

  def draft?
    status == "draft"
  end

  def url
    "/writing/#{slug}"
  end

  def date_label
    date.strftime("%d %b %Y").upcase
  end

  def reading_time
    minutes = (body.split(/\s+/).size / WORDS_PER_MINUTE.to_f).ceil
    "#{[ minutes, 1 ].max} min read"
  end

  def html
    @html ||= Kramdown::Document.new(
      body,
      input: "GFM",
      syntax_highlighter: "rouge",
      syntax_highlighter_opts: { line_numbers: false },
      hard_wrap: false
    ).to_html
  end

  def as_summary_json
    {
      slug: slug,
      title: title,
      summary: summary,
      date: date.iso8601,
      dateLabel: date_label,
      readingTime: reading_time,
      tags: tags,
      coverImage: cover_image,
      draft: draft?,
      url: url
    }
  end

  def as_detail_json
    as_summary_json.merge(html: html)
  end
end
