# frozen_string_literal: true

require "net/http"

# Fire-and-forget forwarder to trackhub, the central visitor-tracking API on
# this VPS's internal docker network. A beacon must never slow a request or
# raise, so delivery happens on a detached thread with tight timeouts and all
# errors end up in the log, not the response.
class TrackhubClient
  NUMERIC_CLIENT_FIELDS = {
    screen_w: :to_i, screen_h: :to_i, viewport_w: :to_i, viewport_h: :to_i,
    device_pixel_ratio: :to_f
  }.freeze

  class << self
    def enabled?
      ENV["TRACKHUB_TOKEN"].present?
    end

    def site
      ENV.fetch("TRACKHUB_SITE", "cyberjosef.dev")
    end

    # payload: {token:, ip:, user_agent:, cf_country:, client: {}, event: {}|nil}
    def forward(payload)
      return unless enabled?

      body = normalize(payload).merge(site: site)
      Thread.new { deliver(body) }
      nil
    end

    private

    # The Go API decodes into typed fields; params that arrived as strings
    # (query params, form beacons) must go over the wire as numbers.
    def normalize(payload)
      client = (payload[:client] || {}).dup
      NUMERIC_CLIENT_FIELDS.each do |key, cast|
        client[key] = client[key].public_send(cast) if client[key].present?
      end
      event = payload[:event]
      if event.present?
        event = event.dup
        event[:duration_ms] = event[:duration_ms].to_i if event[:duration_ms].present?
      end
      payload.merge(client: client.compact, event: event)
    end

    def deliver(body)
      uri = URI(ENV.fetch("TRACKHUB_URL", "http://tracker:8080") + "/api/track")
      Net::HTTP.start(uri.host, uri.port, open_timeout: 2, read_timeout: 3) do |http|
        request = Net::HTTP::Post.new(uri)
        request["Content-Type"] = "application/json"
        request["Authorization"] = "Bearer #{ENV["TRACKHUB_TOKEN"]}"
        request.body = body.to_json
        http.request(request)
      end
    rescue StandardError => e
      Rails.logger.warn("[trackhub] forward failed: #{e.class} #{e.message}")
    end
  end
end
