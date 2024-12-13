const canvas = document.getElementById('droneCanvas');
const ctx = canvas.getContext('2d');

let dronePosition = { x: 200, y: 200 }; // Initial position in the center

function drawDrone() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "blue";
    ctx.fillRect(dronePosition.x, dronePosition.y, 10, 10);
}

function sendCommand(action, direction = null, distance = 0) {
    let endpoint = `/${action}`;
    let data = {};
    if (action === 'move') {
        data = { direction, distance };
    }

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            if (action === 'move') {
                if (direction === 'forward') dronePosition.y -= distance * 10;
                if (direction === 'backward') dronePosition.y += distance * 10;
                if (direction === 'left') dronePosition.x -= distance * 10;
                if (direction === 'right') dronePosition.x += distance * 10;
            }
            drawDrone();
        })
        .catch(error => console.error('Error:', error));
}

// Initialize canvas
drawDrone();
