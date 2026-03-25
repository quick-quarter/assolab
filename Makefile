.PHONY: help up down build logs pull-model dev clean

MODEL ?= llama3.2:3b

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Start all services (CPU mode)
	OLLAMA_MODEL=$(MODEL) docker compose up --build -d
	@echo ""
	@echo "✅ AssoLab is starting at http://localhost:3000"
	@echo "   First run: model download (~2 GB) may take a few minutes."
	@echo "   Use 'make logs' to follow progress."

up-gpu: ## Start all services with NVIDIA GPU support
	OLLAMA_MODEL=$(MODEL) docker compose -f docker-compose.yml -f docker-compose.gpu.yml up --build -d

down: ## Stop all services
	docker compose down

build: ## Rebuild the app image only
	docker compose build app

logs: ## Tail logs for all services
	docker compose logs -f

logs-app: ## Tail app logs only
	docker compose logs -f app

logs-ollama: ## Tail ollama logs only
	docker compose logs -f ollama

pull-model: ## Pull / update the Llama model (default: llama3.2:3b)
	docker compose exec ollama ollama pull $(MODEL)

list-models: ## List models available in the running Ollama instance
	docker compose exec ollama ollama list

dev: ## Start local dev server (Ollama must be running separately)
	npm run dev

clean: ## Stop services and remove all volumes (WARNING: deletes DB + models)
	docker compose down -v
	@echo "⚠️  Volumes deleted. Model will be re-downloaded on next 'make up'."
