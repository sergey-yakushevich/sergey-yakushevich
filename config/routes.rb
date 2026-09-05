Rails.application.routes.draw do
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end

  root "pages#home"

  # Visitor tracking beacon (forwarded to the central trackhub API).
  post "track", to: "tracking#create"
  get "projects", to: "pages#projects"
  get "agents", to: "pages#agents"
  get "partners/trades", to: "pages#trades_partners"
  get "test-partners", to: redirect("/partners/trades", status: 301)
  get "test-partners/:niche", to: redirect("/partners/trades", status: 301),
      constraints: { niche: /adhd|marketplace-sellers|finance|job-search|no-fap/ }

  get "blog", to: "posts#index", as: :blog
  get "blog/:slug", to: "posts#show", as: :post, constraints: { slug: /[a-z0-9\-]+/ }

  get "writing", to: redirect("/blog", status: 301)
  get "writing/:slug", to: redirect("/blog/%{slug}", status: 301), constraints: { slug: /[a-z0-9\-]+/ }

  get "up" => "rails/health#show", as: :rails_health_check
end
