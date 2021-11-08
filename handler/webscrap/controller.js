const WebscrapService = require('./service/WebscrapService');

module.exports.handler = async (event, context) => {
    try {
        const service = new WebscrapService();
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
            body: JSON.stringify({ error: e.message }),
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true
            }
        }
    }
};