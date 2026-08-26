require "test_helper"

class PagesTest < ActionDispatch::IntegrationTest
  test "every route responds" do
    [ root_path, "/projects", blog_path, "/agents" ].each do |path|
      get path
      assert_response :success, "#{path} did not respond with 200"
    end
  end

  test "home ships the resume in the Inertia payload" do
    get root_path
    props = inertia_props

    assert_equal "Sergey Yakushevich", props.dig("resume", "name")
    assert_equal 4, props.dig("resume", "work").size
    assert_includes props.dig("resume", "skillGroups").map { |g| g["label"] }, "Payments"
  end

  test "every skill group has a label and chips" do
    get root_path
    groups = inertia_props.dig("resume", "skillGroups")

    assert_predicate groups, :any?
    groups.each do |group|
      assert_predicate group["label"], :present?
      assert_predicate group["chips"], :any?
    end
  end

  test "every project is complete enough to render a card" do
    get root_path
    projects = inertia_props.dig("resume", "projects")

    assert_equal 3, projects.size
    projects.each do |project|
      assert_predicate project["techStack"], :any?
      assert_predicate project["description"], :present?
      assert_predicate project["category"], :present?
      assert_predicate project["stack"], :present?
      assert_match(%r{\A/images/projects/.+\.jpg\z}, project["image"])
      assert_match(%r{\Ahttps://}, project.dig("link", "href"))
    end
  end

  test "every project image is actually on disk" do
    get root_path

    inertia_props.dig("resume", "projects").each do |project|
      path = Rails.public_path.join(project["image"].delete_prefix("/"))
      assert_predicate path, :exist?, "missing #{project["image"]}"
    end
  end

  test "the agents page carries no JavaScript and no stylesheet" do
    get "/agents"

    assert_response :success
    assert_no_match(/<script/, response.body)
    assert_no_match(/stylesheet/, response.body)
    assert_no_match(/\*\*/, response.body)
  end

  test "the agents page lists every bullet, not the three shown on the home page" do
    get "/agents"

    moyasar = Resume.data[:work].find { |job| job[:company] == "Moyasar" }
    (moyasar[:description] + moyasar[:more]).each do |bullet|
      assert_includes response.body, ERB::Util.html_escape(bullet)
    end
  end

  test "the blog index reads oldest to newest" do
    get blog_path
    dates = inertia_props["posts"].map { |post| Date.parse(post["date"]) }

    assert_equal dates.sort, dates
  end

  test "every post has a cover image" do
    get blog_path

    inertia_props["posts"].each do |post|
      assert_predicate post["coverImage"], :present?, "#{post["slug"]} has no cover"
    end
  end

  test "every post cover image is actually on disk" do
    get blog_path

    inertia_props["posts"].each do |post|
      next if post["coverImage"].nil?

      path = Rails.public_path.join(post["coverImage"].delete_prefix("/"))
      assert_predicate path, :exist?, "missing #{post["coverImage"]}"
    end
  end

  test "an unknown post slug redirects to the index instead of erroring" do
    get "/blog/no-such-post"
    assert_redirected_to blog_path
  end

  test "the old writing paths redirect to blog" do
    get "/writing"
    assert_redirected_to "/blog"

    get "/writing/search-off-mysql"
    assert_redirected_to "/blog/search-off-mysql"
  end

  private

  def inertia_props
    page = response.body[/<script data-page="app" type="application\/json">(.*?)<\/script>/m, 1]
    JSON.parse(CGI.unescapeHTML(page))["props"]
  end
end
