#!/bin/bash

BLUE='\033[0;34m'
RED='\033[0;31m'
WHITE='\033[1;37m'
NC='\033[0m'

clear
echo ""

USER_HOST="root@$(hostname)"
OS=$(lsb_release -ds 2>/dev/null || echo "Ubuntu 22.04.4 LTS")
KERNEL=$(uname -r)
UPTIME=$(uptime -p | sed 's/up //')
PACKAGES=$(dpkg-query -f '.\n' -W | wc -l 2>/dev/null || echo "0")
SHELL_NAME=$(basename $SHELL)

CPU_NAME=$(grep -m1 "model name" /proc/cpuinfo | cut -d: -f2 | sed 's/^[ \t]*//' | cut -c1-30 2>/dev/null || echo "Unknown")
MEM_USED=$(free -m 2>/dev/null | awk '/Mem:/ { print $3 }' || echo "0")
MEM_TOTAL=$(free -m 2>/dev/null | awk '/Mem:/ { print $2 }' || echo "0")

echo -e "${BLUE}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⡀⠀⡀⠀⠀⠀⠀           ${RED}${USER_HOST}${NC}"
echo -e "${BLUE}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱⣄⠘⣆⠀⠀⠀⠀         ${RED}-------------------${NC}"
echo -e "${BLUE}⠀⠀⠀⠀⠀⠀⣀⠀⠀⢢⣤⣀⣦⣄⡀⠙⣶⡘⢷⣄⠀⠀⠀⠀      ${RED}OS: ${NC}${OS}"
echo -e "${BLUE}⠀⠀⠀⠀⣀⣀⣨⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣯⣿⣷⣄⠀⠀⠀⠀   ${RED}Kernel: ${NC}${KERNEL}"
echo -e "${BLUE}⠀⠀⠀⢀⣽⣿⣿⣿⣿⠟⠛⠛⠛⠛⠻⢿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀   ${RED}Uptime: ${NC}${UPTIME}"
echo -e "${BLUE}⠀⠀⠘⣻⣿⣿⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣿⣿⣿⣿⢿⣷⡀⠀  ${RED}Packages: ${NC}${PACKAGES} (dpkg)"
echo -e "${BLUE}⠀⠀⣴⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣿⣷⣽⣷⣄⠀ ${RED}Shell: ${NC}${SHELL_NAME}"
echo -e "${BLUE}⠀⠀⠀⣾⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⢿⣿⣿⣿⣯⠁ ${RED}CPU: ${NC}${CPU_NAME}"
echo -e "${BLUE}⠀⠀⠐⠛⢿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⣿⣿⣷  ${RED}Memory: ${NC}${MEM_USED}MiB / ${MEM_TOTAL}MiB"
echo -e "${BLUE}⠀⠀⠀⠀⠘⠟⠿⣿⣿⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿  ${NC}"
echo -e "${BLUE}⠀⠀⠀⠀⠀⠀⠀⠈⠙⠻⣿⣷⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡼⠟  ${WHITE}Installer Protect × Theme${NC}"
echo -e "${BLUE}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠻⢿⣷⣶⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀  ${WHITE}Owner : @fathir${NC}"
echo -e "${BLUE}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠻⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀  ${NC}"
echo -e "${BLUE}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡄⠀⠀⠀⠀⠀⠀  Support @fathir ${NC}"
echo -e "${BLUE}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡄⠀⠀⠀⠀⠀  ${NC}"
echo -e "${BLUE}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀  ${NC}"
echo -e "${BLUE}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⡇⠀⠀⠀⠀⠀  ${NC}"
echo ""

echo -e "${BLUE}🚀 Memulai Bot Jasseb Resming...${NC}"
echo ""

# Cek apakah Node.js sudah terinstall
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js tidak ditemukan!${NC}"
    echo -e "${WHITE}Menginstall Node.js...${NC}"
    pkg install nodejs -y
fi

# Cek apakah npm sudah terinstall
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm tidak ditemukan!${NC}"
    echo -e "${WHITE}Menginstall npm...${NC}"
    pkg install npm -y
fi

# Cek folder database
if [ ! -d "database" ]; then
    echo -e "${WHITE}📁 Membuat folder database...${NC}"
    mkdir -p database
fi

# Cek package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json tidak ditemukan!${NC}"
    echo -e "${WHITE}Membuat package.json...${NC}"
    cat > package.json << EOF
{
  "name": "bot-jasseb-resming",
  "version": "2.0.0",
  "description": "Bot Broadcast Telegram untuk sharing ke multiple grup",
  "main": "botresming.js",
  "scripts": {
    "start": "node botresming.js"
  },
  "dependencies": {
    "telegraf": "^4.12.2"
  }
}
EOF
fi

# Install dependencies
echo -e "${WHITE}📦 Menginstall dependencies...${NC}"
npm install

# Jalankan bot
echo -e "${GREEN}✅ Semua siap!${NC}"
echo -e "${WHITE}🤖 Menjalankan bot...${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

node botresming.js
