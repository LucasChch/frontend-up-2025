/**
 * Módulo para gestionar la interfaz de usuario
 */
const UI = {
    // Estado de la aplicación
    state: {
        products: [],
        customers: [],
        selectedProducts: [],
        productModalCallback: null,
    },

    // Configuración de tipos de cambio (según la documentación del backend)
    exchangeRates: {
        ARS: 1,     // Base currency (peso argentino)
        USD: 1000,  // 1 USD = 1000 ARS
        EUR: 1000   // 1 EUR = 1000 ARS
    },
    
    // Referencias a elementos del DOM
    elements: {
        // Secciones
        sections: document.querySelectorAll('.section'),
        productsSection: document.getElementById('products'),
        bookingSection: document.getElementById('booking'),
        customersSection: document.getElementById('customers'),
        
        // Navegación
        navLinks: document.querySelectorAll('.nav-link'),
        
        // Listados
        productsList: document.getElementById('products-list'),
        customerList: document.getElementById('customer-list'),
        bookingProducts: document.getElementById('booking-products'),
        summaryContent: document.getElementById('summary-content'),
        
        // Formularios
        bookingForm: document.getElementById('booking-form'),
        customerForm: document.getElementById('customer-form'),
        // Campos de formulario
        customerSelect: document.getElementById('customer-select'),
        startTime: document.getElementById('start-time'),
        startDate: document.getElementById('start-date'),
        startHour: document.getElementById('start-hour'),
        startMinute: document.getElementById('start-minute'),
        datePickerHidden: document.getElementById('date-picker-hidden'),
        dateIcon: document.querySelector('.date-icon'),
        totalTurns: document.getElementById('total-turns'),        paymentMethod: document.getElementById('payment-method'),
        currency: document.getElementById('currency'),
        amount: document.getElementById('amount'),
        amountHelperText: document.getElementById('amount-helper-text'),
        
        // Campos del formulario de cliente
        customerName: document.getElementById('customer-name'),
        customerEmail: document.getElementById('customer-email'),
        customerPhone: document.getElementById('customer-phone'),
        // Modales
        productModal: document.getElementById('product-modal'),
        bookingResultModal: document.getElementById('booking-result-modal'),
        customerResultModal: document.getElementById('customer-result-modal'),
        errorModal: document.getElementById('error-modal'),
        
        // Contenido de modales
        productModalBody: document.querySelector('#product-modal .modal-body'),
        bookingResultModalBody: document.querySelector('#booking-result-modal .modal-body'),
        customerResultModalBody: document.querySelector('#customer-result-modal .modal-body'),
        errorModalBody: document.querySelector('#error-modal .modal-body'),
        
        // Botones de cierre de modales
        closeModalBtns: document.querySelectorAll('.close-modal'),
        
        // Botones de confirmar modales
        bookingResultConfirm: document.getElementById('booking-result-confirm'),
        customerResultConfirm: document.getElementById('customer-result-confirm'),
        errorModalConfirm: document.getElementById('error-modal-confirm'),
    },    /**
     * Inicializa la interfaz
     */
    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.setupMinDateForBooking();
        this.setupCustomDateTimePicker();
        this.loadImages();
        this.updateTotalTurns();
        this.setupScrollHandler();
    },
      /**
     * Carga las imágenes predeterminadas para asegurar que están en caché
     */
    loadImages() {
        // Precargar la imagen por defecto
        const defaultImg = new Image();
        defaultImg.src = ProductImages.defaultImage;
        
        // Precargar imágenes de categorías
        for (const category in ProductImages.categoryImages) {
            const img = new Image();
            img.src = ProductImages.categoryImages[category];
        }
        
        // Precargar imágenes de productos
        for (const product in ProductImages.productImages) {
            const img = new Image();
            img.src = ProductImages.productImages[product];
        }
    },
    
    /**
     * Configura el manejo del scroll para el header
     */
    setupScrollHandler() {
        const header = document.querySelector('header');
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Agregar clase cuando se hace scroll hacia abajo
            if (currentScrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScrollY = currentScrollY;
        });
    },
    
    /**
     * Configura los listeners de eventos
     */
    setupEventListeners() {
        // Navegación entre secciones
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section;
                this.showSection(sectionId);
            });
        });        // Validación del campo teléfono para solo permitir números
        this.elements.customerPhone.addEventListener('input', (e) => {
            // Permitir solo números, espacios, paréntesis, guiones y el símbolo +
            const validChars = /[0-9+\-\s\(\)]/;
            const value = e.target.value;
            let filteredValue = '';
            
            for (let char of value) {
                if (validChars.test(char)) {
                    filteredValue += char;
                }
            }
            
            // Si el valor cambió, actualizar el campo y mostrar feedback visual
            if (value !== filteredValue) {
                e.target.value = filteredValue;
                // Agregar feedback visual temporal
                e.target.style.borderColor = '#ff6b6b';
                setTimeout(() => {
                    e.target.style.borderColor = '';
                }, 1000);
            }
        });

        this.elements.customerPhone.addEventListener('keypress', (e) => {
            // Prevenir caracteres no válidos durante la escritura
            const char = String.fromCharCode(e.which);
            const validChars = /[0-9+\-\s\(\)]/;
            
            if (!validChars.test(char) && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                return false;
            }
        });

        this.elements.customerPhone.addEventListener('paste', (e) => {
            // Validar contenido pegado
            setTimeout(() => {
                const value = e.target.value;
                const cleanValue = value.replace(/[^0-9+\-\s\(\)]/g, '');
                if (value !== cleanValue) {
                    e.target.value = cleanValue;
                }
            }, 0);
        });
          // Cierre de modales
        this.elements.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });
          // Botón de confirmar en modal de resultado de reserva
        this.elements.bookingResultConfirm.addEventListener('click', () => {
            this.closeAllModals();
        });
        
        // Botón de confirmar en modal de resultado de cliente
        this.elements.customerResultConfirm.addEventListener('click', () => {
            this.closeAllModals();
        });
        
        // Botón de confirmar en modal de error
        this.elements.errorModalConfirm.addEventListener('click', () => {
            this.closeAllModals();
        });
          // Click fuera del modal para cerrar
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.productModal) {
                this.closeAllModals();
            }
            if (e.target === this.elements.bookingResultModal) {
                this.closeAllModals();
            }
            if (e.target === this.elements.customerResultModal) {
                this.closeAllModals();
            }
            if (e.target === this.elements.errorModal) {
                this.closeAllModals();
            }
        });
        
        // Formulario de reserva
        this.elements.bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBookingSubmit();
        });
        
        // Formulario de cliente
        this.elements.customerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCustomerSubmit();
        });
          // Cambio en método de pago
        this.elements.paymentMethod.addEventListener('change', () => {
            this.updateAmountField();
        });

        // Cambio en moneda
        this.elements.currency.addEventListener('change', () => {
            this.updateBookingSummary();
        });
        
        // Cambios en el total de turnos
        this.elements.totalTurns.addEventListener('change', () => {
            this.updateBookingSummary();
        });
        
        // Cambio de moneda
        this.elements.currency.addEventListener('change', () => {
            this.updateAmountField();
            this.updateBookingSummary();
        });
    },
    
    /**
     * Carga datos iniciales (productos y clientes)
     */
    async loadInitialData() {
        try {
            // Carga de productos
            const products = await API.getProducts();
            this.state.products = products;
            this.renderProducts();
            
            // Carga de clientes
            const customers = await API.getCustomers();
            this.state.customers = customers;
            this.renderCustomers();
            this.populateCustomerSelect();
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            this.showErrorMessage('Error al cargar datos. Por favor, recarga la página.');
        }
    },
      /**
     * Establece la fecha mínima para reservas (no permite fechas pasadas)
     */
    setupMinDateForBooking() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        this.elements.startTime.min = minDateTime;
    },
      /**
     * Configura el selector personalizado de fecha y hora
     */
    setupCustomDateTimePicker() {
        // Poblar selectores de hora (00-23)
        for (let hour = 8; hour < 20; hour++) {
            const option = document.createElement('option');
            option.value = String(hour).padStart(2, '0');
            option.textContent = String(hour).padStart(2, '0');
            this.elements.startHour.appendChild(option);
        }
        
        // Poblar selectores de minutos (00, 15, 30, 45)
        const minutes = ['00', '15', '30', '45'];
        minutes.forEach(minute => {
            const option = document.createElement('option');
            option.value = minute;
            option.textContent = minute;
            this.elements.startMinute.appendChild(option);
        });
        
        // Configurar el calendario clickeable
        this.elements.dateIcon.addEventListener('click', () => {
            this.elements.datePickerHidden.showPicker();
        });
        
        // Configurar el input date oculto
        this.elements.datePickerHidden.addEventListener('change', (e) => {
            const selectedDate = e.target.value;
            if (selectedDate) {
                // Convertir de YYYY-MM-DD a DD/MM/YYYY
                const [year, month, day] = selectedDate.split('-');
                const formattedDate = `${day}/${month}/${year}`;
                this.elements.startDate.value = formattedDate;
                this.validateDateInput(this.elements.startDate);
            }
        });
        
        // Configurar validación de fecha
        this.elements.startDate.addEventListener('input', (e) => {
            this.validateAndFormatDate(e.target);
        });
        
        this.elements.startDate.addEventListener('blur', (e) => {
            this.validateDateInput(e.target);
        });
        
        // Event listeners para hora y minuto
        this.elements.startHour.addEventListener('change', () => {
            this.updateHiddenDateTimeField();
        });
        
        this.elements.startMinute.addEventListener('change', () => {
            this.updateHiddenDateTimeField();
        });
        
        // Prevenir caracteres no válidos en el campo de fecha
        this.elements.startDate.addEventListener('keypress', (e) => {
            const char = e.key;
            const value = e.target.value;
            
            // Permitir solo números y el carácter '/'
            if (!/[0-9\/]/.test(char) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) {
                e.preventDefault();
                return;
            }
            
            // Agregar '/' automáticamente después del día y mes
            if (/^\d{2}$/.test(value) || /^\d{2}\/\d{2}$/.test(value)) {
                if (char !== '/' && /\d/.test(char)) {
                    e.target.value = value + '/';
                }
            }
        });
        
        // Configurar fecha y hora mínima (fecha actual)
        this.setMinimumDateTime();
    },
    
    /**
     * Valida y formatea la fecha mientras el usuario escribe
     */
    validateAndFormatDate(input) {
        let value = input.value.replace(/[^\d\/]/g, ''); // Solo números y /
        
        // Formatear automáticamente con /
        if (value.length === 2 && !value.includes('/')) {
            value += '/';
        } else if (value.length === 5 && value.split('/').length === 2) {
            value += '/';
        }
        
        // Limitar la longitud
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        input.value = value;
        this.updateHiddenDateTimeField();
    },
    
    /**
     * Valida la fecha completa cuando el usuario termina de editarla
     */
    validateDateInput(input) {
        const value = input.value;
        const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = value.match(datePattern);
        
        if (!match) {
            input.classList.add('invalid');
            input.classList.remove('valid');
            this.showDateValidationMessage('Formato de fecha inválido. Use dd/mm/aaaa', 'error');
            return false;
        }
        
        const [, day, month, year] = match;
        const date = new Date(year, month - 1, day);
        
        // Verificar si la fecha es válida
        if (date.getDate() != day || date.getMonth() != month - 1 || date.getFullYear() != year) {
            input.classList.add('invalid');
            input.classList.remove('valid');
            this.showDateValidationMessage('Fecha inválida. Verifique el día, mes y año.', 'error');
            return false;
        }
        
        // Verificar si la fecha no es en el pasado
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        if (date < now) {
            input.classList.add('invalid');
            input.classList.remove('valid');
            this.showDateValidationMessage('No se pueden hacer reservas en fechas pasadas.', 'error');
            return false;
        }
        
        input.classList.remove('invalid');
        input.classList.add('valid');
        this.hideDateValidationMessage();
        this.updateHiddenDateTimeField();
        return true;
    },
    
    /**
     * Actualiza el campo hidden para mantener compatibilidad
     */
    updateHiddenDateTimeField() {
        const date = this.elements.startDate.value;
        const hour = this.elements.startHour.value;
        const minute = this.elements.startMinute.value;
        
        if (date && hour && minute) {
            const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            const match = date.match(datePattern);
            
            if (match) {
                const [, day, month, year] = match;
                const isoDateTime = `${year}-${month}-${day}T${hour}:${minute}`;
                this.elements.startTime.value = isoDateTime;
                
                // Validar que la fecha y hora no sean en el pasado
                const selectedDateTime = new Date(year, month - 1, day, hour, minute);
                const now = new Date();
                
                const container = this.elements.startDate.closest('.datetime-picker-container');
                if (selectedDateTime < now) {
                    container.classList.add('invalid');
                    container.classList.remove('valid');
                    this.showDateValidationMessage('La fecha y hora seleccionadas no pueden ser en el pasado.', 'error');
                } else {
                    container.classList.remove('invalid');
                    container.classList.add('valid');
                    this.hideDateValidationMessage();
                }
            }
        } else {
            this.elements.startTime.value = '';
        }
    },
      /**
     * Establece la fecha y hora mínima permitida
     */
    setMinimumDateTime() {
        const now = new Date();
        const currentDay = String(now.getDate()).padStart(2, '0');
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const currentYear = now.getFullYear();
        const currentHour = String(now.getHours()).padStart(2, '0');
        
        // Establecer fecha actual como placeholder mejorado
        this.elements.startDate.placeholder = `Ej: ${currentDay}/${currentMonth}/${currentYear}`;
        
        // Configurar fecha mínima en el input date oculto
        const minDate = `${currentYear}-${currentMonth}-${currentDay}`;
        this.elements.datePickerHidden.min = minDate;
        
        // Preseleccionar hora actual redondeada al siguiente cuarto de hora
        const currentMinutes = now.getMinutes();
        let nextQuarter;
        if (currentMinutes < 15) nextQuarter = '15';
        else if (currentMinutes < 30) nextQuarter = '30';
        else if (currentMinutes < 45) nextQuarter = '45';
        else {
            nextQuarter = '00';
            // Si pasamos a la siguiente hora
            const nextHour = (parseInt(currentHour) + 1) % 24;
            this.elements.startHour.value = String(nextHour).padStart(2, '0');
        }
        
        if (nextQuarter !== '00' || currentMinutes >= 45) {
            this.elements.startHour.value = currentHour;
        }
        this.elements.startMinute.value = nextQuarter;
    },
    
    /**
     * Muestra mensaje de validación para la fecha
     */
    showDateValidationMessage(message, type = 'error') {
        // Remover mensaje anterior si existe
        this.hideDateValidationMessage();
        
        const container = this.elements.startDate.closest('.form-group');
        const messageElement = document.createElement('div');
        messageElement.className = `form-validation-message ${type}`;
        messageElement.textContent = message;
        messageElement.id = 'date-validation-message';
        
        container.appendChild(messageElement);
        
        // Mostrar el mensaje con animación
        setTimeout(() => {
            messageElement.style.display = 'block';
        }, 10);
    },
    
    /**
     * Oculta el mensaje de validación de la fecha
     */
    hideDateValidationMessage() {
        const existingMessage = document.getElementById('date-validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    },
    
    /**
     * Muestra una sección específica
     * @param {string} sectionId - ID de la sección a mostrar
     */
    showSection(sectionId) {
        // Actualiza clases en navegación
        this.elements.navLinks.forEach(link => {
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Actualiza visibilidad de secciones
        this.elements.sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    },
    
    /**
     * Renderiza la lista de productos
     */
    renderProducts() {
        if (this.state.products.length === 0) {
            this.elements.productsList.innerHTML = '<p>No hay productos disponibles.</p>';
            return;
        }
        
        this.elements.productsList.innerHTML = '';
        
        this.state.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            let safetyInfo = '';
            if (product.requiresSafety) {
                safetyInfo = `<p>Requiere ${product.safetyRequiredType}</p>`;
            }
              // Obtener la URL de la imagen del producto
            const imageUrl = ProductImages.getImageUrl(product);
            
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.src='${ProductImages.getPlaceholderUrl(product)}'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-category">Categoría: ${product.category}</p>
                    <p class="product-price">$${product.pricePerTurn} ARS por turno</p>
                    <div class="product-details">
                        <p>Máximo ${product.maxPeople} personas</p>
                        <p>Stock disponible: ${product.stock}</p>
                        ${safetyInfo}
                    </div>
                    <div class="product-actions">
                        <button class="btn-primary add-to-booking" data-product-id="${product._id}">Reservar</button>
                    </div>
                </div>
            `;
            
            // Agregar evento al botón de reservar
            const reserveButton = productCard.querySelector('.add-to-booking');
            reserveButton.addEventListener('click', () => {
                this.openProductModal(product);
            });
            
            this.elements.productsList.appendChild(productCard);
        });
    },
    
    /**
     * Renderiza la lista de clientes
     */
    renderCustomers() {
        if (this.state.customers.length === 0) {
            this.elements.customerList.innerHTML = '<p>No hay clientes registrados.</p>';
            return;
        }
        
        this.elements.customerList.innerHTML = '';
        
        this.state.customers.forEach(customer => {
            const customerCard = document.createElement('div');
            customerCard.className = 'customer-card';
            customerCard.innerHTML = `
                <h3 class="customer-name">${customer.name}</h3>
                <p><strong>Email:</strong> ${customer.email}</p>
                <p><strong>Teléfono:</strong> ${customer.phone}</p>
            `;
            
            this.elements.customerList.appendChild(customerCard);
        });
    },
    
    /**
     * Llena el selector de clientes
     */
    populateCustomerSelect() {
        // Mantener la opción por defecto
        this.elements.customerSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
        
        this.state.customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer._id;
            option.textContent = customer.name;
            this.elements.customerSelect.appendChild(option);
        });
    },
      /**
     * Abre el modal para seleccionar un producto
     * @param {Object} product - Producto seleccionado
     */
    openProductModal(product) {
        // Calcular turnos actuales y disponibles
        let currentTotalTurns = 0;
        this.state.selectedProducts.forEach(item => {
            currentTotalTurns += item.turns;
        });
        
        // Verificar si el producto ya está seleccionado
        const existingProduct = this.state.selectedProducts.find(p => p.productId === product._id);
        let availableTurns = 3 - currentTotalTurns;
        
        if (existingProduct) {
            // Si el producto ya existe, sumar sus turnos actuales a los disponibles
            availableTurns += existingProduct.turns;
        }
        
        // Generar opciones de turnos dinámicamente
        let turnsOptions = '';
        if (availableTurns <= 0) {
            turnsOptions = '<option value="">No hay turnos disponibles</option>';
        } else {
            for (let i = 1; i <= Math.min(availableTurns, 3); i++) {
                const selected = existingProduct && existingProduct.turns === i ? 'selected' : '';
                turnsOptions += `<option value="${i}" ${selected}>${i} turno${i > 1 ? 's' : ''} (${i * 30} min)</option>`;
            }
        }
        
        this.elements.productModalBody.innerHTML = `
            <div class="product-selection">
                <div class="product-selection-item">
                    <h4>${product.name}</h4>
                    <p>${product.category} - $${product.pricePerTurn} por turno</p>
                    ${availableTurns <= 0 ? '<p class="error-message">⚠️ No se pueden agregar más turnos. Máximo permitido: 3 turnos.</p>' : ''}
                    ${currentTotalTurns > 0 ? `<p class="helper-text">Turnos actuales: ${currentTotalTurns} | Turnos disponibles: ${availableTurns}</p>` : ''}
                </div>
                
                <form class="product-selection-form">
                    <div class="form-group">
                        <label for="modal-quantity">Cantidad:</label>
                        <input type="number" id="modal-quantity" min="1" max="${product.stock}" value="${existingProduct ? existingProduct.quantity : 1}">
                    </div>
                    
                    <div class="form-group">
                        <label for="modal-turns">Turnos:</label>
                        <select id="modal-turns" ${availableTurns <= 0 ? 'disabled' : ''}>
                            ${turnsOptions}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="modal-people-count">Cantidad de personas:</label>
                        <input type="number" id="modal-people-count" min="1" max="${product.maxPeople}" value="${existingProduct ? existingProduct.peopleCount : 1}">
                    </div>
                    
                    ${product.requiresSafety ? `
                    <div class="form-group safety-items">
                        <label for="modal-safety-quantity">Cantidad de ${product.safetyRequiredType}s:</label>
                        <input type="number" id="modal-safety-quantity" min="1" value="${existingProduct && existingProduct.safetyItems ? existingProduct.safetyItems.quantity : 1}">
                    </div>
                    ` : ''}
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="modal-cancel">Cancelar</button>
                        <button type="button" class="btn-primary" id="modal-add" ${availableTurns <= 0 ? 'disabled' : ''}>${existingProduct ? 'Actualizar' : 'Agregar'}</button>
                    </div>
                </form>
            </div>
        `;
        
        // Configurar eventos para los botones del modal
        document.getElementById('modal-cancel').addEventListener('click', () => {
            this.closeAllModals();
        });
          document.getElementById('modal-add').addEventListener('click', () => {
            const quantity = parseInt(document.getElementById('modal-quantity').value);
            const turns = parseInt(document.getElementById('modal-turns').value);
            const peopleCount = parseInt(document.getElementById('modal-people-count').value);
              // Validación adicional antes de agregar
            if (!turns || turns <= 0) {
                this.showErrorModal('Turnos inválidos', 'Por favor seleccione un número válido de turnos.');
                return;
            }
            
            let safetyItems = null;
            if (product.requiresSafety) {
                const safetyQuantity = parseInt(document.getElementById('modal-safety-quantity').value);
                safetyItems = {
                    type: product.safetyRequiredType,
                    quantity: safetyQuantity
                };
            }
            
            this.addProductToBooking(product, quantity, turns, peopleCount, safetyItems);
            this.closeAllModals();
        });
          // Mostrar el modal
        this.elements.productModal.classList.add('show');
        this.elements.productModal.style.display = 'flex';
    },    /**
     * Agrega un producto a la reserva
     */
    addProductToBooking(product, quantity, turns, peopleCount, safetyItems) {
        // Calcular el total de turnos actual
        let currentTotalTurns = 0;
        this.state.selectedProducts.forEach(item => {
            currentTotalTurns += item.turns;
        });
        
        // Verificar si el producto ya está en la reserva
        const existingIndex = this.state.selectedProducts.findIndex(p => p.productId === product._id);
        
        if (existingIndex !== -1) {
            // Si el producto ya existe, calcular la diferencia de turnos
            const oldTurns = this.state.selectedProducts[existingIndex].turns;
            const newTotalTurns = currentTotalTurns - oldTurns + turns;
              if (newTotalTurns > 3) {
                this.showErrorModal(
                    'Límite de turnos excedido', 
                    `No se puede actualizar el producto. El total de turnos no puede exceder 3.\n\nTurnos actuales: ${currentTotalTurns}\nTurnos solicitados para ${product.name}: ${turns}\nTotal resultante: ${newTotalTurns}`
                );
                return;
            }
            
            // Actualizar el producto existente
            this.state.selectedProducts[existingIndex] = {
                productId: product._id,
                productName: product.name,
                quantity,
                turns,
                peopleCount,
                safetyItems,
                pricePerTurn: product.pricePerTurn
            };
        } else {
            // Si es un producto nuevo, verificar si se excederían los 3 turnos
            const newTotalTurns = currentTotalTurns + turns;
              if (newTotalTurns > 3) {
                this.showErrorModal(
                    'Límite de turnos excedido', 
                    `No se puede agregar el producto. El total de turnos no puede exceder 3.\n\nTurnos actuales: ${currentTotalTurns}\nTurnos solicitados para ${product.name}: ${turns}\nTotal resultante: ${newTotalTurns}`
                );
                return;
            }
            
            // Agregar nuevo producto
            this.state.selectedProducts.push({
                productId: product._id,
                productName: product.name,
                quantity,
                turns,
                peopleCount,
                safetyItems,
                pricePerTurn: product.pricePerTurn
            });
        }
        
        this.renderBookingProducts();
        this.updateTotalTurns();
        this.updateBookingSummary();
        
        // Cambiar a la sección de reservas
        this.showSection('booking');
    },
    
    /**
     * Renderiza los productos seleccionados para la reserva
     */
    renderBookingProducts() {
        if (this.state.selectedProducts.length === 0) {
            this.elements.bookingProducts.innerHTML = '<p class="empty-message">No hay productos seleccionados.</p>';
            return;
        }
          this.elements.bookingProducts.innerHTML = '';
        
        // Calcular turnos actuales
        let currentTotalTurns = 0;
        this.state.selectedProducts.forEach(item => {
            currentTotalTurns += item.turns;
        });
        
        // Agregar botón para añadir más productos
        const addMoreBtn = document.createElement('button');
        const availableTurns = 3 - currentTotalTurns;        if (availableTurns > 0) {
            addMoreBtn.className = 'btn-secondary';
            addMoreBtn.textContent = `Agregar más productos (${availableTurns} turno${availableTurns > 1 ? 's' : ''} disponible${availableTurns > 1 ? 's' : ''})`;
            addMoreBtn.addEventListener('click', () => {
                this.showSection('products');
            });
        } else {
            addMoreBtn.className = 'btn-secondary';
            addMoreBtn.textContent = 'Máximo de turnos alcanzado (3/3)';
            addMoreBtn.disabled = true;
            addMoreBtn.title = 'No se pueden agregar más productos. Máximo 3 turnos por reserva.';
        }
        addMoreBtn.style.marginBottom = '1rem';
        this.elements.bookingProducts.appendChild(addMoreBtn);
        
        // Renderizar productos seleccionados
        this.state.selectedProducts.forEach((item, index) => {
            const productItem = document.createElement('div');
            productItem.className = 'booking-product-item';
            
            const safetyInfo = item.safetyItems 
                ? `${item.safetyItems.quantity} ${item.safetyItems.type}(s)` 
                : 'No requiere';
            
            productItem.innerHTML = `
                <div class="product-name">${item.productName}</div>
                <div class="product-config">
                    <span>${item.quantity} unidad(es)</span>
                    <span>${item.turns} turno(s)</span>
                    <span>${item.peopleCount} persona(s)</span>
                    <span>Seguridad: ${safetyInfo}</span>
                    <button class="remove-product" data-index="${index}">×</button>
                </div>
            `;
            
            // Agregar evento para remover producto
            const removeBtn = productItem.querySelector('.remove-product');
            removeBtn.addEventListener('click', () => {
                this.removeProductFromBooking(index);
            });
            
            this.elements.bookingProducts.appendChild(productItem);
        });
    },    /**
     * Elimina un producto de la reserva
     * @param {number} index - Índice del producto en el array
     */
    removeProductFromBooking(index) {
        this.state.selectedProducts.splice(index, 1);
        this.renderBookingProducts();
        this.updateTotalTurns();
        this.updateBookingSummary();
    },
    
    /**
     * Actualiza automáticamente el select de total de turnos basado en los productos seleccionados
     */
    updateTotalTurns() {
        // Calcular el total de turnos de todos los productos seleccionados
        let totalProductTurns = 0;
        this.state.selectedProducts.forEach(item => {
            totalProductTurns += item.turns;
        });
        
        // Actualizar el select de total de turnos
        this.elements.totalTurns.innerHTML = '';
        
        if (totalProductTurns === 0) {
            // Si no hay productos, mostrar opciones por defecto
            for (let i = 1; i <= 3; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${i} turno${i > 1 ? 's' : ''} (${i * 30} min)`;
                this.elements.totalTurns.appendChild(option);
            }
        } else {
            // Si hay productos, el total debe ser exactamente la suma de sus turnos
            const option = document.createElement('option');
            option.value = totalProductTurns;
            option.textContent = `${totalProductTurns} turno${totalProductTurns > 1 ? 's' : ''} (${totalProductTurns * 30} min)`;
            option.selected = true;
            this.elements.totalTurns.appendChild(option);
        }
    },
    
    /**
     * Actualiza el resumen de la reserva (precios, descuentos, etc.)
     */    updateBookingSummary() {
        if (this.state.selectedProducts.length === 0) {
            this.elements.summaryContent.innerHTML = '<p>Seleccione al menos un producto para ver el resumen.</p>';
            return;
        }
        
        let subTotal = 0;
        
        // Calcular subtotal basado en los productos seleccionados (siempre en ARS)
        this.state.selectedProducts.forEach(item => {
            const productTotal = item.pricePerTurn * item.quantity * item.turns;
            subTotal += productTotal;
        });
        
        // Aplicar descuento si hay más de un producto diferente
        let discountRate = 0;
        let discountAmt = 0;
        
        if (this.state.selectedProducts.length > 1) {
            discountRate = 0.1; // 10% de descuento
            discountAmt = subTotal * discountRate;
        }
        
        const totalInARS = subTotal - discountAmt;
        
        // Obtener moneda seleccionada
        const selectedCurrency = this.getSelectedCurrency();
        const currencySymbol = this.getCurrencySymbol(selectedCurrency);
        
        // Convertir valores a la moneda seleccionada
        const subTotalConverted = this.convertFromARS(subTotal, selectedCurrency);
        const discountAmtConverted = this.convertFromARS(discountAmt, selectedCurrency);
        const totalConverted = this.convertFromARS(totalInARS, selectedCurrency);
        
        // Mostrar detalle de productos en el resumen
        let productsDetailHtml = '<div class="products-detail">';
        this.state.selectedProducts.forEach(item => {
            const itemTotal = item.pricePerTurn * item.quantity * item.turns;
            const itemTotalConverted = this.convertFromARS(itemTotal, selectedCurrency);
            productsDetailHtml += `
                <div class="product-summary-line">
                    <span>${item.productName} (${item.quantity}x${item.turns} turnos)</span>
                    <span>${currencySymbol}${itemTotalConverted.toFixed(2)} ${selectedCurrency}</span>
                </div>
            `;
        });
        productsDetailHtml += '</div>';
        
        // Actualizar el resumen
        this.elements.summaryContent.innerHTML = `
            ${productsDetailHtml}
            <hr>
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>${currencySymbol}${subTotalConverted.toFixed(2)} ${selectedCurrency}</span>
            </div>
            ${discountRate > 0 ? `
            <div class="summary-row">
                <span>Descuento (${(discountRate * 100).toFixed(0)}%):</span>
                <span>-${currencySymbol}${discountAmtConverted.toFixed(2)} ${selectedCurrency}</span>
            </div>
            ` : ''}
            <div class="summary-row summary-total">
                <span>Total:</span>
                <span>${currencySymbol}${totalConverted.toFixed(2)} ${selectedCurrency}</span>
            </div>        `;
        
        // Actualizar el campo de monto usando el método centralizado
        this.updateAmountField();
    },    /**
     * Actualiza el texto de ayuda del campo de monto
     */
    updateAmountHelperText() {
        const selectedCurrency = this.getSelectedCurrency();
        const currencyNames = {
            ARS: 'Peso Argentino',
            USD: 'Dólar Estadounidense', 
            EUR: 'Euro'
        };
        
        let helperText = '💡 El monto se calcula automáticamente según los productos y turnos seleccionados.';
        
        if (selectedCurrency !== 'ARS') {
            const rate = this.exchangeRates[selectedCurrency];
            helperText += ` 💱 Conversión: 1 ${selectedCurrency} = ${rate} ARS`;
        }
        
        this.elements.amountHelperText.textContent = helperText;
    },

    /**
     * Actualiza el campo de monto según el método de pago
     */
    updateAmountField() {
        // El campo siempre es readonly ya que se calcula automáticamente
        const total = this.calculateTotal();
        
        // Agregar animación de actualización
        const wrapper = this.elements.amount.closest('.calculated-amount-wrapper');
        if (wrapper) {
            wrapper.classList.add('updating');
            setTimeout(() => {
                wrapper.classList.remove('updating');
            }, 600);
        }
        
        // Actualizar el valor
        this.elements.amount.value = total.toFixed(2);
        
        // Actualizar el texto de ayuda
        this.updateAmountHelperText();
        
        // El campo permanece readonly independientemente del método de pago
        this.elements.amount.readOnly = true;
    },
      /**
     * Calcula el total de la reserva siempre en pesos argentinos (moneda base)
     * @returns {number} - Total calculado en ARS
     */
    calculateTotalInARS() {
        let subTotal = 0;
        
        // Calcular subtotal en pesos argentinos (base)
        this.state.selectedProducts.forEach(item => {
            const productTotal = item.pricePerTurn * item.quantity * item.turns;
            subTotal += productTotal;
        });
        
        // Aplicar descuento si hay más de un producto diferente
        let discountRate = 0;
        let discountAmt = 0;
        
        if (this.state.selectedProducts.length > 1) {
            discountRate = 0.1; // 10% de descuento
            discountAmt = subTotal * discountRate;
        }
        
        return subTotal - discountAmt;
    },

    /**
     * Calcula el total de la reserva
     * @returns {number} - Total calculado en la moneda seleccionada
     */
    calculateTotal() {
        let subTotal = 0;
        
        // Calcular subtotal en pesos argentinos (base)
        this.state.selectedProducts.forEach(item => {
            const productTotal = item.pricePerTurn * item.quantity * item.turns;
            subTotal += productTotal;
        });
        
        // Aplicar descuento si hay más de un producto diferente
        let discountRate = 0;
        let discountAmt = 0;
        
        if (this.state.selectedProducts.length > 1) {
            discountRate = 0.1; // 10% de descuento
            discountAmt = subTotal * discountRate;
        }
          const totalInARS = subTotal - discountAmt;
        
        // Convertir a la moneda seleccionada
        const selectedCurrency = this.getSelectedCurrency();
        return this.convertFromARS(totalInARS, selectedCurrency);
    },
    
    /**
     * Maneja el envío del formulario de reserva
     */
    async handleBookingSubmit() {        
        try {
            if (this.state.selectedProducts.length === 0) {
                this.showErrorModal('No hay productos', 'Debe seleccionar al menos un producto para la reserva.');
                return;
            }
              const customerId = this.elements.customerSelect.value;
            const startTime = this.elements.startTime.value;
            const totalTurns = parseInt(this.elements.totalTurns.value);
            const method = this.elements.paymentMethod.value;
            const currency = this.elements.currency.value;
              // Calcular el monto correcto según la moneda seleccionada
            // El backend espera el monto en la moneda seleccionada, 
            // y él maneja la conversión internamente según sus tipos de cambio
            const totalInARS = this.calculateTotalInARS();
            let amount;
            
            if (currency === 'ARS') {
                amount = totalInARS;
            } else if (currency === 'USD' || currency === 'EUR') {
                // Para USD y EUR, enviamos el equivalente en esa moneda
                // El backend espera recibir el monto en la moneda seleccionada
                amount = totalInARS / this.exchangeRates[currency];
            } else {
                amount = totalInARS;
            }
              if (!customerId || !startTime || !totalTurns) {
                this.showErrorModal('Campos requeridos', 'Por favor complete todos los campos obligatorios.');
                return;
            }
              // Validar que la suma de turnos individuales sea igual al total
            let totalProductTurns = 0;
            this.state.selectedProducts.forEach(item => {
                totalProductTurns += item.turns;
            });
            
            // El totalTurns ahora se calcula automáticamente, pero validamos por consistencia
            if (totalProductTurns !== totalTurns) {
                // Esto ya no debería pasar con el nuevo sistema, pero mantenemos la validación
                console.warn('Inconsistencia en turnos detectada, recalculando...');
                this.updateTotalTurns();
                return;
            }
            
            // Preparar los datos
            const bookingData = {
                customerId,
                startTime: new Date(startTime).toISOString(),
                totalTurns,
                method,
                currency,
                amount,
                items: this.state.selectedProducts.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    turns: item.turns,
                    peopleCount: item.peopleCount,
                    safetyItems: item.safetyItems
                }))
            };
            
            // Enviar la reserva
            const response = await API.createBooking(bookingData);
            this.showBookingResult(response);
              // Limpiar el formulario
            this.state.selectedProducts = [];
            this.renderBookingProducts();
            this.updateTotalTurns();
            this.updateBookingSummary();
            this.elements.bookingForm.reset();
              } catch (error) {
            console.error('Error al crear la reserva:', error);
            this.showErrorModal('Error al crear reserva', error.message);
        }
    },
    
    /**
     * Maneja el envío del formulario de cliente nuevo
     */    async handleCustomerSubmit() {
        try {
            const name = this.elements.customerName.value;
            const email = this.elements.customerEmail.value;
            const phone = this.elements.customerPhone.value;
              if (!name || !email || !phone) {
                this.showErrorModal('Campos requeridos', 'Por favor complete todos los campos del cliente.');
                return;
            }            // Validar formato del teléfono
            const phoneValidation = this.validatePhoneNumber(phone);
            if (!phoneValidation.isValid) {
                this.showErrorModal('Teléfono inválido', phoneValidation.message);
                return;
            }
            
            const customerData = { name, email, phone };
            const newCustomer = await API.createCustomer(customerData);
            
            // Actualizar la lista de clientes y el selector
            this.state.customers.push(newCustomer);
            this.renderCustomers();
            this.populateCustomerSelect();
            
            // Seleccionar el cliente recién creado en el formulario de reserva
            this.elements.customerSelect.value = newCustomer._id;
              // Limpiar el formulario
            this.elements.customerForm.reset();
            
            // Mostrar modal de resultado de cliente
            this.showCustomerResult(newCustomer);
            
        } catch (error) {
            console.error('Error al crear el cliente:', error);
            this.showErrorModal('Error al crear cliente', error.message);
        }
    },
    
    /**
     * Valida si un número de teléfono tiene un formato válido
     * @param {string} phone - Número de teléfono a validar
     * @returns {Object} - Objeto con isValid y mensaje de error si aplica
     */
    validatePhoneNumber(phone) {
        if (!phone || phone.trim() === '') {
            return { isValid: false, message: 'El número de teléfono es requerido.' };
        }

        // Verificar caracteres permitidos
        const allowedPattern = /^[0-9+\-\s\(\)]+$/;
        if (!allowedPattern.test(phone)) {
            return { 
                isValid: false, 
                message: 'El número de teléfono solo puede contener números, espacios, paréntesis, guiones y el símbolo +.' 
            };
        }

        // Verificar que tiene al menos algunos números
        const hasNumbers = /\d/.test(phone);
        if (!hasNumbers) {
            return { 
                isValid: false, 
                message: 'El número de teléfono debe contener al menos un dígito.' 
            };
        }

        // Verificar longitud mínima de dígitos (al menos 6 dígitos)
        const digits = phone.replace(/[^0-9]/g, '');
        if (digits.length < 6) {
            return { 
                isValid: false, 
                message: 'El número de teléfono debe tener al menos 6 dígitos.' 
            };
        }

        return { isValid: true, message: '' };
    },

    /**
     * Muestra el resultado de la reserva en un modal
     * @param {Object} bookingResult - Resultado de la reserva
     */
    showBookingResult(bookingResult) {
        let htmlContent = '';
        
        if (bookingResult && bookingResult.booking) {
            htmlContent = `
                <div class="success-message">
                    <h3>¡Reserva creada exitosamente!</h3>
                    <p><strong>ID de la reserva:</strong> ${bookingResult.booking._id}</p>
                    <p><strong>Estado:</strong> ${this.translateBookingStatus(bookingResult.booking.status)}</p>
                    <p><strong>Fecha de inicio:</strong> ${new Date(bookingResult.booking.startTime).toLocaleString()}</p>
                    <p><strong>Fecha de fin:</strong> ${new Date(bookingResult.booking.endTime).toLocaleString()}</p>
                </div>
            `;
              if (bookingResult.payment) {
                const payment = bookingResult.payment;
                
                // Obtener la moneda que se usó en la reserva
                const paymentCurrency = payment.currency || 'ARS';
                const currencySymbol = this.getCurrencySymbol(paymentCurrency);
                
                // El backend siempre devuelve el total en ARS, necesitamos convertir
                let displayTotal = payment.total;
                if (paymentCurrency !== 'ARS') {
                    displayTotal = this.convertFromARS(payment.total, paymentCurrency);
                }
                
                htmlContent += `
                    <div>
                        <h3>Información del pago</h3>
                        <p><strong>Estado del pago:</strong> ${this.translatePaymentStatus(payment.status)}</p>
                        <p><strong>Total:</strong> ${currencySymbol}${displayTotal.toFixed(2)} ${paymentCurrency}</p>
                        <p><strong>Método:</strong> ${payment.method === 'card' ? 'Tarjeta' : 'Efectivo'}</p>
                    `;
                
                if (payment.status === 'pending') {
                    htmlContent += `
                        <div class="warning-message">
                            <p>Recuerde que debe pagar la reserva al menos 2 horas antes del inicio.</p>
                            <p><strong>Fecha límite de pago:</strong> ${payment.dueDate ? new Date(payment.dueDate).toLocaleString() : 'No especificada'}</p>
                        </div>
                    `;
                }
                
                htmlContent += '</div>';
            }
        } else {
            htmlContent = `
                <div class="error-message">
                    <h3>Error al procesar la reserva</h3>
                    <p>No se pudo completar la operación. Intente nuevamente más tarde.</p>
                </div>
            `;
        }
          this.elements.bookingResultModalBody.innerHTML = htmlContent;
        this.elements.bookingResultModal.classList.add('show');
        this.elements.bookingResultModal.style.display = 'flex';
    },
    
    /**
     * Muestra el resultado de la creación de cliente en un modal
     * @param {Object} customer - Datos del cliente creado
     */
    showCustomerResult(customer) {
        const htmlContent = `
            <div class="success-message">
                <h3>¡Cliente registrado exitosamente!</h3>
                <p><strong>ID del cliente:</strong> ${customer._id}</p>
                <p><strong>Nombre:</strong> ${customer.name}</p>
                <p><strong>Email:</strong> ${customer.email}</p>
                <p><strong>Teléfono:</strong> ${customer.phone}</p>
                <p><strong>Fecha de registro:</strong> ${new Date(customer.createdAt).toLocaleString()}</p>
            </div>
            <div class="info-message">
                <p>El cliente ha sido agregado a la lista y ya está disponible para crear reservas.</p>
            </div>
        `;
        
        this.elements.customerResultModalBody.innerHTML = htmlContent;
        this.elements.customerResultModal.classList.add('show');
        this.elements.customerResultModal.style.display = 'flex';
    },

    /**
     * Muestra un modal de error en lugar de alert()
     * @param {string} title - Título del error
     * @param {string} message - Mensaje de error
     */
    showErrorModal(title, message) {
        const htmlContent = `
            <div class="error-message">
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
        
        this.elements.errorModalBody.innerHTML = htmlContent;
        this.elements.errorModal.classList.add('show');
        this.elements.errorModal.style.display = 'flex';
    },

    /**
     * Cierra todos los modales
     */
    closeAllModals() {
        this.elements.productModal.classList.remove('show');
        this.elements.bookingResultModal.classList.remove('show');
        this.elements.customerResultModal.classList.remove('show');
        this.elements.errorModal.classList.remove('show');
        
        // Pequeño delay para la animación antes de ocultar completamente
        setTimeout(() => {
            this.elements.productModal.style.display = 'none';
            this.elements.bookingResultModal.style.display = 'none';
            this.elements.customerResultModal.style.display = 'none';
            this.elements.errorModal.style.display = 'none';
        }, 300);
    },
    
    /**
     * Traduce el estado de la reserva a español
     * @param {string} status - Estado en inglés
     * @returns {string} - Estado en español
     */
    translateBookingStatus(status) {
        const statusMap = {
            'booked': 'Reservada',
            'refunded': 'Reembolsada',
            'cancelled': 'Cancelada'
        };
        return statusMap[status] || status;
    },
    
    /**
     * Traduce el estado del pago a español
     * @param {string} status - Estado en inglés
     * @returns {string} - Estado en español
     */
    translatePaymentStatus(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'paid': 'Pagado',
            'refundedTotal': 'Reembolsado Totalmente',
            'refundedPartial': 'Reembolsado Parcialmente'
        };
        return statusMap[status] || status;
    },
    
    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje a mostrar
     */
    showErrorMessage(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        // Insertar al principio de la sección activa
        const activeSection = document.querySelector('.section.active');
        if (activeSection) {
            activeSection.insertBefore(errorElement, activeSection.firstChild);
            
            // Eliminar después de 5 segundos
            setTimeout(() => {
                errorElement.remove();
            }, 5000);
        }
    },
    
    /**
     * Convierte un monto de pesos argentinos a la moneda especificada
     * @param {number} amountInARS - Monto en pesos argentinos
     * @param {string} targetCurrency - Moneda objetivo (ARS, USD, EUR)
     * @returns {number} - Monto convertido
     */
    convertFromARS(amountInARS, targetCurrency) {
        if (targetCurrency === 'ARS') {
            return amountInARS;
        }
        
        const rate = this.exchangeRates[targetCurrency];
        if (!rate) {
            console.warn(`Moneda no soportada: ${targetCurrency}`);
            return amountInARS;
        }
        
        return amountInARS / rate;
    },

    /**
     * Obtiene el símbolo de la moneda
     * @param {string} currency - Código de moneda (ARS, USD, EUR)
     * @returns {string} - Símbolo de la moneda
     */
    getCurrencySymbol(currency) {
        const symbols = {
            ARS: '$',
            USD: 'US$',
            EUR: '€'
        };
        return symbols[currency] || '$';
    },

    /**
     * Obtiene la moneda seleccionada actualmente
     * @returns {string} - Código de moneda seleccionada
     */
    getSelectedCurrency() {
        return this.elements.currency.value || 'ARS';
    }
};