var ArtifactPaymentBuilder = require("../lib/ArtifactPaymentBuilder");
var { Wallet } = require("oip-hdmw");

const wallet = new Wallet("00000000000000000000000000000000", {discover: false})
const APB = new ArtifactPaymentBuilder(wallet);

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
    let balances = await APB.getBalances({discover: false});

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

// test("APB, Pay function", async () => {
//     let payment = await APB.pay()
//     console.log("PAYMENT", payment);
//
// }, 10000)
//
