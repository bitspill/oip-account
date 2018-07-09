var ArtifactPaymentBuilder = require("../src/ArtifactPaymentBuilder");
var { Wallet } = require("oip-hdmw");
var { Artifact } = require("oip-index");
var { ArtifactFile } = require("oip-index");

// const wallet = new Wallet("00000000000000000000000000000000", {discover: false})
// const APB = new ArtifactPaymentBuilder(wallet, artifact, .00012, "view", "usd");


var artifactDehydrated = {
    "oip042": {
        "artifact": {
            "floAddress": "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k",
            "type": "Image",
            "info": {
                "title": "Example Artifact",
                "description": "Example Artifact Description"
            },
            "storage": {
                "network": "IPFS",
                "files": [
                    {
                        "fname": "my_cool_picture.png",
                        "fsize": 23591,
                        "type": "Image"
                    }
                ],
                "location": "QmQh7uTC5YSinJG2FgWLrd8MYSNtr8G5JGAckR5ARwmyET"
            },
            "payment": {
                "addresses": []
            },
            "timestamp": 1508188263,
            "signature": "IAiCzx8ICjAKoj98yw5VwKLCzIuAGM1fVIewZjC/PrBHVkUsl67R2Pv0Eu1fFaWsoONmVc1lZA+lpmQ4/dGVG6o="
        }
    }
}
var wallet = new Wallet('00000000000000000000000000000001', {discover: false});
let artifact = new Artifact(artifactDehydrated);
let artifactFile = new ArtifactFile()
let APB = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "view");

test("APB, getPaymentAddresses()", async (done) => {
    expect(await APB.getPaymentAddresses()).toEqual([{"flo": "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"}])
    done()
}, 10000)

test("APB, getPaymentAmount()", async () => {
    await expect(APB.getPaymentAmount()).resolves.toEqual(expect.any(Number))
})

test("APB, getPaymentAmount(): with 'tip'", async () => {
    let APB1 = new ArtifactPaymentBuilder(wallet, artifact, 0.0012, "tip");
    await expect(APB1.getPaymentAmount()).resolves.toBe(.0012)
})

test("APB, getPaymentAmount(): error with 'buy'", async () => {
    let APB1 = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "buy");
    await expect(APB1.getPaymentAmount()).resolves.toEqual(expect.any(Number))
})


test("APB, getExchangeRates(): No Coin Parameters", async (done) => {
    let exchange_rates = await APB.getExchangeRates();
    expect(exchange_rates).toHaveProperty('flo');
    expect(exchange_rates).toHaveProperty('bitcoin');
    expect(exchange_rates).toHaveProperty('litecoin');
    // await expect(APB.getExchangeRates("usd")).resolves.toBe()
    done()
}, 10000);

test("APB, getExchangeRates(): One Coin Parameter", async (done) => {
    let exchange_rates = await APB.getExchangeRates(["flo"], "usd");
    expect(exchange_rates).toHaveProperty('flo');
    done()
}, 10000);

test("APB, getExchangeRates(): Multiple Coin Parameters", async (done) => {
    let exchange_rates = await APB.getExchangeRates(["flo", "bitcoin", "litecoin"], "usd");
    expect(exchange_rates).toHaveProperty('flo');
    expect(exchange_rates).toHaveProperty('bitcoin');
    expect(exchange_rates).toHaveProperty('litecoin');
    done()
}, 10000);

test("APB, convertCosts", async (done) => {
    let exchange_rates = await APB.getExchangeRates()
    let conversion_costs = await APB.convertCosts(exchange_rates, .00012);
    for (let coin in exchange_rates) {
        if (Object.keys(conversion_costs).indexOf(coin) !== -1){
            expect(conversion_costs).toHaveProperty(coin);
        }
    }
    done()
}, 10000)

test("APB, getWalletBalances(): without coin parameters", async (done) => {
    let balances = await APB.getWalletBalances();
    expect(balances).toHaveProperty("flo");
    expect(balances).toHaveProperty("bitcoin");
    expect(balances).toHaveProperty("litecoin");

    done()
}, 20000);

test("APB, getWalletBalances(): with one coin parameter (flo)", async (done) => {
    let balances = await APB.getWalletBalances(["flo"]);
    expect(balances).toHaveProperty("flo");
    // expect(floResolved).toBeTruthy();
    done()
}, 20000);


test("APB, selectCoin()", async (done) => {
    let exchange_rates = await APB.getExchangeRates()
    let conversion_costs = await APB.convertCosts(exchange_rates, .00012)
    let coin_balances = await APB.getWalletBalances();

    let selected_coin = await APB.selectCoin(coin_balances, conversion_costs);
    expect(selected_coin).toEqual(expect.any(String));

    done()
}, 20000);

// This function (sendPayment()) is run in the below test (pay())
// test("APB, sendPayment()", async (done) => {
//     let payment = await APB.sendPayment("FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k", .00001);
//     console.log(`Type of payment: ${typeof payment}`)
//     console.log(`TXID OR ERR: ${payment}`)
//     done()
// }, 10000);

test("APB, pay()", async (done) => {
    let APBpay = new ArtifactPaymentBuilder(wallet, artifact, 0.00001, "tip");
    let pay = await APBpay.pay();
    console.log(`Pay result: ${pay}`)
    done()
}, 20000)

//@ToDo: add tests for 'view' and 'buy' type artifactFiles