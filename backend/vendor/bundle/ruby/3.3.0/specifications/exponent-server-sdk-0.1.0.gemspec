# -*- encoding: utf-8 -*-
# stub: exponent-server-sdk 0.1.0 ruby lib

Gem::Specification.new do |s|
  s.name = "exponent-server-sdk".freeze
  s.version = "0.1.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Jesse Ruder".freeze, "Pablo Gomez".freeze]
  s.date = "2020-04-15"
  s.description = "Exponent Server SDK".freeze
  s.email = ["jesse@sixfivezero.net".freeze, "pablonahuelgomez@gmail.com".freeze]
  s.homepage = "".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.0.3".freeze
  s.summary = "Exponent Server SDK".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<typhoeus>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, [">= 0".freeze])
end
