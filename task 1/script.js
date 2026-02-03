// Arduino Simulator - Task 1
// Main Application

class ArduinoSimulator {
    constructor() {
        this.state = {
            components: [],
            view: 'component',
            simulationRunning: false,
            nextId: 1
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
        // Sidebar components
        this.componentCards = document.querySelectorAll('.component-card');
        
        // Canvas and views
        this.canvas = document.getElementById('canvas');
        this.componentView = document.getElementById('componentView');
        this.codeView = document.getElementById('codeView');
        
        // Buttons
        this.componentViewBtn = document.getElementById('componentViewBtn');
        this.codeViewBtn = document.getElementById('codeViewBtn');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.copyCodeBtn = document.getElementById('copyCodeBtn');
        
        // Status elements
        this.statusMessage = document.getElementById('statusMessage');
        this.componentCount = document.getElementById('componentCount');
        this.generatedCode = document.getElementById('generatedCode');
        
        // Create drop indicator
        this.dropIndicator = document.createElement('div');
        this.dropIndicator.className = 'drop-indicator';
        this.canvas.appendChild(this.dropIndicator);
    }
    
    setupEventListeners() {
        // View switching
        this.componentViewBtn.addEventListener('click', () => this.switchView('component'));
        this.codeViewBtn.addEventListener('click', () => this.switchView('code'));
        
        // Simulation controls
        this.startBtn.addEventListener('click', () => this.startSimulation());
        this.stopBtn.addEventListener('click', () => this.stopSimulation());
        
        // Copy code button
        this.copyCodeBtn.addEventListener('click', () => this.copyCodeToClipboard());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    setupDragAndDrop() {
        // Add drag events to all component cards
        this.componentCards.forEach(card => {
            card.addEventListener('dragstart', (e) => this.handleDragStart(e));
            card.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
        
        // Canvas drop zone events
        this.canvas.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.canvas.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.canvas.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Prevent default behaviors
        this.canvas.addEventListener('dragover', (e) => e.preventDefault());
        this.canvas.addEventListener('drop', (e) => e.preventDefault());
    }
    
    handleDragStart(e) {
        const componentType = e.target.closest('.component-card').dataset.type;
        e.dataTransfer.setData('text/plain', componentType);
        
        // Visual feedback
        e.target.classList.add('dragging');
        this.updateStatus(`Dragging ${componentType}...`);
        
        // Set custom drag image
        const dragImage = e.target.cloneNode(true);
        dragImage.style.opacity = '0.7';
        dragImage.style.position = 'fixed';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 50, 50);
        
        setTimeout(() => document.body.removeChild(dragImage), 0);
    }
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.updateStatus('Ready');
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.canvas.classList.add('drag-over');
        
        // Show drop indicator
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.dropIndicator.style.left = (x - 30) + 'px';
        this.dropIndicator.style.top = (y - 30) + 'px';
        this.dropIndicator.style.display = 'block';
    }
    
    handleDragLeave(e) {
        if (!this.canvas.contains(e.relatedTarget)) {
            this.canvas.classList.remove('drag-over');
            this.dropIndicator.style.display = 'none';
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.canvas.classList.remove('drag-over');
        this.dropIndicator.style.display = 'none';
        
        const componentType = e.dataTransfer.getData('text/plain');
        if (!componentType) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.addComponent(componentType, x, y);
    }
    
    addComponent(type, x, y) {
        const component = {
            id: `comp-${this.state.nextId++}`,
            type: type,
            x: Math.max(20, x - 40),
            y: Math.max(20, y - 40),
            label: this.getComponentLabel(type)
        };
        
        this.state.components.push(component);
        this.renderComponent(component);
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
    
    renderComponent(component) {
        const element = document.createElement('div');
        element.id = component.id;
        element.className = 'canvas-component';
        element.style.left = component.x + 'px';
        element.style.top = component.y + 'px';
        
        let wokwiElement = '';
        switch(component.type) {
            case 'arduino':
                wokwiElement = '<wokwi-arduino-uno scale="0.4"></wokwi-arduino-uno>';
                break;
            case 'led':
                wokwiElement = '<wokwi-led color="red" scale="1"></wokwi-led>';
                break;
            case 'button':
                wokwiElement = '<wokwi-pushbutton scale="1"></wokwi-pushbutton>';
                break;
        }
        
        element.innerHTML = `
            <div class="component-wrapper">
                ${wokwiElement}
                <div class="component-label">${component.label}</div>
            </div>
        `;
        
        // Make draggable on canvas
        this.makeDraggable(element, component.id);
        
        // Add context menu
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, component.id);
        });
        
        this.canvas.appendChild(element);
        
        // Animate drop
        element.style.transform = 'scale(0.8)';
        setTimeout(() => {
            element.style.transition = 'transform 0.3s ease';
            element.style.transform = 'scale(1)';
        }, 10);
    }
    
    makeDraggable(element, componentId) {
        let isDragging = false;
        let offsetX, offsetY;
        
        const mouseDown = (e) => {
            if (e.button !== 0) return; // Only left click
            
            isDragging = true;
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            element.style.zIndex = '1000';
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', mouseUp);
            
            e.preventDefault();
        };
        
        const mouseMove = (e) => {
            if (!isDragging) return;
            
            const canvasRect = this.canvas.getBoundingClientRect();
            let newX = e.clientX - canvasRect.left - offsetX;
            let newY = e.clientY - canvasRect.top - offsetY;
            
            // Constrain to canvas bounds
            newX = Math.max(0, Math.min(newX, this.canvas.clientWidth - element.offsetWidth));
            newY = Math.max(0, Math.min(newY, this.canvas.clientHeight - element.offsetHeight));
            
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
            
            // Update component position in state
            const component = this.state.components.find(c => c.id === componentId);
            if (component) {
                component.x = newX;
                component.y = newY;
            }
        };
        
        const mouseUp = () => {
            isDragging = false;
            element.style.zIndex = '10';
            document.removeEventListener('mousemove', mouseMove);
            document.removeEventListener('mouseup', mouseUp);
        };
        
        element.addEventListener('mousedown', mouseDown);
    }
    
    showContextMenu(e, componentId) {
        // Remove existing menu
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();
        
        // Create context menu
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
            min-width: 180px;
            overflow: hidden;
        `;
        
        menu.innerHTML = `
            <div class="menu-item" onclick="simulator.deleteComponent('${componentId}')">
                🗑️ Delete Component
            </div>
        `;
        
        // Add CSS for menu items
        const style = document.createElement('style');
        style.textContent = `
            .menu-item {
                padding: 12px 16px;
                cursor: pointer;
                transition: background 0.2s;
                border-bottom: 1px solid #eee;
                font-size: 14px;
            }
            .menu-item:hover {
                background: #f8f9fa;
            }
            .menu-item:last-child {
                border-bottom: none;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(menu);
        
        // Close menu when clicking elsewhere
        const closeMenu = () => {
            menu.remove();
            style.remove();
            document.removeEventListener('click', closeMenu);
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);
    }

    deleteComponent(componentId) {
            // Remove from DOM
        const element = document.getElementById(componentId);
        if (element) {
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '0';
            element.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                element.remove();
            }, 300);
        }
        
        // Remove from state
        this.state.components = this.state.components.filter(c => c.id !== componentId);
        
        this.updateUI();
        this.updateStatus('Component deleted');
    }
    
    switchView(view) {
        this.state.view = view;
        
        // Update button states
        this.componentViewBtn.classList.toggle('active', view === 'component');
        this.codeViewBtn.classList.toggle('active', view === 'code');
        
        // Show/hide views
        this.componentView.classList.toggle('active', view === 'component');
        this.codeView.classList.toggle('active', view === 'code');
        
        // Update code if switching to code view
        if (view === 'code') {
            this.generateCode();
        }
        
        this.updateStatus(view === 'component' ? 'Component View' : 'Code View');
    }
    
    generateCode() {
        const componentList = this.state.components.map(comp => 
            `// - ${comp.label}`
        ).join('\n');
        
        const code = `// Arduino Code - Auto Generated
// Components on canvas: ${this.state.components.length}

${componentList}

void setup() {
  Serial.begin(9600);
  Serial.println("Arduino Simulator - Ready");
  
  // Pin configurations will be added here
  ${this.state.components.some(c => c.type === 'led') ? '// LED pinMode setup' : ''}
  ${this.state.components.some(c => c.type === 'button') ? '// Button pinMode setup' : ''}
}

void loop() {
  // Main program loop
  
  ${this.state.components.some(c => c.type === 'led') ? '// LED control logic' : ''}
  ${this.state.components.some(c => c.type === 'button') ? '// Button reading logic' : ''}
  
  delay(100); // Small delay for stability
}`;
        
        this.generatedCode.textContent = code;
    }
    
    startSimulation() {
        this.state.simulationRunning = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        
        // Visual feedback
        this.canvas.style.borderColor = '#2ecc71';
        this.canvas.style.boxShadow = '0 0 25px rgba(46, 204, 113, 0.3)';
        
        this.updateStatus('Simulation started - Click components to interact');
        
        // Add click handlers for simulation
        this.addSimulationInteractions();
    }
    
    stopSimulation() {
        this.state.simulationRunning = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        // Remove visual feedback
        this.canvas.style.borderColor = '';
        this.canvas.style.boxShadow = '';
        
        this.updateStatus('Simulation stopped');
    }
    
    addSimulationInteractions() {
        // Add button click simulation
        const buttons = this.canvas.querySelectorAll('wokwi-pushbutton');
        const leds = this.canvas.querySelectorAll('wokwi-led');
        
        buttons.forEach(button => {
            button.onclick = () => {
                button.toggleAttribute('pressed');
                
                // If there's an LED, make it light up
                if (leds.length > 0) {
                    leds.forEach(led => {
                        if (button.hasAttribute('pressed')) {
                            led.setAttribute('lit', '');
                        } else {
                            led.removeAttribute('lit');
                        }
                    });
                }
            };
        });
    }
    
    copyCodeToClipboard() {
        navigator.clipboard.writeText(this.generatedCode.textContent)
            .then(() => {
                const originalText = this.copyCodeBtn.innerHTML;
                this.copyCodeBtn.innerHTML = '<span>✅ Copied!</span>';
                setTimeout(() => {
                    this.copyCodeBtn.innerHTML = originalText;
                }, 2000);
                this.updateStatus('Code copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy code:', err);
                this.updateStatus('Failed to copy code');
            });
    }
    
    handleKeyPress(e) {
        // Ctrl+1 for Component View
        if (e.ctrlKey && e.key === '1') {
            e.preventDefault();
            this.switchView('component');
        }
        // Ctrl+2 for Code View
        else if (e.ctrlKey && e.key === '2') {
            e.preventDefault();
            this.switchView('code');
        }
        // Delete key
        else if (e.key === 'Delete' || e.key === 'Backspace') {
            // Delete selected component (simplified)
            if (this.state.components.length > 0) {
                const lastComponent = this.state.components[this.state.components.length - 1];
                this.deleteComponent(lastComponent.id);
            }
        }
    }
    
    updateUI() {
        // Update component count
        this.componentCount.textContent = this.state.components.length;
        
        // Hide placeholder if there are components
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

// Initialize the simulator when page loads
let simulator;

document.addEventListener('DOMContentLoaded', () => {
    simulator = new ArduinoSimulator();
});