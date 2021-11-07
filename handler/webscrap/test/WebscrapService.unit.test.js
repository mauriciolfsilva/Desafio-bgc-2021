const chai = require('chai');
const { expect } = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const service = require('../service/WebscrapService');

let subject;

before(() => chai.use(sinonChai));

describe('Products controller', () => {
    let mockSandBox;
    let mockProductsRepositoryUpdateItems;


    describe('Run', () => {

        let mockBrowser;
        let mockNewBrowser;
        let mockGetPageProducts

        beforeEach(() => {
            mockSandBox = new sinon.createSandbox();
            subject = new service();

            mockBrowser = {
                newPage: sinon.stub(),
                close: sinon.stub()
            }
            mockNewBrowser = mockSandBox.stub(subject, 'newBrowser');
            mockNewBrowser.returns(mockBrowser);
            mockGetPageProducts = mockSandBox.stub(subject, 'getPageProducts');

            mockProductsRepositoryUpdateItems = mockSandBox.stub(subject.productsRepository, 'updateItems');
        })
        afterEach(() => {
            mockSandBox.restore();
        })

        it('Success', async () => {
            const mockPageProducts = [{
                loja: 'americanas',
                ranking: '2',
                description: 'nomeProduto',
                price: '42.42',
                rating: '4.2'
            }];
            mockGetPageProducts.returns(mockPageProducts);

            const result = await subject.run();
            const expectResult =
            {
                message: '10 produtos foram inseridos/atualizados com sucesso',
                produtos: [{
                    loja: 'americanas',
                    ranking: '2',
                    description: 'nomeProduto',
                    price: '42.42',
                    rating: '4.2'
                }]
            }

            expect(mockProductsRepositoryUpdateItems).to.be.calledWithMatch(mockPageProducts);
            expect(result).to.eql(expectResult);
            expect(mockBrowser.newPage).to.be.called;
            expect(mockNewBrowser).to.be.called;
            expect(mockBrowser.close).to.be.called;
            expect(mockGetPageProducts).to.be.calledWith('https://www.americanas.com.br/hotsite/atalho-ud', '.zion-vitrine__CardItem-sc-17vxood-1', 10);
        })


        it('Failure no update', async () => {
            const mockPageProducts = [{
                loja: 'americanas',
                ranking: '2',
                description: 'nomeProduto',
                price: '42.42',
                rating: '4.2'
            }];
            mockGetPageProducts.returns(mockPageProducts);

            const mockErro = new Error('Erro ao atualizar');

            mockProductsRepositoryUpdateItems.throws(mockErro);
            try {
                await subject.run();
                expect.fail('Deveria dar erro');
            } catch (error) {
                expect(error.message).to.equals('Erro ao insererir/atualizar os produtos: Erro ao atualizar');
            }

            expect(mockProductsRepositoryUpdateItems).to.be.calledWithMatch(mockPageProducts);
            expect(mockNewBrowser).to.be.called;
            expect(mockGetPageProducts).to.be.called;
            expect(mockProductsRepositoryUpdateItems).to.be.called;
            expect(mockBrowser.close).to.be.called;
            expect(mockBrowser.newPage).to.be.called;
        })
        it('Failure', async () => {
            const mockErro = new Error('Erro ao abrir o navegador');

            mockNewBrowser.throws(mockErro);
            try {
                await subject.run();
                expect.fail('Deveria dar erro');
            } catch (error) {
                expect(error.message).to.equals('Erro ao abrir o navegador');
            }

            expect(mockNewBrowser).to.be.called;
            expect(mockGetPageProducts).to.be.not.called;
            expect(mockProductsRepositoryUpdateItems).to.be.not.called;
            expect(mockBrowser.close).to.be.not.called;
            expect(mockBrowser.newPage).to.be.not.called;
        })
    });

    describe('getPageProducts', () => {

        let mockPageGoTo;
        let mockPage$$;
        let mockGetProductsInfo;

        beforeEach(() => {
            mockSandBox = new sinon.createSandbox();
            subject = new service();

            mockPageGoTo = mockSandBox.stub();
            mockPage$$ = mockSandBox.stub();

            subject.page = {
                goto: mockPageGoTo,
                $$: mockPage$$,
            }

            mockGetProductsInfo = mockSandBox.stub(subject, 'getProductsInfo');
        })
        afterEach(() => {
            mockSandBox.restore();
        })

        it('Success', async () => {
            const mockPageProducts = [{
                loja: 'americanas',
                ranking: '2',
                description: 'nomeProduto',
                price: '42.42',
                rating: '4.2'
            }];
            mockPage$$.returns(mockPageProducts);

            await subject.getPageProducts('link', 'divClass', 1);

            expect(mockGetProductsInfo).to.be.calledWithMatch(mockPageProducts);
            expect(mockPage$$).to.be.calledWith('divClass');
            expect(mockPageGoTo).to.be.calledWith('link');
        })

    });

    describe('getProductsInfo', () => {

        let mockGetProductInfo;

        beforeEach(() => {
            mockSandBox = new sinon.createSandbox();
            subject = new service();

            mockGetProductInfo = mockSandBox.stub(subject, 'getProductInfo');
        })
        afterEach(() => {
            mockSandBox.restore();
        })

        it('Success', async () => {
            const requestProducts = ['product1', 'product2'];
            mockGetProductInfo.returns('Valor');

            const result = await subject.getProductsInfo(requestProducts);
            const mockResult = [{
                ranking: 'Valor',
                description: 'Valor',
                price: 'Valor',
                rating: 'Valor'
            },
            {
                ranking: 'Valor',
                description: 'Valor',
                price: 'Valor',
                rating: 'Valor'
            },

            ]

            expect(mockGetProductInfo.callCount).to.be.equal(8);
            expect(result).to.eql(mockResult);

        })

    });

    describe('getProductInfo', () => {


        beforeEach(() => {
            mockSandBox = new sinon.createSandbox();
            subject = new service();
        })
        afterEach(() => {
            mockSandBox.restore();
        })

        it('Success', async () => {
            const requestProduct = { $$eval: mockSandBox.stub() };
            requestProduct.$$eval.returns(['Valor']);
            const mockDivClass = { divClass: 'testeName', ocurrence: 0 };

            const result = await subject.getProductInfo(requestProduct, mockDivClass);
            const mockResult = 'Valor';

            expect(requestProduct.$$eval).to.be.called;
            expect(result).to.eql(mockResult);

        })

    });
});