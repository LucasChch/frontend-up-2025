/**
 * Módulo para gestionar las imágenes de productos
 */
const ProductImages = {
      // Mapeo más específico por nombre de producto
    productImages: {
        // Jet Ski
        'JetSky': 'img/jetsky.jpg',

        // Cuatriciclos
        'Cuatriciclo': 'img/cuatri.avif',
        
        // Equipo de buceo
        'Equipo de Buceo': 'img/buceo.jpg',
        
        // Tablas de surf
        'Tabla de Surf (adultos)': 'img/tabla-surf-adulto.jpg',
        'Tabla de Surf (niños)': 'img/tabla-surf-niño.jpg',
    },
      // Imágenes por defecto para fallbacks
    defaultImage: 'img/no-image.png',
    
    /**
     * Obtiene la URL de la imagen para un producto específico
     * @param {Object} product - El producto del que se quiere obtener la imagen
     * @returns {string} URL de la imagen
     */
    getImageUrl(product) {
        // 1. Intentar obtener imagen por nombre exacto
        if (this.productImages[product.name]) {
            return this.productImages[product.name];
        }

        // 2. Fallback: si no existe una imagen para ese producto o categoría
        return this.defaultImage;
    },
    
    /**
     * Devuelve una URL de Placeholder si las imágenes locales no están disponibles
     * @param {Object} product - El producto 
     * @returns {string} URL del placeholder
     */
    getPlaceholderUrl(product) {
        // Usar el nombre del producto para generar un placeholder
        const text = encodeURIComponent(product.name);
        const category = encodeURIComponent(product.category);
        return `https://via.placeholder.com/300x200?text=${text}`;
    }
};