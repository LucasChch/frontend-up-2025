/**
 * Módulo para gestionar la comunicación con el backend
 */
const API = {
    // URL base del backend
    BASE_URL: 'http://localhost:3000',
    
    /**
     * Realiza una petición GET a la API
     * @param {string} endpoint - Ruta relativa del endpoint
     * @returns {Promise} - Promesa con la respuesta
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en la petición');
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error en GET ${endpoint}:`, error);
            throw error;
        }
    },
    
    /**
     * Realiza una petición POST a la API
     * @param {string} endpoint - Ruta relativa del endpoint
     * @param {Object} data - Datos a enviar
     * @returns {Promise} - Promesa con la respuesta
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en la petición');
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error en POST ${endpoint}:`, error);
            throw error;
        }
    },
    
    /**
     * Realiza una petición PATCH a la API
     * @param {string} endpoint - Ruta relativa del endpoint
     * @param {Object} data - Datos a enviar (opcional)
     * @returns {Promise} - Promesa con la respuesta
     */
    async patch(endpoint, data = null) {
        try {
            const options = {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (data) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(`${this.BASE_URL}${endpoint}`, options);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en la petición');
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Error en PATCH ${endpoint}:`, error);
            throw error;
        }
    },
    
    // Endpoints específicos de la aplicación
    
    /**
     * Obtiene todos los productos disponibles
     * @returns {Promise<Array>} - Lista de productos
     */
    async getProducts() {
        return this.get('/product');
    },
    
    /**
     * Obtiene todos los clientes registrados
     * @returns {Promise<Array>} - Lista de clientes
     */
    async getCustomers() {
        return this.get('/customer');
    },
    
    /**
     * Crea un nuevo cliente
     * @param {Object} customerData - Datos del cliente
     * @returns {Promise<Object>} - Cliente creado
     */
    async createCustomer(customerData) {
        return this.post('/customer', customerData);
    },
    
    /**
     * Crea una nueva reserva
     * @param {Object} bookingData - Datos de la reserva
     * @returns {Promise<Object>} - Reserva creada
     */
    async createBooking(bookingData) {
        return this.post('/booking', bookingData);
    },
    
    /**
     * Cancela una reserva existente
     * @param {string} bookingId - ID de la reserva
     * @returns {Promise<Object>} - Resultado de la cancelación
     */
    async cancelBooking(bookingId) {
        return this.patch(`/booking/cancel/${bookingId}`);
    },
    
    /**
     * Realiza un pago en efectivo para una reserva
     * @param {string} bookingId - ID de la reserva
     * @param {Object} paymentData - Datos del pago
     * @returns {Promise<Object>} - Resultado del pago
     */
    async payBookingWithCash(bookingId, paymentData) {
        return this.post(`/payment/payCash/${bookingId}`, paymentData);
    }
};