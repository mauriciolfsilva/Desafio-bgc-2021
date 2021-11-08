const ProductsService = require('./service/ProductsService');

module.exports.handler = async (event, context) => {
    try {
        const service = new ProductsService();
        const responseBody = await service.run();
        return {
            statusCode: 200,
            body: JSON.stringify(responseBody),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            }
        }
    }
    catch (e) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({ error: e.message })
        }
    }
};