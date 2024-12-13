const canvas = document.getElementById('droneCanvas');
const ctx = canvas.getContext('2d');
const statusDiv = document.getElementById('status');

const RUNWAY_POSITION = { x: 250, y: 400 }; // Fixed runway position
let droneState = { altitude: 0, x: RUNWAY_POSITION.x, y: RUNWAY_POSITION.y, status: "landed" };
let clouds = [];
const MAX_ALTITUDE = 200;

// Create clouds
function createClouds() {
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 100, // Clouds in the upper part of the canvas
            speed: Math.random() * 0.5 + 0.1 // Speed of cloud movement
        });
    }
}

// Draw clouds
function drawClouds() {
    ctx.fillStyle = "#FFFFFF"; // Cloud color
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 50, 0, Math.PI * 2);
        ctx.arc(cloud.x + 60, cloud.y + 20, 50, 0, Math.PI * 2);
        ctx.arc(cloud.x + 120, cloud.y, 50, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Move clouds horizontally
function moveClouds() {
    clouds.forEach(cloud => {
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width) {
            cloud.x = -200; // Reset cloud position when it moves off screen
        }
    });
}

function drawCanvas() {
    // Sky background gradient
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB'); // Light sky blue
    gradient.addColorStop(1, '#ADD8E6'); // Light sky blue

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawClouds(); // Draw animated clouds
    moveClouds(); // Move the clouds across the screen

    // Runway
    ctx.fillStyle = "#888";
    ctx.fillRect(RUNWAY_POSITION.x - 20, RUNWAY_POSITION.y - 10, 40, 20);

    // Drone scaling based on altitude
    const scale = 1 - (droneState.altitude / MAX_ALTITUDE) * 0.5;

    // Drone body
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(droneState.x, droneState.y - (10 * scale), 20 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Propellers
    const propellerOffset = 25 * scale;
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(droneState.x - propellerOffset, droneState.y - propellerOffset - (10 * scale), 5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(droneState.x + propellerOffset, droneState.y - propellerOffset - (10 * scale), 5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(droneState.x - propellerOffset, droneState.y + propellerOffset - (10 * scale), 5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(droneState.x + propellerOffset, droneState.y + propellerOffset - (10 * scale), 5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Altitude display
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.fillText(`Altitude: ${droneState.altitude}m`, 10, 20);
    ctx.fillText(`Position: (${droneState.x}, ${droneState.y})`, 10, 40);
}

async function sendCommand(endpoint) {
    try {
        const response = await fetch(endpoint, { method: 'POST' });
        const data = await response.json();
        droneState = data.state;
        updateStatus(data.message);
        drawCanvas();

        if (endpoint === '/takeoff') {
            setTimeout(() => sendMoveCommand('forward', 50), 1000);
        }
    } catch (error) {
        console.error(error);
    }
}

async function sendMoveCommand(direction, distance) {
    try {
        let newX = droneState.x;
        let newY = droneState.y;

        switch (direction) {
            case 'forward':
                newY -= distance;
                break;
            case 'backward':
                newY += distance;
                break;
            case 'left':
                newX -= distance;
                break;
            case 'right':
                newX += distance;
                break;
        }

        newX = Math.max(10, Math.min(newX, canvas.width - 10));
        newY = Math.max(10, Math.min(newY, canvas.height - 10));

        droneState = { ...droneState, x: newX, y: newY };
        updateStatus(`Moving ${direction}`);
        drawCanvas();
    } catch (error) {
        console.error(error);
    }
}

function updateStatus(message) {
    statusDiv.textContent = `Status: ${message}`;
}

// Initialize cloud array and start drawing
createClouds();
setInterval(drawCanvas, 30); // Redraw every 30ms to animate



