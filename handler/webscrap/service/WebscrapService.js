const puppeteer = require('puppeteer');
const lojas = require('../json/lojas.json');
const ProductsRepository = require('../repository/ProductsRepository');
const chromium = require('chrome-aws-lambda');

class WebscrapService {
    constructor() {
        this.browser;
        this.page;
        this.infoClasses = lojas.americanas.infoClasses;
        this.productsRepository = new ProductsRepository('americanas');
        this.productQuantity = 10;
    }

    async run() {
        this.browser = await this.newBrowser();
        this.page = await this.browser.newPage();

        const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 Firefox/90.0';
        await this.page.setUserAgent(userAgent);

        let products = await this.getPageProducts('https://www.americanas.com.br/hotsite/atalho-ud', '.zion-vitrine__CardItem-sc-17vxood-1', this.productQuantity);

        await this.browser.close();

        try {
            await this.productsRepository.updateItems(products);
            return {
                message: `${this.productQuantity} produtos foram inseridos/atualizados com sucesso`,
                produtos: products
            }
        } catch (error) {
            throw new Error(`Erro ao insererir/atualizar os produtos: ${error.message}`)
        }
    }

    async newBrowser() {
        return chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: false,
            ignoreHTTPSErrors: true,
        });
    }

    async getPageProducts(link, divClass, productQuantity) {
        await this.page.goto(link);
        const products = await this.page.$$(divClass);
        return this.getProductsInfo(products.slice(0, productQuantity));
    }

    async getProductsInfo(products) {
        const info = Promise.all(products.map(async product => {
            const object = {};
            await Promise.all(this.infoClasses.map(async infoClass => {
                const productInfo = await this.getProductInfo(product, infoClass);
                object[`${infoClass.infoName}`] = '';
                if (productInfo) object[`${infoClass.infoName}`] = productInfo;
            }));
            return object;
        }));

        return info;
    }

    async getProductInfo(product, infoClass) {
        const info = await product.$$eval(infoClass.divClass, (nodes) => nodes.map((n) => n.innerText));
        return info[infoClass.ocurrence];
    }
}

module.exports = WebscrapService;