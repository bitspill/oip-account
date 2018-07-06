var ArtifactPaymentBuilder = require("../src/ArtifactPaymentBuilder");
var { Wallet } = require("oip-hdmw");
var { Artifact } = require("oip-index");

var artifact = new Artifact({
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
                "addresses": [{flo: 216}]
            },
            "timestamp": 1508188263,
            "signature": "IAiCzx8ICjAKoj98yw5VwKLCzIuAGM1fVIewZjC/PrBHVkUsl67R2Pv0Eu1fFaWsoONmVc1lZA+lpmQ4/dGVG6o="
        }
    }
})
const wallet = new Wallet("00000000000000000000000000000000", {discover: false})
const APB = new ArtifactPaymentBuilder(wallet, artifact, .00012, "view", "usd");

test("APB, getExchangeRates(): No Coin Parameters", async () => {
    expect.assertions(1);
    await expect(APB.getExchangeRates("usd")).resolves.toMatchObject(
        {
            "flo": {"usd": expect.any(Number)},
            "bitcoin": {"usd": expect.any(Number)},
            "litecoin": {"usd": expect.any(Number)}
        }
    )
    // uncomment to check exchange rates:
    // await expect(APB.getExchangeRates("usd")).resolves.toBe()
}, 10000)

test("APB, getExchangeRates(): One Coin Parameter", async () => {
    expect.assertions(1);
    await expect(APB.getExchangeRates("usd", ["flo"])).resolves.toMatchObject(
        {
            "flo": {"usd": expect.any(Number)}
        }
    )
}, 10000);

test("APB, getExchangeRates(): Multiple Coin Parameters", async () => {
    expect.assertions(1);
    await expect(APB.getExchangeRates("usd", ["flo", "bitcoin", "litecoin"])).resolves.toMatchObject(
        {
            "flo": {"usd": expect.any(Number)},
            "bitcoin": {"usd": expect.any(Number)},
            "litecoin": {"usd": expect.any(Number)}
        }
    )
});

test("APB, getExchangeRates(): No Coin Parameters", async () => {
    expect.assertions(1);
    await expect(APB.getExchangeRates("usd")).resolves.toMatchObject(
        {
            "flo": {"usd": expect.any(Number)},
            "bitcoin": {"usd": expect.any(Number)},
            "litecoin": {"usd": expect.any(Number)}
        }
    )
    // uncomment to check exchange rates:
    // await expect(APB.getExchangeRates("usd")).resolves.toBe()
}, 10000)

test("APB, getExchangeRates(): One Coin Parameter", async () => {
    expect.assertions(1);
    await expect(APB.getExchangeRates("usd", ["flo"])).resolves.toMatchObject(
        {
            "flo": {"usd": expect.any(Number)}
        }
    )
}, 10000)

test("APB, getExchangeRates(): Multiple Coin Parameters", async () => {
    expect.assertions(1);
    await expect(APB.getExchangeRates("usd", ["flo", "bitcoin", "litecoin"])).resolves.toMatchObject(
        {
            "flo": {"usd": expect.any(Number)},
            "bitcoin": {"usd": expect.any(Number)},
            "litecoin": {"usd": expect.any(Number)}
        }
    )
})

test("APB, getBalances(): check to see if balances resolved", async () => {
    // expect.assertions(3);
    let balances = await APB.getBalances();

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
}, 10000);

test("APB, superFunction: ", async () => {
    let superFunc = await APB.superFunction(APB._amount);
    expect(superFunc["usableCoins"]).toEqual(expect.arrayContaining(["flo"]));
    expect(superFunc["conversionPrices"]).toEqual(expect.objectContaining({"flo": expect.any(Number)}));

    console.log(`Super Function : ${JSON.stringify(superFunc, null, 4)}`);
});

// test("APB, Pay function", async () => {
//     let payment = await APB.pay()
//     console.log("PAYMENT", payment);
//
// }, 10000)