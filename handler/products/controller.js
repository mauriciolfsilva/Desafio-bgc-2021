const ProductsService = require('./service/ProductsService');

module.exports.handler = async (event, context) => {
    try{
        const service = new ProductsService();
        const responseBody = await service.run();
        return {
            statusCode: 200,
            body: JSON.stringify(responseBody),
            headers: JSON.stringify({})
        }
    }
    catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e),
            headers: JSON.stringify({})
        }
    }
};