module Jekyll
  class FederalistGenerator < Generator
    def generate(site)
      # if $BRANCH is set (and it's not `master`), set `site.url` to the
      # Federalist preview URL for this branch.
      branch = ENV['BRANCH']
      if branch && branch != 'master'
        site.config['url'] = "https://federalist.18f.gov/preview/18F/doi-extractives-data/#{branch}"
        puts "*** Federalist URL: <#{site.config['url']}> ***"
      end
    end
  end
end
