class Resume
  class << self
    def data
      @data = nil if Rails.env.development?
      @data ||= YAML.safe_load_file(path, permitted_classes: [ Date ]).deep_symbolize_keys
    end

    def as_json
      @as_json = nil if Rails.env.development?
      @as_json ||= deep_camelize(YAML.safe_load_file(path, permitted_classes: [ Date ]))
    end

    def path
      Rails.root.join("content", "resume.yml")
    end

    private

    def deep_camelize(value)
      case value
      when Hash
        value.to_h { |key, nested| [ key.to_s.camelize(:lower), deep_camelize(nested) ] }
      when Array
        value.map { |item| deep_camelize(item) }
      else
        value
      end
    end
  end
end
