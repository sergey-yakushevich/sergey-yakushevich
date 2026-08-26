class PostsController < ApplicationController
  def index
    render inertia: "posts/index", props: { posts: Post.published.map(&:as_summary_json) }
  end

  def show
    post = Post.find_by_slug(params[:slug])
    return redirect_to blog_path, status: :moved_permanently if post.nil?

    render inertia: "posts/show", props: { post: post.as_detail_json }
  end
end
