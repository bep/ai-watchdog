.PHONY: test test-setup test-run

# Default test command that ensures setup is done before running tests
test: test-setup test-run

# Install dependencies and build typescript
test-setup:
	npm install
	npm install -g ts-node typescript # Ensure ts-node is available
	npm run build

# Run the analysis script with environment check
test-run:
	@if [ -z "$$OPENAI_API_KEY" ]; then \
		echo "Error: OPENAI_API_KEY environment variable is not set"; \
		echo "Please set it with: export OPENAI_API_KEY='your-api-key'"; \
		exit 1; \
	fi
	ts-node src/__tests__/analyze.test.ts

# Clean up build artifacts and node_modules
clean:
	rm -rf node_modules dist