from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Define the runway position
RUNWAY_POSITION = {"x": 250, "y": 400}

# Drone state
drone_state = {
    "altitude": 0,
    "x": RUNWAY_POSITION["x"],  # Start at the runway x-coordinate
    "y": RUNWAY_POSITION["y"],  # Start at the runway y-coordinate
    "status": "landed"
}

@app.route('/')
def home():
    return render_template('index.html')  # Corrected function name

@app.route('/takeoff', methods=['POST'])
def takeoff():
    if drone_state["status"] == "landed":
        drone_state["status"] = "hovering"
        drone_state["altitude"] = 10  # Simulate takeoff to 10 meters
        return jsonify({"message": "Drone took off from the runway!", "state": drone_state})
    return jsonify({"message": "Drone is already in the air.", "state": drone_state})

@app.route('/move', methods=['POST'])
def move():
    data = request.json
    direction = data.get("direction", "")
    distance = data.get("distance", 0)

    if drone_state["status"] == "hovering":
        if direction == "forward":
            drone_state["y"] -= distance
        elif direction == "backward":
            drone_state["y"] += distance
        elif direction == "left":
            drone_state["x"] -= distance
        elif direction == "right":
            drone_state["x"] += distance
        return jsonify({"message": f"Drone moved {direction}.", "state": drone_state})
    return jsonify({"message": "Drone is not in the air.", "state": drone_state})

@app.route('/land', methods=['POST'])
def land():
    if drone_state["status"] == "hovering":
        drone_state["status"] = "landed"
        drone_state["altitude"] = 0
        # Reset to the predefined runway position
        drone_state["x"] = RUNWAY_POSITION["x"]
        drone_state["y"] = RUNWAY_POSITION["y"]
        return jsonify({"message": "Drone landed back on the runway!", "state": drone_state})
    return jsonify({"message": "Drone is already on the ground.", "state": drone_state})

@app.route('/status', methods=['GET'])
def status():
    return jsonify(drone_state)

if __name__ == "__main__":
    app.run(debug=True)
