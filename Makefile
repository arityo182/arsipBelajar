# ================================================================
# Makefile — SIPLOK ATR/BPN Kabupaten Banyumas
# ================================================================

.PHONY: help up down restart migrate seed fresh logs bash-be bash-db check setup

help:
	@echo "Perintah yang tersedia untuk SIPLOK:"
	@echo "  make check    - Cek dan install prerequisites Ubuntu 22.04"
	@echo "  make setup    - Setup perdana (check + up + migrate + seed)"
	@echo "  make up       - Build & jalankan seluruh container (detached)"
	@echo "  make down     - Hentikan seluruh container"
	@echo "  make restart  - Hentikan lalu nyalakan ulang container"
	@echo "  make migrate  - Jalankan migrasi database di container backend"
	@echo "  make seed     - Jalankan database seeder di container backend"
	@echo "  make fresh    - Reset database, migrasi ulang & jalankan seeder"
	@echo "  make logs     - Tampilkan live logs seluruh service container"
	@echo "  make bash-be  - Masuk ke terminal shell container backend"
	@echo "  make bash-db  - Masuk ke PostgreSQL CLI (psql) siplok-pgsql"

check:
	bash scripts/check-and-install.sh

up:
	docker compose up -d --build

down:
	docker compose down

restart: down up

migrate:
	docker exec siplok-backend php artisan migrate --force

seed:
	docker exec siplok-backend php artisan db:seed --force

fresh:
	docker exec siplok-backend php artisan migrate:fresh --seed --force

logs:
	docker compose logs -f

bash-be:
	docker exec -it siplok-backend sh

bash-db:
	docker exec -it siplok-pgsql psql -U siplok_user -d siplok_db

setup:
	@if [ ! -f .env ]; then \
		echo "Menyalin .env.docker.example menjadi .env..."; \
		cp .env.docker.example .env; \
	fi
	$(MAKE) up
	@echo "Menunggu PostgreSQL & container backend stabil selama 10 detik..."
	@sleep 10
	$(MAKE) fresh
	@echo "================================================================"
	@echo " Setup SIPLOK Selesai!"
	@echo " Frontend URL: http://localhost:3000"
	@echo " Backend API : http://localhost:8000/api"
	@echo " pgAdmin URL : http://localhost:5050 (admin@siplok.lan / admin123)"
	@echo "================================================================"
