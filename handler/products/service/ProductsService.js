const ProductsRepository = require('../../webscrap/repository/ProductsRepository');

class ProductsService {
    constructor() {
        this.productsRepository = new ProductsRepository('americanas');
    }

    async run() {
        try {
            const result = await this.productsRepository.getItems(3);
            const products = this.itemsToProducts(result.Items);
            return { products };
        } catch (error) {
            throw  new Error(error);
        }
    }

    itemsToProducts(items){
        return items.map(item => {
            const result = {};
            for(const att in item) {
                const value = item[att].S ? item[att].S : item[att].N;
                result[`${att}`] = value;
            }
            return result;
        })
    }
    
}

module.exports = ProductsService;