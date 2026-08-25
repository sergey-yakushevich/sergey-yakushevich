class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  inertia_share do
    { resume: Resume.as_json, avatarUrl: public_asset_path("images/avatar.jpg") }
  end

  private

  def public_asset_path(relative_path)
    return nil unless Rails.public_path.join(relative_path).exist?

    "/#{relative_path}"
  end
end
