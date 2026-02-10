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

### Objective
Implement automatic wiring between components and the Arduino Uno, with support for user-controlled digital pin reassignment through the interface.

---

### Features

#### 1. Automatic Pin Wiring
- Components are automatically connected to the Arduino Uno when placed on the canvas
- Default pin configuration is applied on initialization:
  - LED → Digital Pin 10
  - Push Button → Digital Pin 2
- Arduino code is generated automatically based on this wiring

---

#### 2. Configurable Pin Assignment
- Users can change Arduino pin assignments using UI controls
- Only Arduino digital pins **2 to 13** are available for selection
- Each Arduino pin can be assigned to **only one component** at a time

---

#### 3. Conflict Prevention Logic
- Pins already assigned to one component are disabled for others
- If a pin is selected for the LED, it cannot be used for the push button
- If a pin is selected for the push button, it cannot be used for the LED
- Invalid or conflicting selections are prevented in real time

---

#### 4. Code Synchronization
- Any change in pin configuration:
  - Updates the internal wiring logic
  - Regenerates the Arduino code dynamically
  - Keeps the simulation behavior consistent with the selected pins

---

### Technology & Tools
- HTML
- CSS
- JavaScript
- Wokwi elements for Arduino simulation

---

### Expected Outcome
- Components are automatically wired using valid Arduino pins
- Users can reassign pins without causing conflicts
- Generated Arduino code always matches the current wiring configuration
---

## Task 2 – Auto-Wiring Logic with Configurable Pins

### Objective
Implement automatic wiring between components and the Arduino Uno, with support for user-controlled digital pin reassignment through the interface.

---

### Features

#### 1. Automatic Pin Wiring
- Components are automatically connected to the Arduino Uno when placed on the canvas
- Default pin configuration is applied on initialization:
  - LED → Digital Pin 10
  - Push Button → Digital Pin 2
- Arduino code is generated automatically based on this wiring

---

#### 2. Configurable Pin Assignment
- Users can change Arduino pin assignments using UI controls
- Only Arduino digital pins **2 to 13** are available for selection
- Each Arduino pin can be assigned to **only one component** at a time

---

#### 3. Conflict Prevention Logic
- Pins already assigned to one component are disabled for others
- If a pin is selected for the LED, it cannot be used for the push button
- If a pin is selected for the push button, it cannot be used for the LED
- Invalid or conflicting selections are prevented in real time

---

#### 4. Code Synchronization
- Any change in pin configuration:
  - Updates the internal wiring logic
  - Regenerates the Arduino code dynamically
  - Keeps the simulation behavior consistent with the selected pins

---

### Technology & Tools
- HTML
- CSS
- JavaScript
- Wokwi elements for Arduino simulation

---
## Task 2 – Auto-Wiring Logic with Configurable Pins

### Objective
Implement automatic wiring between components and the Arduino Uno, with support for user-controlled digital pin reassignment through the interface.

---

### Features

#### 1. Automatic Pin Wiring
- Components are automatically connected to the Arduino Uno when placed on the canvas
- Default pin configuration is applied on initialization:
  - LED → Digital Pin 10
  - Push Button → Digital Pin 2
- Arduino code is generated automatically based on this wiring

---

#### 2. Configurable Pin Assignment
- Users can change Arduino pin assignments using UI controls
- Only Arduino digital pins **2 to 13** are available for selection
- Each Arduino pin can be assigned to **only one component** at a time

---

#### 3. Conflict Prevention Logic
- Pins already assigned to one component are disabled for others
- If a pin is selected for the LED, it cannot be used for the push button
- If a pin is selected for the push button, it cannot be used for the LED
- Invalid or conflicting selections are prevented in real time

---

#### 4. Code Synchronization
- Any change in pin configuration:
  - Updates the internal wiring logic
  - Regenerates the Arduino code dynamically
  - Keeps the simulation behavior consistent with the selected pins

---

### Technology & Tools
- HTML
- CSS
- JavaScript
- Wokwi elements for Arduino simulation

---
## Task 3 – Auto Code Generation & Logic-Level Simulation(still working)

### Objective
Automatically generate Arduino code based on the current circuit wiring and simulate the circuit behavior at a logic level, ensuring full synchronization between pin configuration, wiring logic, and code—without any manual edits.

---

### Features

#### 1. Automatic Arduino Code Generation
Arduino code is generated dynamically based on current pin assignments
Generated code always includes:
pinMode() for proper pin configuration
digitalRead() to read button state
digitalWrite() to control LED state
Code reflects the exact wiring shown in the circuit

---

#### 2. Real-Time Pin Synchronization
When a pin assignment is changed through the UI:
Internal wiring logic updates automatically
Arduino code regenerates instantly
No manual code modification is required
Ensures wiring ↔ code ↔ simulation consistency at all times

---

#### 3.Logic-Level Simulation
Simulation operates at logic level (no analog behavior)
Behavior directly follows digitalRead() and digitalWrite() logic

---

#### 4. Deterministic & Predictable Behavior
Simulation output is fully deterministic based on:
Pin configuration
Button state
No timing, PWM, or analog noise involved
Ideal for beginners and logic validation

---

### Technology & Tools
- HTML
- CSS
- JavaScript
- Wokwi elements for Arduino simulation
