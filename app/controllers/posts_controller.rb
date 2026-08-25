class PostsController < ApplicationController
  def index
    posts = Post.published

    render inertia: "posts/index", props: {
      posts: posts.map(&:as_summary_json),
      tags: Post.tags
    }
  end

  def show
    post = Post.find_by_slug(params[:slug])
    return redirect_to writing_path, status: :moved_permanently if post.nil?

    render inertia: "posts/show", props: { post: post.as_detail_json }
  end
end
