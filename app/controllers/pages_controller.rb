class PagesController < ApplicationController
  RECENT_POSTS = 3

  def home
    render inertia: "home", props: {
      posts: Post.published.first(RECENT_POSTS).map(&:as_summary_json)
    }
  end

  def projects
    render inertia: "projects"
  end

  def agents
    @posts = Post.published
    render layout: "plain"
  end
end
