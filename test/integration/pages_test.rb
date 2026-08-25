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

  test "the payments group is the only one carrying the signal marker" do
    get root_path
    groups = inertia_props.dig("resume", "skillGroups")

    signalled = groups.select { |group| group["signal"] }
    assert_equal [ "Payments" ], signalled.map { |group| group["label"] }
  end

  test "projects carry a tech stack and no prose description" do
    get root_path
    projects = inertia_props.dig("resume", "projects")

    assert_predicate projects, :any?
    projects.each do |project|
      assert_predicate project["techStack"], :any?
      assert_nil project["description"]
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
