#!/usr/bin/env bash
# ================================================================
# scripts/check-and-install.sh
# SIPLOK Prerequisites Checker & Installer for Ubuntu 22.04 LTS
# ================================================================

set -e

# Warna ANSI
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE} Memeriksa & Menginstal Kebutuhan Sistem SIPLOK...  ${NC}"
echo -e "${BLUE} Target OS: Ubuntu 22.04 LTS (Jammy Jellyfish)      ${NC}"
echo -e "${BLUE}====================================================${NC}\n"

ERRORS=0

# Helper printer
log_ok() {
    printf "${GREEN}[OK]${NC}      %-50s\n" "$1"
}

log_install() {
    printf "${BLUE}[INSTALL]${NC} %-50s\n" "$1"
}

log_done() {
    printf "${GREEN}[DONE]${NC}    %-50s\n" "$1"
}

log_warn() {
    printf "${YELLOW}[WARN]${NC}    %-50s\n" "$1"
}

log_error() {
    printf "${RED}[ERROR]${NC}   %-50s\n" "$1"
}

# ----------------------------------------------------------------
# 1. DOCKER ENGINE & DOCKER COMPOSE PLUGIN
# ----------------------------------------------------------------
if command -v docker &> /dev/null; then
    DOCKER_VER=$(docker --version | awk '{print $3}' | tr -d ',')
    log_ok "Docker ${DOCKER_VER} — sudah terinstall, skip"
else
    log_install "Docker Engine tidak ditemukan, menginstall..."
    if sudo apt-get update -y && \
       sudo apt-get install -y ca-certificates curl gnupg && \
       sudo install -m 0755 -d /etc/apt/keyrings && \
       curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes && \
       sudo chmod a+r /etc/apt/keyrings/docker.gpg && \
       echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && \
       sudo apt-get update -y && \
       sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin; then
        DOCKER_VER=$(docker --version | awk '{print $3}' | tr -d ',')
        log_done "Docker Engine ${DOCKER_VER} berhasil diinstall"
    else
        log_error "Gagal install Docker — cek koneksi internet"
        echo "Gagal menginstall Docker. Coba jalankan manual:"
        echo "  curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Cek keanggotaan group docker
if id -nG "$USER" | grep -qw "docker"; then
    log_ok "User $USER sudah terdaftar di group docker"
else
    log_warn "User $USER belum di group docker, menambahkan..."
    sudo usermod -aG docker "$USER" || true
    log_warn "PERHATIAN: Silakan re-login atau jalankan 'newgrp docker' agar grup aktif"
fi

# ----------------------------------------------------------------
# 2. NODE.JS v20 & NPM
# ----------------------------------------------------------------
if command -v node &> /dev/null && node --version | grep -q "^v20"; then
    NODE_VER=$(node --version)
    log_ok "Node.js ${NODE_VER} — sudah terinstall, skip"
else
    log_install "Node.js tidak ditemukan atau < v20, menginstall v20..."
    if curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
       sudo apt-get install -y nodejs; then
        NODE_VER=$(node --version)
        log_done "Node.js ${NODE_VER} berhasil diinstall"
    else
        log_error "Gagal install Node.js v20 — cek koneksi internet"
        echo "Gagal menginstall Node.js. Coba jalankan manual:"
        echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
        echo "  sudo apt-get install -y nodejs"
        ERRORS=$((ERRORS + 1))
    fi
fi

# ----------------------------------------------------------------
# 3. PHP 8.3 & EXTENSIONS
# ----------------------------------------------------------------
if command -v php &> /dev/null && php --version | grep -q "PHP 8.3"; then
    PHP_VER=$(php -r 'echo PHP_VERSION;')
    log_ok "PHP ${PHP_VER} — sudah terinstall, skip"
else
    log_install "PHP 8.3 tidak ditemukan, menginstall beserta ekstensi..."
    if sudo apt-get install -y software-properties-common && \
       sudo add-apt-repository ppa:ondrej/php -y && \
       sudo apt-get update -y && \
       sudo apt-get install -y php8.3-cli php8.3-pgsql php8.3-xml php8.3-curl php8.3-zip php8.3-mbstring php8.3-bcmath php8.3-tokenizer unzip; then
        PHP_VER=$(php -r 'echo PHP_VERSION;' 2>/dev/null || echo "8.3")
        log_done "PHP ${PHP_VER} berhasil diinstall"
    else
        log_error "Gagal install PHP 8.3 — cek koneksi internet / PPA"
        echo "Gagal menginstall PHP 8.3. Coba jalankan manual:"
        echo "  sudo add-apt-repository ppa:ondrej/php -y && sudo apt update"
        echo "  sudo apt install -y php8.3-cli php8.3-pgsql php8.3-xml php8.3-curl php8.3-zip php8.3-mbstring php8.3-bcmath php8.3-tokenizer unzip"
        ERRORS=$((ERRORS + 1))
    fi
fi

# ----------------------------------------------------------------
# 4. COMPOSER
# ----------------------------------------------------------------
if command -v composer &> /dev/null; then
    COMP_VER=$(composer --version 2>/dev/null | awk '{print $3}')
    log_ok "Composer ${COMP_VER} — sudah terinstall, skip"
else
    log_install "Composer tidak ditemukan, menginstall..."
    if curl -sS https://getcomposer.org/installer | php && \
       sudo mv composer.phar /usr/local/bin/composer && \
       sudo chmod +x /usr/local/bin/composer; then
        COMP_VER=$(composer --version 2>/dev/null | awk '{print $3}')
        log_done "Composer ${COMP_VER} berhasil diinstall"
    else
        log_error "Gagal install Composer — cek koneksi internet"
        echo "Gagal menginstall Composer. Coba jalankan manual:"
        echo "  curl -sS https://getcomposer.org/installer | php"
        echo "  sudo mv composer.phar /usr/local/bin/composer"
        ERRORS=$((ERRORS + 1))
    fi
fi

# ----------------------------------------------------------------
# 5. GIT
# ----------------------------------------------------------------
if command -v git &> /dev/null; then
    GIT_VER=$(git --version | awk '{print $3}')
    log_ok "Git ${GIT_VER} — sudah terinstall, skip"
else
    log_install "Git tidak ditemukan, menginstall..."
    if sudo apt-get install -y git; then
        GIT_VER=$(git --version | awk '{print $3}')
        log_done "Git ${GIT_VER} berhasil diinstall"
    else
        log_error "Gagal install Git — cek koneksi internet"
        echo "Gagal menginstall Git. Coba jalankan manual:"
        echo "  sudo apt-get install -y git"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Summary Data Gathering
SUMMARY_DOCKER=$(docker --version 2>/dev/null | awk '{print $3}' | tr -d ',' || echo "Not Installed")
SUMMARY_COMPOSE=$(docker compose version 2>/dev/null | awk '{print $4}' || echo "Not Installed")
SUMMARY_NODE=$(node --version 2>/dev/null || echo "Not Installed")
SUMMARY_NPM=$(npm --version 2>/dev/null | sed 's/^/v/' || echo "Not Installed")
SUMMARY_PHP=$(php -r 'echo "v" . PHP_VERSION;' 2>/dev/null || echo "Not Installed")
SUMMARY_COMPOSER=$(composer --version 2>/dev/null | awk '{print "v" $3}' || echo "Not Installed")
SUMMARY_GIT=$(git --version 2>/dev/null | awk '{print "v" $3}' || echo "Not Installed")

echo ""
echo "============================================"
echo " SIPLOK Prerequisites — Installation Summary"
echo "============================================"
printf " Docker Engine   : %-15s [OK]\n" "${SUMMARY_DOCKER}"
printf " Docker Compose  : %-15s [OK]\n" "${SUMMARY_COMPOSE}"
printf " Node.js         : %-15s [OK]\n" "${SUMMARY_NODE}"
printf " npm             : %-15s [OK]\n" "${SUMMARY_NPM}"
printf " PHP             : %-15s [OK]\n" "${SUMMARY_PHP}"
printf " Composer        : %-15s [OK]\n" "${SUMMARY_COMPOSER}"
printf " Git             : %-15s [OK]\n" "${SUMMARY_GIT}"
echo "============================================"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN} Semua prerequisites siap. Lanjutkan setup!${NC}"
    echo "============================================"
    exit 0
else
    echo -e "${RED} Terdapat $ERRORS tool yang gagal diinstall. Silakan cek pesan di atas.${NC}"
    echo "============================================"
    exit 1
fi
