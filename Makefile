ifndef PLATFORM_VERSION
	PLATFORM_VERSION = latest
endif

ifndef IMAGE_REPOSITORY
        IMAGE_REPOSITORY = rengahub/
endif

npm-targets += dist/manifest.json
npm-targets += dist/assets/
npm-targets += dist/css/
npm-targets += dist/js/

.PHONY: server
server: $(npm-targets)
	@docker build --tag $(IMAGE_REPOSITORY)renga-ui:$(PLATFORM_VERSION) .

$(npm-targets): $(shell find config environment src) package.json package-lock.json tsconfig.json tslint.json webpack.config.js
	@rm -rf dist
	@docker build -t renga-ui-build:$(PLATFORM_VERSION) -f npm-build.Dockerfile .
	@ID=$$(docker create renga-ui-build:$(PLATFORM_VERSION)); docker cp $$ID:/code/renga-ui/dist .; docker rm $$ID
