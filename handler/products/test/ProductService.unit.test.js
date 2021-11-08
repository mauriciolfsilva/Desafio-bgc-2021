const chai = require('chai');
const { expect } = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const service = require('../service/ProductsService');

let subject;

before(() => chai.use(sinonChai));

describe('Products controller', () => {
    describe('Run', () => {
        let mockSandBox;
        let mockProductsRepositoryGetItems;

        beforeEach(() => {
            mockSandBox = new sinon.createSandbox();
            subject = new service();

            mockProductsRepositoryGetItems = mockSandBox.stub(subject.productsRepository, 'getItems');
        })
        afterEach(() => {
            mockSandBox.restore();
        })

        it('Success', async () => {
            const mockDynamoItems = {
                Items: [
                    {
                        loja: { S: 'americanas' },
                        ranking: { N: '2' },
                        description: { S: 'nomeProduto' },
                        price: { N: '42.42' },
                        rating: { N: '4.2' }
                    }
                ]
            };
            mockProductsRepositoryGetItems.returns(mockDynamoItems);

            const result = await subject.run();
            const expectResult = {
                products: [{
                    loja: 'americanas',
                    ranking: '2',
                    description: 'nomeProduto',
                    price: '42.42',
                    rating: '4.2'
                }]}

            expect(mockProductsRepositoryGetItems).to.be.called;
            expect(result).to.eql(expectResult);
        })


        it('Failure', async () => {
            const mockErro = new Error('Erro ao buscar');

            mockProductsRepositoryGetItems.throws(mockErro);
            try {
                await subject.run();
                expect.fail('Deveria dar erro');
            } catch (error) {
                expect(error.message).to.equals('Error: Erro ao buscar');
            }

            expect(mockProductsRepositoryGetItems).to.be.called;
        })
    });
});