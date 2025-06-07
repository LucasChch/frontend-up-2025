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
        totalTurns: document.getElementById('total-turns'),
        paymentMethod: document.getElementById('payment-method'),
        currency: document.getElementById('currency'),
        amount: document.getElementById('amount'),
        
        // Campos del formulario de cliente
        customerName: document.getElementById('customer-name'),
        customerEmail: document.getElementById('customer-email'),
        customerPhone: document.getElementById('customer-phone'),
        
        // Modales
        productModal: document.getElementById('product-modal'),
        bookingResultModal: document.getElementById('booking-result-modal'),
        
        // Contenido de modales
        productModalBody: document.querySelector('#product-modal .modal-body'),
        bookingResultModalBody: document.querySelector('#booking-result-modal .modal-body'),
        
        // Botones de cierre de modales
        closeModalBtns: document.querySelectorAll('.close-modal'),
    },
      /**
     * Inicializa la interfaz
     */
    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.setupMinDateForBooking();
        this.loadImages();
        this.updateTotalTurns();
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
        });
        
        // Cierre de modales
        this.elements.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });
        
        // Click fuera del modal para cerrar
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.productModal) {
                this.closeAllModals();
            }
            if (e.target === this.elements.bookingResultModal) {
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
        
        // Cambios en el total de turnos
        this.elements.totalTurns.addEventListener('change', () => {
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
                alert('Por favor seleccione un número válido de turnos.');
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
        this.elements.productModal.style.display = 'block';
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
                alert(`No se puede actualizar el producto. El total de turnos no puede exceder 3.\nTurnos actuales: ${currentTotalTurns}\nTurnos solicitados para ${product.name}: ${turns}\nTotal resultante: ${newTotalTurns}`);
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
                alert(`No se puede agregar el producto. El total de turnos no puede exceder 3.\nTurnos actuales: ${currentTotalTurns}\nTurnos solicitados para ${product.name}: ${turns}\nTotal resultante: ${newTotalTurns}`);
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
    },
      /**
     * Elimina un producto de la reserva
     * @param {number} index - Índice del producto en el array
     */
    removeProductFromBooking(index) {
        this.state.selectedProducts.splice(index, 1);
        this.renderBookingProducts();
        this.updateTotalTurns();
        this.updateBookingSummary();    },
    
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
        
        // Calcular subtotal basado en los productos seleccionados
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
        
        const total = subTotal - discountAmt;
        
        // Mostrar detalle de productos en el resumen
        let productsDetailHtml = '<div class="products-detail">';
        this.state.selectedProducts.forEach(item => {
            const itemTotal = item.pricePerTurn * item.quantity * item.turns;
            productsDetailHtml += `
                <div class="product-summary-line">
                    <span>${item.productName} (${item.quantity}x${item.turns} turnos)</span>
                    <span>$${itemTotal.toFixed(2)} ARS</span>
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
                <span>$${subTotal.toFixed(2)} ARS</span>
            </div>
            ${discountRate > 0 ? `
            <div class="summary-row">
                <span>Descuento (${(discountRate * 100).toFixed(0)}%):</span>
                <span>-$${discountAmt.toFixed(2)} ARS</span>
            </div>
            ` : ''}
            <div class="summary-row summary-total">
                <span>Total:</span>
                <span>$${total.toFixed(2)} ARS</span>
            </div>
        `;
        
        // Actualizar campo de monto si el método de pago es tarjeta
        if (this.elements.paymentMethod.value === 'card') {
            this.elements.amount.value = total.toFixed(2);
        }
    },
    
    /**
     * Actualiza el campo de monto según el método de pago
     */
    updateAmountField() {
        const isCard = this.elements.paymentMethod.value === 'card';
        
        if (isCard) {
            // Para tarjeta, el monto debe ser obligatorio y se calcula automáticamente
            this.elements.amount.value = this.calculateTotal().toFixed(2);
            this.elements.amount.readOnly = true;
        } else {
            // Para efectivo, puede ser 0 o se puede editar
            this.elements.amount.readOnly = false;
        }
    },
    
    /**
     * Calcula el total de la reserva
     * @returns {number} - Total calculado
     */
    calculateTotal() {
        let subTotal = 0;
        
        // Calcular subtotal
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
     * Maneja el envío del formulario de reserva
     */
    async handleBookingSubmit() {
        try {
            if (this.state.selectedProducts.length === 0) {
                alert('Debe seleccionar al menos un producto para la reserva.');
                return;
            }
            
            const customerId = this.elements.customerSelect.value;
            const startTime = this.elements.startTime.value;
            const totalTurns = parseInt(this.elements.totalTurns.value);
            const method = this.elements.paymentMethod.value;
            const currency = this.elements.currency.value;
            const amount = parseFloat(this.elements.amount.value) || 0;
            
            if (!customerId || !startTime || !totalTurns) {
                alert('Por favor complete todos los campos obligatorios.');
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
            alert('Error al crear la reserva: ' + error.message);
        }
    },
    
    /**
     * Maneja el envío del formulario de cliente nuevo
     */
    async handleCustomerSubmit() {
        try {
            const name = this.elements.customerName.value;
            const email = this.elements.customerEmail.value;
            const phone = this.elements.customerPhone.value;
            
            if (!name || !email || !phone) {
                alert('Por favor complete todos los campos del cliente.');
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
            
            // Mostrar mensaje de éxito
            alert('Cliente registrado correctamente.');
            
        } catch (error) {
            console.error('Error al crear el cliente:', error);
            alert('Error al crear el cliente: ' + error.message);
        }
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
                htmlContent += `
                    <div>
                        <h3>Información del pago</h3>
                        <p><strong>Estado del pago:</strong> ${this.translatePaymentStatus(payment.status)}</p>
                        <p><strong>Total:</strong> $${payment.total.toFixed(2)} ARS</p>
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
        this.elements.bookingResultModal.style.display = 'block';
    },
    
    /**
     * Cierra todos los modales
     */
    closeAllModals() {
        this.elements.productModal.style.display = 'none';
        this.elements.bookingResultModal.style.display = 'none';
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
    }
};