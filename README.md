# Task 1 – Web-Based Interface & Component Handling

## Objective
Design and develop a web-based interface that allows users to visually create a simple Arduino experiment by dragging and placing components, and automatically generates corresponding Arduino code.

---

## Features

### 1. Component Palette
- A component palette is displayed on the **left side** of the screen.
- Available components:
  - Arduino Uno
  - LED
  - Push Button
- Components can be **dragged and dropped** from the palette into the workspace.

---

### 2. Working Area (Canvas)
- A **central canvas** is provided where users can:
  - Place components
  - Arrange them visually
  - Build a simple Arduino circuit
- The canvas acts as the main circuit-building area.

---

### 3. Component View & Code View
- A **toolbar option** is available to switch between:
  - **Component View** – shows the visual circuit
  - **Code View** – placeholder that displays automatically generated Arduino code
- When Code View is selected:
  - The Arduino code is generated dynamically
  - The circuit remains visible for better understanding

---

### 4. Simulation Controls
- **Start** button to run the simulation
- **Stop** button to halt the simulation
- Buttons are placed directly on the canvas for easy access

---

## Technology & Tools
- HTML, CSS, JavaScript
- Drag-and-drop API
- **Wokwi elements** for Arduino components and simulation  
  
---

## Expected Outcome
- Users can visually assemble a basic Arduino circuit
- Arduino code is generated automatically based on placed components
- Users can start and stop the simulation seamlessly

---

## Task 2 – Auto-Wiring Logic with Configurable Pins

In this task, automatic wiring logic was implemented for a simple Arduino setup using an Arduino Uno, an LED, and a push button.

### Default Wiring Behavior
- LED is connected to **Digital Pin 10**
- Push Button is connected to **Digital Pin 2**

This default configuration is applied automatically when the components are added, ensuring the simulation works without requiring manual wiring.

### Pin Reassignment via UI
Users are provided with a UI control to change the Arduino pin assignments for both the LED and the push button.

Invalid or conflicting pin selections are prevented in real time through the UI.


