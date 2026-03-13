# 🎲 LUDO - The Complete Edition

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Live](https://img.shields.io/badge/🚀_Live_Demo-Click_Here-brightgreen?style=for-the-badge)](https://ludo-production-1eee.up.railway.app/)

> A fully-featured, professional **LUDO** game built with **Node.js**, **Socket.io** and **Vanilla JavaScript** — playable both online (multiplayer) and offline (same device, up to 4 players).

---

## 🚀 Live Demo

**👉 [Play Now — ludo-production-1eee.up.railway.app](https://ludo-production-1eee.up.railway.app/)**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌐 **Online Multiplayer** | Play with friends over the internet using Socket.io |
| 🖥️ **Offline Mode** | Up to 4 players on a single device |
| 🔊 **Sound Effects** | Dice roll, move, kill, six & win sounds |
| 🎨 **4 Colored Tokens** | Red, Green, Blue & Yellow — high-quality PNG pieces |
| 🎯 **Smooth Animations** | Fluid token movement and dice animations |
| 📱 **Responsive Design** | Works on mobile, tablet and desktop |
| 🏆 **Professional UI** | Clean, modern and polished interface |
| 🐳 **Docker Support** | Easy deployment with Docker & docker-compose |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v14 or higher
- npm (comes with Node.js)

### Installation

```bash
git clone https://github.com/balochzameer409-oss/LUDO.git
cd LUDO
npm install
npm start
```

Open: `http://localhost:3000/`

---

## 🐳 Docker

```bash
# Quick run
docker run --name ludo-game -p 3000:3000 balochzameer409-oss/ludo-game

# Detached mode
docker run --name ludo-game -d -p 3000:3000 balochzameer409-oss/ludo-game

# docker-compose (dev)
docker-compose -f docker-compose.dev.yml up

# docker-compose (prod)
docker-compose -f docker-compose.prod.yml up

# Stop & remove
docker stop ludo-game && docker rm ludo-game
```

---

## 🎮 How to Play

1. Open — [Live Demo](https://ludo-production-1eee.up.railway.app/)
2. Choose **Online** or **Offline** mode
3. **Online:** Share the room link with friends
4. **Offline:** Pass the device between players (up to 4)
5. Roll the dice, move your tokens, kill opponents & race to win! 🏆

---

## 📁 Project Structure

```
LUDO/
├── app/
│   ├── config/config.js
│   ├── controllers/
│   │   ├── ludoController.js
│   │   └── rootController.js
│   ├── models/model.js
│   ├── public/
│   │   ├── images/
│   │   │   ├── favicon/
│   │   │   ├── icons/
│   │   │   └── pieces/         ← red, green, blue, yellow tokens
│   │   ├── js/
│   │   │   ├── ludo.js
│   │   │   ├── ludo-offline.js
│   │   │   ├── ludo-sound.js
│   │   │   ├── dice-sync.js
│   │   │   └── dice-sync-offline.js
│   │   ├── sounds/
│   │   │   ├── dice.mp3
│   │   │   ├── move.mp3
│   │   │   ├── kill.mp3
│   │   │   ├── six.mp3
│   │   │   ├── win.mp3
│   │   │   └── game-over.mp3
│   │   └── style/
│   ├── routes/
│   └── views/
│       ├── index.html
│       ├── ludo.html
│       └── ludo-offline.html
├── nginx/
├── Dockerfile
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── server.js
└── package.json
```

---

## 🔧 Improvements Over Original

Based on [CyberCitizen01/LUDO](https://github.com/CyberCitizen01/LUDO):

- 🔧 **Ghost player** in online mode — *still being fixed*
- ✅ Fixed **dice animation** for top two players
- ✅ Added **Offline Mode** (4 players, single device)
- ✅ Added **Sound Effects** (dice, move, kill, six, win, game-over)
- ✅ New high-quality **token images**
- ✅ Professional **UI polish**
- ✅ **Docker Compose** for dev & prod
- ✅ Deployed live on **Railway**

---

## 🐛 Known Issues

| Issue | Status |
|---|---|
| Ghost player appearing in online mode | 🔧 Work in progress |

> Contributions and bug fixes are welcome! Feel free to open an [Issue](https://github.com/balochzameer409-oss/LUDO/issues) or submit a PR.

---

## 🙏 Credits

| | |
|---|---|
| **Original Project** | [CyberCitizen01/LUDO](https://github.com/CyberCitizen01/LUDO) |
| **Improved & Completed by** | [balochzameer409-oss](https://github.com/balochzameer409-oss) |

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

<p align="center">Made with ❤️ by <a href="https://github.com/balochzameer409-oss"><b>Zameer</b></a> &nbsp;|&nbsp; <a href="https://ludo-production-1eee.up.railway.app/">🎲 Play Live</a></p>
