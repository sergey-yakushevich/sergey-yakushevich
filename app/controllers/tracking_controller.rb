# frozen_string_literal: true

# Public, fire-and-forget beacon endpoint hit by the client tracking script
# (app/frontend/lib/track.ts). Does zero work inline beyond reading IP/UA —
# the payload is forwarded to the central trackhub API on a detached thread
# and the response returns immediately.
class TrackingController < ActionController::Base
  # Beacons can't send CSRF tokens, and there's nothing sensitive here.
  skip_forgery_protection
  # Don't nest JSON params under a wrapper key.
  wrap_parameters format: []

  def create
    token = params[:token].to_s
    return head(:no_content) if token.blank?

    TrackhubClient.forward(
      token: token,
      ip: client_ip,
      user_agent: request.user_agent,
      cf_country: request.headers["CF-IPCountry"].presence,
      client: client_context.compact,
      event: event_payload
    )

    head :no_content
  end

  private

  # Real visitor IP. Behind Cloudflare, request.remote_ip is a Cloudflare edge
  # address, so prefer the original-client headers Cloudflare sets.
  def client_ip
    request.headers["CF-Connecting-IP"].presence ||
      request.headers["True-Client-IP"].presence ||
      request.remote_ip
  end

  def client_context
    params.permit(
      :screen_w, :screen_h, :viewport_w, :viewport_h, :device_pixel_ratio,
      :language, :timezone, :referrer, :landing_path,
      :utm_source, :utm_medium, :utm_campaign, :utm_content, :utm_term,
      :device_fingerprint
    ).to_h.symbolize_keys
  end

  # One journey event, scalars only.
  def event_payload
    raw = params[:event]
    return nil if raw.blank?

    permitted = raw.permit(:id, :name, :label, :path, :occurred_at, :duration_ms).to_h.symbolize_keys
    return nil if permitted[:name].blank?

    meta = sanitized_meta(raw[:meta])
    permitted[:meta] = meta if meta.present?
    permitted
  end

  MAX_META_KEYS = 20
  SCALAR_META = [ String, Numeric, TrueClass, FalseClass ].freeze

  def sanitized_meta(meta)
    return nil unless meta.respond_to?(:each_pair)

    meta.each_pair.with_object({}) do |(key, value), acc|
      next if acc.size >= MAX_META_KEYS
      next unless SCALAR_META.any? { |type| value.is_a?(type) }

      acc[key.to_s] = value
    end
  end
end
