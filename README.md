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
