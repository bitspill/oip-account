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
var wallet = new Wallet('00000000000000000000000000000000', {discover: false});
let artifact = new Artifact(artifactDehydrated);
let artifactFile = new ArtifactFile()
let APB = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "view");

// test("APB, getPaymentAddresses()", async (done) => {
//     expect(await APB.getPaymentAddresses()).toEqual([{"flo": "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"}])
//     done()
// }, 10000)
//
//
// test("APB, getExchangeRates(): No Coin Parameters", async (done) => {
//     await expect(APB.getExchangeRates("usd")).resolves.toMatchObject(
//         {
//             "flo":  expect.any(Number),
//             "bitcoin": expect.any(Number),
//             "litecoin": expect.any(Number)
//         }
//     )
//     // uncomment to check exchange rates:
//     // await expect(APB.getExchangeRates("usd")).resolves.toBe()
//     done()
// }, 10000);
//
// test("APB, getExchangeRates(): One Coin Parameter", async (done) => {
//     await expect(APB.getExchangeRates("usd", ["flo"])).resolves.toMatchObject(
//         {
//             "flo": expect.any(Number)
//         }
//     )
//     done()
// }, 10000);
//
// test("APB, getExchangeRates(): Multiple Coin Parameters", async (done) => {
//     await expect(APB.getExchangeRates("usd", ["flo", "bitcoin", "litecoin"])).resolves.toMatchObject(
//         {
//             "flo": expect.any(Number),
//             "bitcoin": expect.any(Number),
//             "litecoin": expect.any(Number)
//         }
//     )
//     done()
// });
//
// test("APB, convertCosts", async (done) => {
//     let exchange_rates = await APB.getExchangeRates("usd")
//     await expect(APB.convertCosts(exchange_rates, .00012)).resolves.toMatchObject(
//         {
//             "flo": expect.any(Number),
//             "bitcoin": expect.any(Number),
//             "litecoin": expect.any(Number)
//         }
//     )
//     done()
// })

test("APB, getWalletBalances(): without coin parameters", async (done) => {
    let balances = await APB.getWalletBalances();

    let bitcoinResolved = false;
    let floResolved = false;
    let ltcResolved = false;
    console.log("Balances, ", balances)
    if (typeof balances["bitcoin"] === "number" || typeof balances["bitcoin"] === "string") {
        bitcoinResolved = true;
    }
    if (typeof balances["flo"] === "number" || typeof balances["flo"] === "string") {
        floResolved = true;
    }
    if (typeof balances["litecoin"] === "number" || typeof balances["litecoin"] === "string") {
        ltcResolved = true;
    }

    expect(floResolved).toBeTruthy();
    expect(ltcResolved).toBeTruthy();
    expect(bitcoinResolved).toBeTruthy();
    done()
}, 20000);

// test("APB, getWalletBalances(): with one coin parameter (flo)", async (done) => {
//     let balances = await APB.getWalletBalances(["flo"]);
//
//     let floResolved = false;
//     console.log("Balances, ", balances)
//     if (typeof balances["flo"] === "number" || typeof balances["flo"] === "string") {
//         floResolved = true;
//     }
//     expect(floResolved).toBeTruthy();
//     done()
// }, 20000);
//
//
// test("APB, selectCoin()", async (done) => {
//     let exchange_rates = await APB.getExchangeRates("usd")
//     let conversion_costs = await APB.convertCosts(exchange_rates, .00012)
//     let coin_balances = await APB.getWalletBalances();
//
//
//     await expect(APB.selectCoin(exchange_rates, conversion_costs, coin_balances)).resolves.toBe("flo")
//
//     done()
// }, 20000);

// test("APB, selectCoin()", async () => {
//     let coinBalances = await APB.getWalletBalances();
//     let exchangeRates = await APB.getExchangeRates("usd")
//
//     await expect(APB.selectCoin(exchangeRates, coinBalances)).rejects.toMatch('error')
// }, 10000);




// test("APB, superFunction: ", async () => {
//     let superFunc = await APB.superFunction(APB._amount);
//     expect(superFunc["usableCoins"]).toEqual(expect.arrayContaining(["flo"]));
//     expect(superFunc["conversionPrices"]).toEqual(expect.objectContaining({"flo": expect.any(Number)}));
//
//     console.log(`Super Function : ${JSON.stringify(superFunc, null, 4)}`);
// });

// test("APB, Pay function", async () => {
//     let payment = await APB.pay()
//     console.log("PAYMENT", payment);
//
// }, 10000)


