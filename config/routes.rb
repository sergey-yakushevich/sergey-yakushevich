Rails.application.routes.draw do
  # Redirect to localhost from 127.0.0.1 to use same IP address with Vite server
  constraints(host: "127.0.0.1") do
    get "(*path)", to: redirect { |params, req| "#{req.protocol}localhost:#{req.port}/#{params[:path]}" }
  end

  root "pages#home"
  get "projects", to: "pages#projects"
  get "agents", to: "pages#agents"

  get "writing", to: "posts#index", as: :writing
  get "writing/:slug", to: "posts#show", as: :post, constraints: { slug: /[a-z0-9\-]+/ }

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check
end
