// Arduino Simulator - Task 3: Complete Implementation

class ArduinoSimulator {
    constructor() {
        this.state = {
            components: [],
            view: 'component',
            simulationRunning: false,
            nextId: 1,
            pinMapping: {
                led: 10,     // Default: Digital Pin 10
                button: 2    // Default: Digital Pin 2
            },
            availablePins: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            connections: [],
            logicState: {
                button: false,  // false = LOW, true = HIGH
                led: false      // false = OFF, true = ON
            },
            simulationInterval: null
        };
        
        this.init();
    }
    
    init() {
        this.cacheDOM();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.updateUI();
    }
    
    cacheDOM() {
        this.componentCards = document.querySelectorAll('.component-card');
        this.canvas = document.getElementById('canvas');
        this.componentView = document.getElementById('componentView');
        this.codeView = document.getElementById('codeView');
        this.componentViewBtn = document.getElementById('componentViewBtn');
        this.codeViewBtn = document.getElementById('codeViewBtn');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.copyCodeBtn = document.getElementById('copyCodeBtn');
        this.statusMessage = document.getElementById('statusMessage');
        this.componentCount = document.getElementById('componentCount');
        this.generatedCode = document.getElementById('generatedCode');
        this.pinConfig = document.getElementById('pinConfig');
        this.autoWireBtn = document.getElementById('autoWireBtn');
        this.wiringSvg = document.getElementById('wiringSvg');
        this.wiringStatus = document.getElementById('wiringStatus');
        this.connectionCount = document.getElementById('connectionCount');
        this.pinsUsed = document.getElementById('pinsUsed');
        
        this.dropIndicator = document.createElement('div');
        this.dropIndicator.className = 'drop-indicator';
        this.canvas.appendChild(this.dropIndicator);
    }
    
    setupEventListeners() {
        this.componentViewBtn.addEventListener('click', () => this.switchView('component'));
        this.codeViewBtn.addEventListener('click', () => this.switchView('code'));
        this.startBtn.addEventListener('click', () => this.startSimulation());
        this.stopBtn.addEventListener('click', () => this.stopSimulation());
        this.copyCodeBtn.addEventListener('click', () => this.copyCodeToClipboard());
        this.autoWireBtn.addEventListener('click', () => this.autoWireComponents());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    // ========== DRAG AND DROP ==========
    
    setupDragAndDrop() {
        this.componentCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                this.handleDragStart(e);
            });
            card.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                this.updateStatus('Ready');
            });
        });
        
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.canvas.classList.add('drag-over');
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.dropIndicator.style.left = (x - 25) + 'px';
            this.dropIndicator.style.top = (y - 25) + 'px';
            this.dropIndicator.style.display = 'block';
        });
        
        this.canvas.addEventListener('dragleave', (e) => {
            if (!this.canvas.contains(e.relatedTarget)) {
                this.canvas.classList.remove('drag-over');
                this.dropIndicator.style.display = 'none';
            }
        });
        
        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            this.canvas.classList.remove('drag-over');
            this.dropIndicator.style.display = 'none';
            
            const componentType = e.dataTransfer.getData('text/plain');
            if (!componentType) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.addComponent(componentType, x, y);
        });
    }
    
    handleDragStart(e) {
        const componentCard = e.target.closest('.component-card');
        if (!componentCard) return;
        
        const componentType = componentCard.dataset.type;
        e.dataTransfer.setData('text/plain', componentType);
        
        componentCard.classList.add('dragging');
        this.updateStatus(`Dragging ${componentType}...`);
        
        const dragImage = componentCard.cloneNode(true);
        dragImage.style.position = 'fixed';
        dragImage.style.top = '-1000px';
        dragImage.style.opacity = '0.7';
        document.body.appendChild(dragImage);
        
        const rect = componentCard.getBoundingClientRect();
        e.dataTransfer.setDragImage(dragImage, rect.width/2, rect.height/2);
        
        setTimeout(() => document.body.removeChild(dragImage), 0);
    }
    
    // ========== COMPONENT MANAGEMENT ==========
    
    addComponent(type, x, y) {
        if (type === 'arduino') {
            const hasArduino = this.state.components.some(c => c.type === 'arduino');
            if (hasArduino) {
                this.updateStatus('Arduino already on canvas!');
                return;
            }
        }
        
        const component = {
            id: `comp-${this.state.nextId++}`,
            type: type,
            x: Math.max(10, x - 40),
            y: Math.max(10, y - 40),
            label: this.getComponentLabel(type),
            pin: this.getDefaultPin(type)
        };
        
        this.state.components.push(component);
        this.renderComponent(component);
        
        this.updatePinConfigurationUI();
        
        if (this.shouldAutoWire()) {
            setTimeout(() => this.autoWireComponents(), 100);
        }
        
        this.updateUI();
        this.updateStatus(`${component.label} added to canvas`);
    }
    
    getComponentLabel(type) {
        const labels = {
            'arduino': 'Arduino Uno',
            'led': 'LED',
            'button': 'Push Button'
        };
        return labels[type] || type;
    }
    
    getDefaultPin(componentType) {
        return this.state.pinMapping[componentType] || null;
    }
    
    renderComponent(component) {
        const element = document.createElement('div');
        element.id = component.id;
        element.className = 'canvas-component';
        element.style.left = component.x + 'px';
        element.style.top = component.y + 'px';
        
        let wokwiElement = '';
        switch(component.type) {
            case 'arduino':
                wokwiElement = '<wokwi-arduino-uno scale="0.25"></wokwi-arduino-uno>';
                break;
            case 'led':
                wokwiElement = '<wokwi-led color="red" scale="0.7"></wokwi-led>';
                break;
            case 'button':
                wokwiElement = '<wokwi-pushbutton scale="0.7"></wokwi-pushbutton>';
                break;
        }
        
        element.innerHTML = `
            <div class="component-wrapper">
                ${wokwiElement}
                <div class="component-label">${component.label}</div>
            </div>
        `;
        
        this.makeComponentDraggable(element, component.id);
        
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, component.id);
        });
        
        this.canvas.appendChild(element);
        
        element.style.transform = 'scale(0.8)';
        setTimeout(() => {
            element.style.transition = 'transform 0.3s ease';
            element.style.transform = 'scale(1)';
        }, 10);
    }
    
    makeComponentDraggable(element, componentId) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        
        const mouseDown = (e) => {
            if (e.button !== 0) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = element.getBoundingClientRect();
            initialLeft = rect.left - this.canvas.getBoundingClientRect().left;
            initialTop = rect.top - this.canvas.getBoundingClientRect().top;
            
            element.style.zIndex = '1000';
            element.style.cursor = 'grabbing';
            
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', mouseUp);
            
            e.preventDefault();
        };
        
        const mouseMove = (e) => {
            if (!isDragging) return;
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;
            
            const canvasRect = this.canvas.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            
            newLeft = Math.max(0, Math.min(newLeft, canvasRect.width - elementRect.width));
            newTop = Math.max(0, Math.min(newTop, canvasRect.height - elementRect.height));
            
            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
            
            const component = this.state.components.find(c => c.id === componentId);
            if (component) {
                component.x = newLeft;
                component.y = newTop;
            }
        };
        
        const mouseUp = () => {
            if (!isDragging) return;
            
            isDragging = false;
            element.style.zIndex = '10';
            element.style.cursor = 'move';
            
            document.removeEventListener('mousemove', mouseMove);
            document.removeEventListener('mouseup', mouseUp);
            
            this.redrawWires();
        };
        
        element.addEventListener('mousedown', mouseDown);
    }
    
    // ========== TASK 3: AUTO CODE GENERATION ==========
    
    generateCode() {
        const components = this.state.components.filter(c => 
            c.type === 'led' || c.type === 'button'
        );
        
        if (components.length === 0) {
            this.generatedCode.textContent = `// Arduino Code - Auto Generated
// Add components to canvas to generate code

void setup() {
  Serial.begin(9600);
  Serial.println("Arduino Simulator Ready");
}

void loop() {
  // Your circuit logic will appear here
}`;
            return;
        }
        
        // Generate pin declarations
        let pinDeclarations = '';
        let setupCode = '';
        let loopCode = '';
        
        const ledComponent = components.find(c => c.type === 'led');
        const buttonComponent = components.find(c => c.type === 'button');
        
        if (ledComponent) {
            pinDeclarations += `const int LED_PIN = ${ledComponent.pin};\n`;
            setupCode += `  pinMode(LED_PIN, OUTPUT);\n`;
        }
        
        if (buttonComponent) {
            pinDeclarations += `const int BUTTON_PIN = ${buttonComponent.pin};\n`;
            setupCode += `  pinMode(BUTTON_PIN, INPUT);\n`;
        }
        
        // Generate loop logic based on components
        if (ledComponent && buttonComponent) {
            // Full simulation: button controls LED
            loopCode = `  // Read button state
  int buttonState = digitalRead(BUTTON_PIN);
  
  // Control LED based on button
  if (buttonState == HIGH) {
    digitalWrite(LED_PIN, HIGH);  // Turn LED ON
  } else {
    digitalWrite(LED_PIN, LOW);   // Turn LED OFF
  }
  
  delay(10);  // Small delay for stability`;
        } else if (ledComponent) {
            // Only LED - blink pattern
            loopCode = `  // Blink LED
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);`;
        } else if (buttonComponent) {
            // Only Button - read state
            loopCode = `  // Read button
  int buttonState = digitalRead(BUTTON_PIN);
  Serial.print("Button: ");
  Serial.println(buttonState);
  delay(100);`;
        }
        
        // Add Serial.begin if we have a button
        if (buttonComponent) {
            setupCode = `  Serial.begin(9600);\n` + setupCode;
        }
        
        // Build complete code
        const code = `// ============================================
// Arduino Code - AUTO GENERATED
// Date: ${new Date().toLocaleString()}
// ============================================

${pinDeclarations}
void setup() {
${setupCode}}

void loop() {
${loopCode}
}

// ============================================
// Pin Configuration:
${components.map(c => `// ${c.label} → Pin ${c.pin}`).join('\n')}
// ============================================`;
        
        this.generatedCode.textContent = code;
    }
    
    // ========== TASK 3: LOGIC-LEVEL SIMULATION ==========
    
    startSimulation() {
        if (this.state.components.length === 0) {
            this.updateStatus('Add components first to simulate');
            return;
        }
        
        const ledComponent = this.state.components.find(c => c.type === 'led');
        const buttonComponent = this.state.components.find(c => c.type === 'button');
        
        if (!ledComponent && !buttonComponent) {
            this.updateStatus('Add LED or Button to simulate');
            return;
        }
        
        // Stop any existing simulation
        if (this.state.simulationRunning) {
            this.stopSimulation();
        }
        
        this.state.simulationRunning = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        
        // Update UI for simulation
        this.canvas.classList.add('simulation-running');
        this.updateStatus('Simulation running - Click button to test');
        
        // Setup button click handlers for simulation
        this.setupButtonHandlers();
        
        // Start simulation loop (10ms intervals)
        this.state.simulationInterval = setInterval(() => {
            this.updateSimulation();
        }, 10);
    }
    
    setupButtonHandlers() {
        const buttonComponent = this.state.components.find(c => c.type === 'button');
        if (!buttonComponent) return;
        
        const buttonElement = document.querySelector(`#${buttonComponent.id} wokwi-pushbutton`);
        if (!buttonElement) return;
        
        // Remove existing handlers
        buttonElement.onclick = null;
        
        // Add new handler for simulation
        buttonElement.onclick = () => {
            if (!this.state.simulationRunning) return;
            
            // Toggle button state
            const isPressed = buttonElement.hasAttribute('pressed');
            
            if (isPressed) {
                buttonElement.removeAttribute('pressed');
                this.state.logicState.button = false; // LOW
            } else {
                buttonElement.setAttribute('pressed', '');
                this.state.logicState.button = true; // HIGH
            }
            
            // Immediately update LED based on button state
            this.updateLEDState();
            
            // Update status
            this.updateStatus(`Button ${this.state.logicState.button ? 'PRESSED (HIGH)' : 'RELEASED (LOW)'}`);
        };
    }
    
    updateSimulation() {
        if (!this.state.simulationRunning) return;
        
        // Get current components
        const ledComponent = this.state.components.find(c => c.type === 'led');
        const buttonComponent = this.state.components.find(c => c.type === 'button');
        
        if (!ledComponent && !buttonComponent) {
            this.stopSimulation();
            return;
        }
        
        // Update LED state based on button
        this.updateLEDState();
    }
    
    updateLEDState() {
        const ledComponent = this.state.components.find(c => c.type === 'led');
        const buttonComponent = this.state.components.find(c => c.type === 'button');
        
        if (!ledComponent || !buttonComponent) return;
        
        const ledElement = document.querySelector(`#${ledComponent.id} wokwi-led`);
        if (!ledElement) return;
        
        // Logic: Button pressed → LED ON, Button released → LED OFF
        if (this.state.logicState.button) {
            ledElement.setAttribute('lit', '');
            this.state.logicState.led = true;
        } else {
            ledElement.removeAttribute('lit');
            this.state.logicState.led = false;
        }
    }
    
    stopSimulation() {
        this.state.simulationRunning = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        // Clear simulation interval
        if (this.state.simulationInterval) {
            clearInterval(this.state.simulationInterval);
            this.state.simulationInterval = null;
        }
        
        // Reset visual states
        this.canvas.classList.remove('simulation-running');
        
        // Reset component states
        this.state.logicState.button = false;
        this.state.logicState.led = false;
        
        // Remove lit/pressed attributes
        this.state.components.forEach(component => {
            const element = document.querySelector(`#${component.id} wokwi-led, #${component.id} wokwi-pushbutton`);
            if (element) {
                element.removeAttribute('lit');
                element.removeAttribute('pressed');
            }
        });
        
        this.updateStatus('Simulation stopped');
    }
    
    // ========== AUTO-WIRING ==========
    
    shouldAutoWire() {
        const hasArduino = this.state.components.some(c => c.type === 'arduino');
        const hasOtherComponents = this.state.components.some(c => 
            c.type === 'led' || c.type === 'button'
        );
        return hasArduino && hasOtherComponents;
    }
    
    autoWireComponents() {
        this.state.connections = [];
        this.clearWiring();
        
        const arduino = this.state.components.find(c => c.type === 'arduino');
        if (!arduino) {
            this.updateStatus("Add Arduino first to create connections");
            return;
        }
        
        this.state.components.forEach(component => {
            if (component.type === 'led' || component.type === 'button') {
                const connection = {
                    from: component.id,
                    to: arduino.id,
                    componentType: component.type,
                    pin: component.pin
                };
                this.state.connections.push(connection);
                this.drawWire(component, arduino, component.type);
            }
        });
        
        // Generate code after wiring
        this.generateCode();
        
        this.updateUI();
        this.updateStatus(`Auto-wired ${this.state.connections.length} connections`);
        this.wiringStatus.textContent = `${this.state.connections.length} connections active`;
        this.wiringStatus.classList.add('connected');
    }
    
    drawWire(fromComponent, toComponent, wireType) {
        const fromEl = document.getElementById(fromComponent.id);
        const toEl = document.getElementById(toComponent.id);
        
        if (!fromEl || !toEl) return;
        
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const x1 = fromRect.left - canvasRect.left + fromRect.width / 2;
        const y1 = fromRect.top - canvasRect.top + fromRect.height / 2;
        const x2 = toRect.left - canvasRect.left + 20;
        const y2 = toRect.top - canvasRect.top + 40;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', `wire ${wireType}-wire`);
        this.wiringSvg.appendChild(line);
        
        this.addPinIndicator(fromComponent.id, fromComponent.pin);
    }
    
    addPinIndicator(componentId, pin) {
        const component = document.getElementById(componentId);
        if (!component) return;
        
        const existing = component.querySelector('.pin-indicator');
        if (existing) existing.remove();
        
        const indicator = document.createElement('div');
        indicator.className = 'pin-indicator';
        indicator.textContent = `D${pin}`;
        component.appendChild(indicator);
    }
    
    clearWiring() {
        this.wiringSvg.innerHTML = '';
        document.querySelectorAll('.pin-indicator').forEach(ind => ind.remove());
        this.wiringStatus.textContent = 'No connections yet';
        this.wiringStatus.classList.remove('connected');
    }
    
    redrawWires() {
        this.clearWiring();
        
        const arduino = this.state.components.find(c => c.type === 'arduino');
        if (!arduino) return;
        
        this.state.components.forEach(component => {
            if (component.type === 'led' || component.type === 'button') {
                this.drawWire(component, arduino, component.type);
            }
        });
    }
    
    // ========== PIN CONFIGURATION ==========
    
    updatePinConfigurationUI() {
        this.pinConfig.innerHTML = '';
        
        const configurableComponents = this.state.components.filter(c => 
            c.type === 'led' || c.type === 'button'
        );
        
        if (configurableComponents.length === 0) {
            this.pinConfig.innerHTML = `
                <div class="config-placeholder">
                    Add LED or Button to configure pins
                </div>
            `;
            return;
        }
        
        configurableComponents.forEach(component => {
            const pinControl = this.createPinControl(component);
            this.pinConfig.appendChild(pinControl);
        });
    }
    
    createPinControl(component) {
        const div = document.createElement('div');
        div.className = 'pin-control';
        div.dataset.componentId = component.id;
        
        const usedPins = this.getUsedPins(component.id);
        const availableOptions = this.generatePinOptions(usedPins, component.pin);
        
        div.innerHTML = `
            <div class="pin-header">
                <div class="component-name">${component.label}</div>
                <div class="current-pin">Pin ${component.pin}</div>
            </div>
            <div class="pin-selector">
                <label>Digital Pin:</label>
                <select class="pin-dropdown" 
                        onchange="simulator.changePin('${component.id}', this.value)">
                    ${availableOptions}
                </select>
            </div>
        `;
        
        return div;
    }
    
    getUsedPins(excludeComponentId) {
        const usedPins = new Set();
        this.state.components.forEach(comp => {
            if (comp.id !== excludeComponentId && comp.pin) {
                usedPins.add(comp.pin);
            }
        });
        return usedPins;
    }
    
    generatePinOptions(usedPins, currentPin) {
        let options = '<option value="">Select Pin</option>';
        this.state.availablePins.forEach(pin => {
            const isUsed = usedPins.has(pin);
            const isSelected = pin === currentPin;
            options += `
                <option value="${pin}" 
                    ${isSelected ? 'selected' : ''}
                    ${isUsed && !isSelected ? 'disabled' : ''}>
                    Digital Pin ${pin}
                    ${isUsed && !isSelected ? ' (Used)' : ''}
                </option>
            `;
        });
        return options;
    }
    
    changePin(componentId, newPin) {
        if (!newPin) return;
        
        const pinNum = parseInt(newPin);
        const component = this.state.components.find(c => c.id === componentId);
        
        if (!component) return;
        
        // Check if pin is already used
        const usedByOther = this.state.components.some(c => 
            c.id !== componentId && c.pin === pinNum
        );
        
        if (usedByOther) {
            this.updateStatus(`Pin ${pinNum} is already in use!`);
            return;
        }
        
        // Update component pin
        component.pin = pinNum;
        this.state.pinMapping[component.type] = pinNum;
        
        // Update UI
        this.updatePinConfigurationUI();
        this.addPinIndicator(componentId, pinNum);
        
        // Regenerate code with new pin
        this.generateCode();
        
        // Redraw wires
        this.redrawWires();
        
        // Restart simulation if running
        if (this.state.simulationRunning) {
            this.restartSimulation();
        }
        
        this.updateStatus(`${component.label} changed to Pin ${pinNum}`);
    }
    
    restartSimulation() {
        const wasRunning = this.state.simulationRunning;
        if (wasRunning) {
            this.stopSimulation();
            setTimeout(() => {
                this.startSimulation();
            }, 100);
        }
    }
    
    // ========== UI METHODS ==========
    
    switchView(view) {
        this.state.view = view;
        this.componentViewBtn.classList.toggle('active', view === 'component');
        this.codeViewBtn.classList.toggle('active', view === 'code');
        this.componentView.classList.toggle('active', view === 'component');
        this.codeView.classList.toggle('active', view === 'code');
        
        if (view === 'code') {
            this.generateCode();
        }
        
        this.updateStatus(view === 'component' ? 'Component View' : 'Code View');
    }
    
    showContextMenu(e, componentId) {
        e.preventDefault();
        
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            min-width: 150px;
            overflow: hidden;
        `;
        
        menu.innerHTML = `
            <div class="menu-item" onclick="simulator.deleteComponent('${componentId}')">
                🗑️ Delete Component
            </div>
        `;
        
        document.body.appendChild(menu);
        
        const closeMenu = () => {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);
    }
    
    deleteComponent(componentId) {
        const element = document.getElementById(componentId);
        if (element) {
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '0';
            element.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                element.remove();
            }, 300);
        }
        
        this.state.components = this.state.components.filter(c => c.id !== componentId);
        this.state.connections = this.state.connections.filter(
            conn => conn.from !== componentId
        );
        
        this.updatePinConfigurationUI();
        this.clearWiring();
        this.redrawWires();
        this.generateCode();
        this.updateUI();
        
        if (this.state.simulationRunning) {
            this.restartSimulation();
        }
        
        this.updateStatus('Component deleted');
    }
    
    copyCodeToClipboard() {
        navigator.clipboard.writeText(this.generatedCode.textContent)
            .then(() => {
                const original = this.copyCodeBtn.innerHTML;
                this.copyCodeBtn.innerHTML = '<span>✅ Copied!</span>';
                setTimeout(() => {
                    this.copyCodeBtn.innerHTML = original;
                }, 2000);
                this.updateStatus('Code copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                this.updateStatus('Failed to copy code');
            });
    }
    
    handleKeyPress(e) {
        if (e.ctrlKey && e.key === '1') {
            e.preventDefault();
            this.switchView('component');
        } else if (e.ctrlKey && e.key === '2') {
            e.preventDefault();
            this.switchView('code');
        } else if (e.key === 'Delete' && this.state.components.length > 0) {
            const last = this.state.components[this.state.components.length - 1];
            this.deleteComponent(last.id);
        }
    }
    
    updateUI() {
        this.componentCount.textContent = this.state.components.length;
        this.connectionCount.textContent = this.state.connections.length;
        
        const usedPins = this.state.components
            .filter(c => c.pin)
            .map(c => `D${c.pin}`)
            .join(', ');
        this.pinsUsed.textContent = usedPins || 'None';
        
        const placeholder = this.canvas.querySelector('.canvas-placeholder');
        if (placeholder) {
            placeholder.style.display = this.state.components.length > 0 ? 'none' : 'block';
        }
    }
    
    updateStatus(message) {
        this.statusMessage.textContent = message;
        console.log(`Status: ${message}`);
    }
}

// Initialize simulator
let simulator;

document.addEventListener('DOMContentLoaded', () => {
    simulator = new ArduinoSimulator();
    window.simulator = simulator;
});