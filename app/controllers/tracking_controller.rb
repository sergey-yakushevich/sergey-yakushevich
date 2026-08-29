# frozen_string_literal: true

# Public, fire-and-forget beacon endpoint hit by the shared trackhub tracker
# (loaded by app/frontend/lib/track.ts). Does zero work inline beyond reading
# IP/UA — the payload is forwarded to the central trackhub API on a detached
# thread and the response returns immediately.
#
# Note what this deliberately does NOT do: name the fields it forwards. It used
# to permit an explicit list, and when the tracker gained a field the list did
# not, so the data was dropped here in silence. Everything scalar goes through;
# trackhub validates, clips and clamps it on arrival.
class TrackingController < ActionController::Base
  # Beacons can't send CSRF tokens, and there's nothing sensitive here.
  skip_forgery_protection
  # Don't nest JSON params under a wrapper key.
  wrap_parameters format: []

  MAX_KEYS = 40
  SCALAR = [ String, Numeric, TrueClass, FalseClass ].freeze

  # Only needed for callers that flatten the client context into the body
  # instead of nesting it under "client". The shared tracker nests it.
  LEGACY_CLIENT_FIELDS = %w[
    screen_w screen_h viewport_w viewport_h device_pixel_ratio
    language timezone referrer landing_path
    utm_source utm_medium utm_campaign utm_content utm_term
    device_fingerprint
  ].freeze

  def create
    token = params[:token].to_s
    return head(:no_content) if token.blank?

    TrackhubClient.forward(
      token: token,
      ip: client_ip,
      user_agent: request.user_agent,
      cf_country: request.headers["CF-IPCountry"].presence,
      client: client_context,
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
    nested = params[:client]
    return scalars(nested) if nested.present?

    scalars(params).slice(*LEGACY_CLIENT_FIELDS)
  end

  # One journey event: every scalar the tracker sent, plus sanitized meta.
  # The heartbeat's engagement counters ride through here without being named.
  def event_payload
    raw = params[:event]
    return nil if raw.blank?

    event = scalars(raw)
    return nil if event["name"].blank?

    meta = sanitized_meta(raw[:meta])
    event["meta"] = meta if meta.present?
    event
  end

  # Every scalar entry, capped in count. Nested structures are dropped; the
  # only nesting a beacon may carry is `meta`, handled separately.
  def scalars(source)
    hash = source.respond_to?(:to_unsafe_h) ? source.to_unsafe_h : source.to_h
    hash.each_with_object({}) do |(key, value), acc|
      next if acc.size >= MAX_KEYS
      next unless SCALAR.any? { |type| value.is_a?(type) }

      acc[key.to_s] = value
    end
  end

  MAX_META_KEYS = 20

  def sanitized_meta(meta)
    return nil unless meta.respond_to?(:each_pair)

    meta.each_pair.with_object({}) do |(key, value), acc|
      next if acc.size >= MAX_META_KEYS
      next unless SCALAR.any? { |type| value.is_a?(type) }

      acc[key.to_s] = value
    end
  end
end
