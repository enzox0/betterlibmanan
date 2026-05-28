.PHONY: help install build dev test lint format clean docker-up docker-down

help:
	@echo "BetterLibmanan - Development Commands"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Commands:"
	@echo "  install     Install dependencies"
	@echo "  build       Build all applications"
	@echo "  dev         Start development servers"
	@echo "  test        Run all tests"
	@echo "  lint        Lint all code"
	@echo "  format      Format all code"
	@echo "  clean       Clean build artifacts"
	@echo "  docker-up   Start Docker services"
	@echo "  docker-down Stop Docker services"

install:
	pnpm install

build:
	pnpm run build

dev:
	pnpm run dev

test:
	pnpm run test

lint:
	pnpm run lint

format:
	pnpm run format

clean:
	pnpm run clean

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down