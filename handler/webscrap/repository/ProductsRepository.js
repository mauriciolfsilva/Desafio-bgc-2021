const { DynamoDBClient, UpdateItemCommand, QueryCommand } = require("@aws-sdk/client-dynamodb");
const lojas = require('../json/lojas.json')

class ProductsRepository {

    constructor(loja) {
        this.loja = loja;
        this.tableName = 'products_bestsellers';
        this.region = 'sa-east-1';
        this.lojas = lojas;
    }

    async sendCommand(command) {
        const dynamodb = new DynamoDBClient({ region: this.region });
        return dynamodb.send(command);
    }

    async updateItems(items) {
        const updateRequest = this.createBatchUpdateRequest(items);
        return this.batchUpdate(updateRequest);
    }

    async getItems(count) {
        const getRequest = this.createGetRequest(count);
        const command = new QueryCommand(getRequest);
        return this.sendCommand(command);
    }

    createGetRequest(count) {
        const params = {
            KeyConditionExpression: 'loja = :l',
            ExpressionAttributeValues: {
                ':l': { S: this.loja }
            },
            Limit: count,
            TableName: `${this.tableName}`
        };
        return params;
    }

    createUpdateRequest(item) {
        const params = {
            TableName: this.tableName,
            Key: {
                loja: { S: this.loja },
                ranking: { N: item.ranking }
            },
            UpdateExpression: 'set ',
            ExpressionAttributeValues: {

            }
        }

        this.lojas[`${this.loja}`].infoClasses.forEach(info => {
            if (info.infoName != 'ranking') {
                const value = this.convertToAtributeObject(item[`${info.infoName}`].trim());
                if (params.UpdateExpression != 'set ') params.UpdateExpression += ', ';
                params.UpdateExpression += `${info.infoName} = :${info.infoName}`;
                params.ExpressionAttributeValues[`:${info.infoName}`] = value;
            }
        });

        return params;
    }

    convertToAtributeObject(att) {
        const newAtt = att.replace(',', '.');
        if (!isNaN(newAtt)) {
            return { 'N': newAtt };
        }
        return { 'S': att };
    }

    createBatchUpdateRequest(items) {
        return items.map(item => { return this.createUpdateRequest(item) });
    }

    batchUpdate(batchRequest) {
        return Promise.all(batchRequest.map(async request => {
            const command = new UpdateItemCommand(request);
            return this.sendCommand(command);
        }))
    }
}

module.exports = ProductsRepository;