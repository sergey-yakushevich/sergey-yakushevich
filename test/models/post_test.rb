require "test_helper"

class PostTest < ActiveSupport::TestCase
  test "posts load from markdown files and sort newest first" do
    posts = Post.published

    assert_predicate posts, :any?, "no posts loaded from content/posts"
    assert_equal posts.map(&:date).sort.reverse, posts.map(&:date)
  end

  test "front matter becomes attributes and the slug drops the date prefix" do
    post = Post.published.first

    assert_predicate post.title, :present?
    assert_predicate post.summary, :present?
    assert_no_match(/\A\d{4}-\d{2}-\d{2}-/, post.slug)
    assert_equal "/writing/#{post.slug}", post.url
  end

  test "the body renders to HTML with syntax highlighting classes" do
    post = Post.find_by_slug("search-off-mysql")

    assert_match(/<h2[^>]*>/, post.html)
    assert_match(/class="highlight"/, post.html)
    assert_match(/<span class="k">/, post.html)
  end

  test "reading time is never zero" do
    Post.published.each do |post|
      assert_match(/\A[1-9]\d* min read\z/, post.reading_time)
    end
  end

  test "drafts stay out of the published list outside development" do
    Dir.mktmpdir do |dir|
      File.write(File.join(dir, "2026-01-01-draft.md"), <<~MD)
        ---
        title: A draft
        summary: Not ready.
        date: 2026-01-01
        status: draft
        ---
        Body.
      MD

      with_content_dir(dir) do
        assert_equal [], Post.published.map(&:slug)
      end
    end
  end

  test "one malformed file does not take the whole blog down" do
    Dir.mktmpdir do |dir|
      File.write(File.join(dir, "broken.md"), "no front matter here")
      File.write(File.join(dir, "2026-01-02-good.md"), <<~MD)
        ---
        title: Fine
        summary: Loads.
        date: 2026-01-02
        ---
        Body.
      MD

      with_content_dir(dir) do
        assert_equal [ "good" ], Post.published.map(&:slug)
      end
    end
  end

  private

  def with_content_dir(dir)
    original = Post::CONTENT_DIR
    Post.send(:remove_const, :CONTENT_DIR)
    Post.const_set(:CONTENT_DIR, Pathname.new(dir))
    Post.instance_variable_set(:@cache, nil)
    yield
  ensure
    Post.send(:remove_const, :CONTENT_DIR)
    Post.const_set(:CONTENT_DIR, original)
    Post.instance_variable_set(:@cache, nil)
  end
end
