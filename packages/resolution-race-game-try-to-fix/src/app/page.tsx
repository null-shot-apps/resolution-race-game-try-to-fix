'use client';

import { useEffect } from 'react';

export default function ResolutionRacer() {
  useEffect(() => {
    // Game will be initialized here
  }, []);

  return (
    <>
      <div id="game-container" style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }} />
      <div dangerouslySetInnerHTML={{ __html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resolution Racer 2026</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            overflow: hidden;
            background: #000;
        }
        #gameCanvas {
            display: block;
            width: 100vw;
            height: 100vh;
        }
        #ui {
            position: absolute;
            top: 20px;
            left: 20px;
            color: #00ffff;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 10px #00ffff;
            z-index: 100;
        }
        #pauseBtn {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(0, 255, 255, 0.3);
            border: 2px solid #00ffff;
            border-radius: 8px;
            color: #00ffff;
            font-size: 24px;
            cursor: pointer;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }
        #pauseBtn:hover {
            background: rgba(0, 255, 255, 0.5);
        }
        #message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
            font-size: 48px;
            font-weight: bold;
            text-align: center;
            z-index: 200;
            text-shadow: 0 0 20px #00ffff;
            display: none;
        }
        #restartBtn {
            margin-top: 30px;
            padding: 15px 40px;
            font-size: 24px;
            background: #00ff00;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 0 30px #00ff00;
        }
        #restartBtn:hover {
            background: #00cc00;
        }
        #notification {
            position: absolute;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            color: #ff0000;
            font-size: 28px;
            font-weight: bold;
            text-shadow: 0 0 10px #ff0000;
            z-index: 150;
            display: none;
        }
        #comboDisplay {
            position: absolute;
            top: 70px;
            left: 20px;
            color: #ffff00;
            font-size: 20px;
            font-weight: bold;
            text-shadow: 0 0 10px #ffff00;
            z-index: 100;
            display: none;
        }
        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #00ff00;
            animation: fall 3s linear infinite;
        }
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(360deg);
            }
        }
    </style>
</head>
<body>
    <div id="ui">
        <div>Score: <span id="score">50</span></div>
    </div>
    <div id="comboDisplay">Combo: <span id="combo">0</span>x</div>
    <button id="pauseBtn">II</button>
    <div id="notification"></div>
    <div id="message"></div>
    <canvas id="gameCanvas"></canvas>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Game State
        const gameState = {
            score: 50,
            combo: 0,
            speed: 0.1875,
            baseSpeed: 0.1875,
            maxSpeed: 0.5,
            isPaused: false,
            isGameOver: false,
            isVictory: false,
            countdown: 3,
            isCountingDown: true,
            bullRunActive: false,
            bullRunTimer: 0,
            fudStormTimer: 0,
            fudStormInterval: 15000,
            lastGateZ: -50,
            gachaTimer: 0,
            miniModeActive: false,
            miniModeTimer: 0,
            fogActive: false,
            fogTimer: 0
        };

        // Good and Bad texts
        const goodTexts = ["Profit", "Holiday", "Healthy", "Financial Freedom", "Happy", "100x Gem", "Airdrop", "WAGMI", "Bull Market", "Passive Income", "New ATH", "Green Candle", "Freedom", "Good Sleep", "Promotion", "Diamond Hands", "Inner Peace", "Debt Free", "Confidence", "Smart Move"];
        const badTexts = ["Rekt", "Drain", "Rug Pull", "Bear Market", "Liquidation", "FOMO", "FUD", "High Gas Fee", "Scam", "Phishing", "Red Candle", "Inflation", "Burnout", "Overthinking", "Bad Vibes", "Procrastination", "Insomnia", "Hack", "Panic Sell", "Paper Hands"];

        // Audio Context for sounds
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        function playSound(type) {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            if (type === 'good') {
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.2);
            } else if (type === 'bad') {
                oscillator.frequency.value = 200;
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.3);
            } else if (type === 'powerup') {
                oscillator.frequency.value = 1200;
                gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.4);
            } else if (type === 'jackpot') {
                oscillator.frequency.value = 1500;
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + 0.5);
            }
        }

        // Three.js Setup
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x000033, 10, 200);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 8, 10);
        camera.lookAt(0, 0, -10);

        const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 10, 5);
        scene.add(directionalLight);

        // Background Sign
        const signGeometry = new THREE.PlaneGeometry(40, 8);
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 1024;
        signCanvas.height = 256;
        const signCtx = signCanvas.getContext('2d');
        signCtx.fillStyle = '#000033';
        signCtx.fillRect(0, 0, 1024, 256);
        signCtx.fillStyle = '#00ffff';
        signCtx.font = 'bold 80px Arial';
        signCtx.textAlign = 'center';
        signCtx.textBaseline = 'middle';
        signCtx.fillText('NEW YEAR RESOLUTION', 512, 128);
        const signTexture = new THREE.CanvasTexture(signCanvas);
        const signMaterial = new THREE.MeshBasicMaterial({ map: signTexture, side: THREE.DoubleSide });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 10, -100);
        scene.add(sign);

        // Road
        const roadGeometry = new THREE.PlaneGeometry(15, 300);
        const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.y = 0;
        scene.add(road);

        // Lane Lines
        const laneLineMaterial = new THREE.MeshBasicMaterial({ color: 0x0088ff });
        for (let i = 0; i < 60; i++) {
            const line1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 2), laneLineMaterial);
            line1.position.set(-2.5, 0.05, -i * 5);
            scene.add(line1);
            
            const line2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 2), laneLineMaterial);
            line2.position.set(2.5, 0.05, -i * 5);
            scene.add(line2);
        }

        // Player Car
        const carGroup = new THREE.Group();
        
        const carBody = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.5, 3),
            new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.5 })
        );
        carBody.position.y = 0.5;
        carGroup.add(carBody);

        const carCabin = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.6, 1.5),
            new THREE.MeshStandardMaterial({ color: 0x000000 })
        );
        carCabin.position.set(0, 1, -0.3);
        carGroup.add(carCabin);

        const spoiler = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.1, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.5 })
        );
        spoiler.position.set(0, 1.2, 1.5);
        carGroup.add(spoiler);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        
        const wheels = [
            { x: -0.9, z: 1 },
            { x: 0.9, z: 1 },
            { x: -0.9, z: -1 },
            { x: 0.9, z: -1 }
        ];
        
        wheels.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.3, pos.z);
            carGroup.add(wheel);
        });

        carGroup.position.set(0, 0, 5);
        scene.add(carGroup);

        let currentLane = 1; // 0=left, 1=center, 2=right
        let targetX = 0;
        const lanePositions = [-5, 0, 5];

        // Gates and Objects
        const gates = [];
        const powerups = [];
        const meteors = [];
        const gachaBoxes = [];
        const passedGates = new Set();

        function createTextTexture(text, color) {
            const canvas = document.createElement('canvas');
            canvas.width = 2048;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 2048, 1024);
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const maxWidth = 1900;
            const words = text.split(' ');
            
            // Determine base font size based on text characteristics
            let fontSize = 500;
            
            // Single long words (12+ chars) need smaller font
            if (words.length === 1 && text.length >= 12) {
                fontSize = 350;
            }
            // 3+ word phrases need smaller font
            else if (words.length >= 3) {
                fontSize = 380;
            }
            
            ctx.font = 'bold ' + fontSize + 'px Arial';
            let textWidth = ctx.measureText(text).width;
            
            // If still too wide and has spaces, split into 2 lines
            if (textWidth > maxWidth && text.includes(' ')) {
                // Use smaller font for split lines
                fontSize = words.length >= 3 ? 350 : 400;
                ctx.font = 'bold ' + fontSize + 'px Arial';
                
                let line1 = '';
                let line2 = '';
                let bestSplit = 0;
                let minDiff = Infinity;
                
                // Find the split that creates most balanced lines
                for (let i = 1; i < words.length; i++) {
                    const testLine1 = words.slice(0, i).join(' ');
                    const testLine2 = words.slice(i).join(' ');
                    const width1 = ctx.measureText(testLine1).width;
                    const width2 = ctx.measureText(testLine2).width;
                    const diff = Math.abs(width1 - width2);
                    
                    if (width1 <= maxWidth && width2 <= maxWidth && diff < minDiff) {
                        minDiff = diff;
                        bestSplit = i;
                    }
                }
                
                if (bestSplit > 0) {
                    line1 = words.slice(0, bestSplit).join(' ');
                    line2 = words.slice(bestSplit).join(' ');
                    ctx.fillText(line1, 1024, 362);
                    ctx.fillText(line2, 1024, 662);
                } else {
                    // Can't split nicely, use smallest font
                    ctx.font = 'bold 320px Arial';
                    ctx.fillText(text, 1024, 512);
                }
            } else if (textWidth > maxWidth) {
                // Still too wide, use smallest font
                ctx.font = 'bold 320px Arial';
                ctx.fillText(text, 1024, 512);
            } else {
                // Fits on one line at current font size
                ctx.fillText(text, 1024, 512);
            }
            
            return new THREE.CanvasTexture(canvas);
        }

        function spawnGates() {
            const z = gameState.lastGateZ - 30;
            gameState.lastGateZ = z;

            const lanes = [0, 1, 2];
            const shuffled = lanes.sort(() => Math.random() - 0.5);
            
            const goodLane = shuffled[0];
            const badLane = shuffled[1];

            // Good Gate
            const goodText = goodTexts[Math.floor(Math.random() * goodTexts.length)];
            const goodGate = new THREE.Group();
            
            const goodLeft = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 3, 0.3),
                new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.8 })
            );
            goodLeft.position.set(-1.5, 1.5, 0);
            goodGate.add(goodLeft);

            const goodRight = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 3, 0.3),
                new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.8 })
            );
            goodRight.position.set(1.5, 1.5, 0);
            goodGate.add(goodRight);

            const goodTop = new THREE.Mesh(
                new THREE.BoxGeometry(3.3, 0.5, 0.3),
                new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.8 })
            );
            goodTop.position.set(0, 3, 0);
            goodGate.add(goodTop);

            const goodTextPlane = new THREE.Mesh(
                new THREE.PlaneGeometry(3, 1),
                new THREE.MeshBasicMaterial({ map: createTextTexture(goodText, '#00ff00'), transparent: true })
            );
            goodTextPlane.position.set(0, 5, 0);
            goodGate.add(goodTextPlane);

            goodGate.position.set(lanePositions[goodLane], 0, z);
            goodGate.userData = { type: 'good', lane: goodLane };
            scene.add(goodGate);
            gates.push(goodGate);

            // Bad Gate
            const badText = badTexts[Math.floor(Math.random() * badTexts.length)];
            const badGate = new THREE.Group();
            
            const badLeft = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 3, 0.3),
                new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 })
            );
            badLeft.position.set(-1.5, 1.5, 0);
            badGate.add(badLeft);

            const badRight = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 3, 0.3),
                new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 })
            );
            badRight.position.set(1.5, 1.5, 0);
            badGate.add(badRight);

            const badTop = new THREE.Mesh(
                new THREE.BoxGeometry(3.3, 0.5, 0.3),
                new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 })
            );
            badTop.position.set(0, 3, 0);
            badGate.add(badTop);

            // Add spikes
            for (let i = -1; i <= 1; i += 0.5) {
                const spike = new THREE.Mesh(
                    new THREE.ConeGeometry(0.2, 0.5, 4),
                    new THREE.MeshStandardMaterial({ color: 0xff0000 })
                );
                spike.position.set(i, 3.5, 0);
                spike.rotation.x = Math.PI;
                badGate.add(spike);
            }

            const badTextPlane = new THREE.Mesh(
                new THREE.PlaneGeometry(3, 1),
                new THREE.MeshBasicMaterial({ map: createTextTexture(badText, '#ff0000'), transparent: true })
            );
            badTextPlane.position.set(0, 5, 0);
            badGate.add(badTextPlane);

            badGate.position.set(lanePositions[badLane], 0, z);
            badGate.userData = { type: 'bad', lane: badLane };
            scene.add(badGate);
            gates.push(badGate);
        }

        function spawnPowerup() {
            if (Math.random() > 0.7) return;
            
            const lane = Math.floor(Math.random() * 3);
            const z = gameState.lastGateZ - 15;
            
            const powerup = new THREE.Mesh(
                new THREE.ConeGeometry(0.5, 1.5, 4),
                new THREE.MeshStandardMaterial({ color: 0x0088ff, emissive: 0x0088ff, emissiveIntensity: 1 })
            );
            powerup.position.set(lanePositions[lane], 1, z);
            powerup.userData = { type: 'rocket' };
            scene.add(powerup);
            powerups.push(powerup);
        }

        function spawnGachaBox() {
            const lane = Math.floor(Math.random() * 3);
            const z = gameState.lastGateZ - 20;
            
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({ color: 0x8800ff, emissive: 0x8800ff, emissiveIntensity: 0.8 })
            );
            box.position.set(lanePositions[lane], 0.5, z);
            box.userData = { type: 'gacha' };
            scene.add(box);
            gachaBoxes.push(box);
        }

        function spawnFudStorm() {
            showNotification('⚠️ WARNING: FUD STORM! ⚠️', '#ff8800');
            
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const lane = Math.floor(Math.random() * 3);
                    const meteor = new THREE.Mesh(
                        new THREE.SphereGeometry(0.5, 16, 16),
                        new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: 0xff8800, emissiveIntensity: 1 })
                    );
                    meteor.position.set(lanePositions[lane], 15, carGroup.position.z - 20);
                    meteor.userData = { type: 'meteor', velocity: 0.3 };
                    scene.add(meteor);
                    meteors.push(meteor);
                }, i * 200);
            }
        }

        // UI Functions
        function updateScore(delta) {
            gameState.score += delta;
            document.getElementById('score').textContent = gameState.score;
            
            if (gameState.score <= 0) {
                gameOver();
            } else if (gameState.score >= 2000) {
                victory();
            }
        }

        function updateCombo() {
            const comboEl = document.getElementById('combo');
            const comboDisplay = document.getElementById('comboDisplay');
            comboEl.textContent = gameState.combo;
            comboDisplay.style.display = gameState.combo > 0 ? 'block' : 'none';
        }

        function showNotification(text, color = '#ff0000') {
            const notif = document.getElementById('notification');
            notif.textContent = text;
            notif.style.color = color;
            notif.style.display = 'block';
            setTimeout(() => {
                notif.style.display = 'none';
            }, 2000);
        }

        function screenShake() {
            const originalY = camera.position.y;
            let shakeTime = 0;
            const shakeInterval = setInterval(() => {
                camera.position.y = originalY + (Math.random() - 0.5) * 0.5;
                shakeTime += 50;
                if (shakeTime >= 300) {
                    camera.position.y = originalY;
                    clearInterval(shakeInterval);
                }
            }, 50);
        }

        function activateBullRun() {
            gameState.bullRunActive = true;
            gameState.bullRunTimer = 3000;
            showNotification('🚀 BULL RUN MODE! 2x POINTS! 🚀', '#00ff00');
            carBody.material.emissiveIntensity = 1.5;
        }

        function activateFog() {
            gameState.fogActive = true;
            gameState.fogTimer = 3000;
            scene.fog.near = 5;
            scene.fog.far = 30;
            showNotification('😵 FUD FOG! 😵', '#888888');
        }

        function activateMiniMode() {
            gameState.miniModeActive = true;
            gameState.miniModeTimer = 5000;
            carGroup.scale.set(0.5, 0.5, 0.5);
            showNotification('🔬 MINI MODE! 🔬', '#ff00ff');
        }

        function gameOver() {
            gameState.isGameOver = true;
            const msg = document.getElementById('message');
            msg.innerHTML = 'GAME OVER<br>Try Again!<br><button id="restartBtn">RESTART</button>';
            msg.style.display = 'block';
            document.getElementById('restartBtn').onclick = restart;
        }

        function victory() {
            gameState.isVictory = true;
            const msg = document.getElementById('message');
            msg.innerHTML = '🎉 CONGRATULATIONS! 🎉<br>YOU ARE READY FOR 2026!<br><button id="restartBtn">PLAY AGAIN</button>';
            msg.style.display = 'block';
            document.getElementById('restartBtn').onclick = restart;
            
            // Confetti
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.left = Math.random() * 100 + '%';
                    confetti.style.background = ['#00ff00', '#00ffff', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 4)];
                    confetti.style.animationDelay = Math.random() * 2 + 's';
                    document.body.appendChild(confetti);
                    setTimeout(() => confetti.remove(), 3000);
                }, i * 50);
            }
        }

        function restart() {
            location.reload();
        }

        // Controls
        document.addEventListener('keydown', (e) => {
            if (gameState.isGameOver || gameState.isVictory || gameState.isCountingDown) return;
            
            if (e.key === ' ') {
                gameState.isPaused = !gameState.isPaused;
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                if (currentLane > 0) {
                    currentLane--;
                    targetX = lanePositions[currentLane];
                }
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                if (currentLane < 2) {
                    currentLane++;
                    targetX = lanePositions[currentLane];
                }
            }
        });

        // Mobile controls
        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (!gameState.isGameOver && !gameState.isVictory && !gameState.isCountingDown) {
                gameState.isPaused = !gameState.isPaused;
            }
        });

        document.getElementById('gameCanvas').addEventListener('click', (e) => {
            if (gameState.isGameOver || gameState.isVictory || gameState.isCountingDown) return;
            
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            
            if (x < width / 2 && currentLane > 0) {
                currentLane--;
                targetX = lanePositions[currentLane];
            } else if (x >= width / 2 && currentLane < 2) {
                currentLane++;
                targetX = lanePositions[currentLane];
            }
        });

        // Countdown
        function startCountdown() {
            const msg = document.getElementById('message');
            msg.style.display = 'block';
            
            const countInterval = setInterval(() => {
                if (gameState.countdown > 0) {
                    msg.innerHTML = '<div style="font-size: 120px;">' + gameState.countdown + '</div>';
                    gameState.countdown--;
                } else {
                    msg.innerHTML = '<div style="font-size: 80px; color: #00ff00;">GO!</div>';
                    setTimeout(() => {
                        msg.style.display = 'none';
                        gameState.isCountingDown = false;
                    }, 500);
                    clearInterval(countInterval);
                }
            }, 1000);
        }

        // Window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Game Loop
        let lastTime = Date.now();
        
        function animate() {
            requestAnimationFrame(animate);
            
            const currentTime = Date.now();
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            if (gameState.isCountingDown || gameState.isPaused || gameState.isGameOver || gameState.isVictory) {
                renderer.render(scene, camera);
                return;
            }

            // Update speed based on score
            if (gameState.score < 900) {
                gameState.speed = gameState.baseSpeed + (gameState.score / 900) * (gameState.maxSpeed - gameState.baseSpeed);
            } else {
                gameState.speed = gameState.maxSpeed;
            }

            // Car movement
            carGroup.position.x += (targetX - carGroup.position.x) * 0.1;

            // Bull Run timer
            if (gameState.bullRunActive) {
                gameState.bullRunTimer -= deltaTime;
                if (gameState.bullRunTimer <= 0) {
                    gameState.bullRunActive = false;
                    carBody.material.emissiveIntensity = 0.5;
                }
            }

            // Fog timer
            if (gameState.fogActive) {
                gameState.fogTimer -= deltaTime;
                if (gameState.fogTimer <= 0) {
                    gameState.fogActive = false;
                    scene.fog.near = 10;
                    scene.fog.far = 200;
                }
            }

            // Mini mode timer
            if (gameState.miniModeActive) {
                gameState.miniModeTimer -= deltaTime;
                if (gameState.miniModeTimer <= 0) {
                    gameState.miniModeActive = false;
                    carGroup.scale.set(1, 1, 1);
                }
            }

            // Move gates
            gates.forEach((gate, index) => {
                gate.position.z += gameState.speed;
                
                // Check collision
                if (Math.abs(gate.position.z - carGroup.position.z) < 2 && 
                    Math.abs(gate.position.x - carGroup.position.x) < 2) {
                    
                    if (!gate.userData.hit) {
                        gate.userData.hit = true;
                        
                        if (gate.userData.type === 'good') {
                            gameState.combo++;
                            const points = 10 + (gameState.combo - 1) * 5;
                            const multiplier = gameState.bullRunActive ? 2 : 1;
                            updateScore(points * multiplier);
                            updateCombo();
                            playSound('good');
                            showNotification('+' + (points * multiplier) + ' Points!', '#00ff00');
                        } else if (gate.userData.type === 'bad') {
                            updateScore(-10);
                            gameState.combo = 0;
                            updateCombo();
                            playSound('bad');
                            screenShake();
                            showNotification('-10 Points!', '#ff0000');
                        }
                    }
                }
                
                // Lazy tax check
                if (gate.userData.type === 'good' && gate.position.z > carGroup.position.z + 3 && !passedGates.has(gate.id)) {
                    passedGates.add(gate.id);
                    if (!gate.userData.hit) {
                        updateScore(-5);
                        showNotification('-5 Lazy Tax!', '#ffaa00');
                    }
                }
                
                // Remove far gates
                if (gate.position.z > 20) {
                    scene.remove(gate);
                    gates.splice(index, 1);
                }
            });

            // Move powerups
            powerups.forEach((powerup, index) => {
                powerup.position.z += gameState.speed;
                powerup.rotation.y += 0.05;
                
                if (Math.abs(powerup.position.z - carGroup.position.z) < 1.5 && 
                    Math.abs(powerup.position.x - carGroup.position.x) < 1.5) {
                    activateBullRun();
                    playSound('powerup');
                    scene.remove(powerup);
                    powerups.splice(index, 1);
                }
                
                if (powerup.position.z > 20) {
                    scene.remove(powerup);
                    powerups.splice(index, 1);
                }
            });

            // Move gacha boxes
            gachaBoxes.forEach((box, index) => {
                box.position.z += gameState.speed;
                box.rotation.y += 0.03;
                
                if (Math.abs(box.position.z - carGroup.position.z) < 1.5 && 
                    Math.abs(box.position.x - carGroup.position.x) < 1.5 &&
                    !gameState.miniModeActive) {
                    
                    const rand = Math.random();
                    if (rand < 0.25) {
                        updateScore(50);
                        playSound('jackpot');
                        showNotification('💰 JACKPOT! +50! 💰', '#ffff00');
                    } else if (rand < 0.5) {
                        activateBullRun();
                        playSound('powerup');
                    } else if (rand < 0.75) {
                        activateFog();
                    } else {
                        activateMiniMode();
                    }
                    
                    scene.remove(box);
                    gachaBoxes.splice(index, 1);
                }
                
                if (box.position.z > 20) {
                    scene.remove(box);
                    gachaBoxes.splice(index, 1);
                }
            });

            // Move meteors
            meteors.forEach((meteor, index) => {
                meteor.position.y -= meteor.userData.velocity;
                meteor.position.z += gameState.speed;
                
                if (meteor.position.y < 1 && 
                    Math.abs(meteor.position.z - carGroup.position.z) < 2 && 
                    Math.abs(meteor.position.x - carGroup.position.x) < 2) {
                    
                    updateScore(-20);
                    playSound('bad');
                    screenShake();
                    showNotification('-20 Meteor Hit!', '#ff8800');
                    
                    // Spin car
                    let spinAmount = 0;
                    const spinInterval = setInterval(() => {
                        carGroup.rotation.y += 0.2;
                        spinAmount += 0.2;
                        if (spinAmount >= Math.PI * 2) {
                            carGroup.rotation.y = 0;
                            clearInterval(spinInterval);
                        }
                    }, 16);
                    
                    scene.remove(meteor);
                    meteors.splice(index, 1);
                }
                
                if (meteor.position.y < -1 || meteor.position.z > 20) {
                    scene.remove(meteor);
                    meteors.splice(index, 1);
                }
            });

            // Spawn gates at reasonable rate
            if (gates.length < 5) {
                spawnGates();
            }
            
            // Spawn powerups occasionally
            if (Math.random() > 0.99) {
                spawnPowerup();
            }

            // FUD Storm
            gameState.fudStormTimer += deltaTime;
            const stormInterval = Math.max(8000, gameState.fudStormInterval - (gameState.score / 100) * 100);
            if (gameState.fudStormTimer > stormInterval) {
                spawnFudStorm();
                gameState.fudStormTimer = 0;
            }

            // Gacha spawn
            gameState.gachaTimer += deltaTime;
            if (gameState.gachaTimer > 12000 && Math.random() > 0.7) {
                spawnGachaBox();
                gameState.gachaTimer = 0;
            }

            renderer.render(scene, camera);
        }

        // Initialize
        startCountdown();
        spawnGates();
        animate();
    </script>
</body>
</html>
      ` }} />
    </>
  );
}













