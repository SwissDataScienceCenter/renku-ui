ifndef PLATFORM_VERSION
	PLATFORM_VERSION = latest
endif

npm-targets = \
	dist/css/main.css \
	dist/css/material-components-web.css \
	dist/js/main.js \
	dist/js/material-components-web.js

.PHONY: server
server: $(npm-targets)
	@docker build -t renga-ui:$(PLATFORM_VERSION) .

$(npm-targets): $(shell find config environment src) package.json package-lock.json tsconfig.json tslint.json webpack.config.js
	@docker build -t renga-ui-build:$(PLATFORM_VERSION) -f npm-build.Dockerfile .
	@ID=$$(docker create renga-ui-build:$(PLATFORM_VERSION)); docker cp $$ID:/code/renga-ui/dist .; docker rm $$ID
