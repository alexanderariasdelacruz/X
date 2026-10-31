
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const W = 900;
const H = 500;

let player;
let pillars = [];
let score = 0;
let playing = false;
let frame;
let lastTime = 0;

const gravity = 0.32;
const impulse = -5.8;

function reset() {
    player = {
        x: 150,
        y: 250,
        size: 18,
        velocity: 0
    };

    pillars = [];
    score = 0;

    for (let i = 0; i < 4; i++) {
        createPillar(500 + i * 260);
    }

    document.getElementById("score").textContent = 0;
}

function createPillar(x) {
    const gap = 155;
    const opening = 70 + Math.random() * 260;

    pillars.push({
        x: x,
        width: 65,
        opening: opening,
        gap: gap,
        passed: false
    });
}

function drawBackground() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, W, H);
}

function drawPlayer() {
    ctx.fillStyle = "#0066ff";

    ctx.fillRect(
        player.x - player.size / 2,
        player.y - player.size / 2,
        player.size,
        player.size
    );
}

function drawPillars() {
    ctx.fillStyle = "black";

    pillars.forEach(p => {
        ctx.fillRect(
            p.x,
            0,
            p.width,
            p.opening
        );

        ctx.fillRect(
            p.x,
            p.opening + p.gap,
            p.width,
            H - (p.opening + p.gap)
        );
    });
}

function collision() {
    const half = player.size / 2;

    if (
        player.y - half <= 0 ||
        player.y + half >= H
    ) {
        return true;
    }

    for (const p of pillars) {
        const horizontal =
            player.x + half > p.x &&
            player.x - half < p.x + p.width;

        const vertical =
            player.y - half < p.opening ||
            player.y + half > p.opening + p.gap;

        if (horizontal && vertical) {
            return true;
        }
    }

    return false;
}

function update(delta) {
    // Gravedad
    player.velocity += gravity * delta;

    player.velocity = Math.min(
        player.velocity,
        7
    );

    player.y += player.velocity * delta;

    // Movimiento de pilares
    pillars.forEach(p => {
        p.x -= 3 * delta;

        if (!p.passed && p.x + p.width < player.x) {
            p.passed = true;
            score++;

            document.getElementById("score").textContent = score;
        }
    });

    // Nuevos obstáculos
    if (pillars[0].x + pillars[0].width < 0) {
        pillars.shift();

        const last = pillars[pillars.length - 1];

        createPillar(last.x + 260);
    }

    if (collision()) {
        endGame();
    }
}

function draw() {
    drawBackground();
    drawPillars();
    drawPlayer();
}

function loop(time) {
    if (!playing) return;

    const delta = lastTime
        ? Math.min((time - lastTime) / 16.67, 2)
        : 1;

    lastTime = time;

    update(delta);
    draw();

    if (playing) {
        frame = requestAnimationFrame(loop);
    }
}

function jump() {
    if (playing) {
        player.velocity = impulse;
    }
}

function startGame() {
    cancelAnimationFrame(frame);

    reset();

    playing = true;
    lastTime = 0;

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("gameOver").classList.add("hidden");

    loop(performance.now());
}

function endGame() {
    playing = false;

    document.getElementById("finalScore").textContent = score;

    document.getElementById("gameOver").classList.remove("hidden");
}

// Clic y pantalla táctil
canvas.addEventListener("pointerdown", e => {
    e.preventDefault();
    jump();
});

// Teclado
document.addEventListener("keydown", e => {
    if (
        e.code === "Space" ||
        e.code === "ArrowUp"
    ) {
        e.preventDefault();

        if (!e.repeat) {
            jump();
        }
    }
});

// Evitar desplazamiento de pantalla
document.addEventListener("keyup", e => {
    if (
        e.code === "Space" ||
        e.code === "ArrowUp"
    ) {
        e.preventDefault();
    }
});

document.getElementById("start").onclick = startGame;
document.getElementById("restart").onclick = startGame;

reset();
draw();
                    
