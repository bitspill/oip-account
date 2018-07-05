var ArtifactPaymentBuilder = require("../lib/ArtifactPaymentBuilder");
var { Wallet } = require("oip-hdmw");

const wallet = new Wallet("00000000000000000000000000000000", {discover: false})

test("APB, Get exchange rate with ONE COIN", async () => {
    expect.assertions(1);
    const APB = new ArtifactPaymentBuilder();
    await expect(APB.getExchangeRates(["flo"],"usd")).resolves.toMatchObject(
        {
            "flo": {"usd": expect.any(Number)}
        }
    )
})

test("APB, Get exchange rate with MULTIPLE COINS", async () => {
    expect.assertions(1);
    const APB = new ArtifactPaymentBuilder();
    await expect(APB.getExchangeRates(["flo", "btc", "ltc"],"usd")).resolves.toMatchObject(
        {
            "flo": {"usd": expect.any(Number)},
            "btc": {"usd": expect.any(Number)},
            "ltc": {"usd": expect.any(Number)}
        }
    )
})

test("APB, check to see whether promise resolved for getBalances()", async () => {
    expect.assertions(3);
    const APB = new ArtifactPaymentBuilder(wallet);
    let balances = await APB.getBalances({discover: false});

    let bitcoinResolved = false;
    let floResolved = false;
    let ltcResolved = false;

    if (typeof balances["bitcoin"].balance === "number" || typeof balances["bitcoin"].err === "string") {
        bitcoinResolved = true;
    }
    if (typeof balances["flo"].balance === "number" || typeof balances["flo"].err === "string") {
        floResolved = true;
    }
    if (typeof balances["litecoin"].balance === "number" || typeof balances["litecoin"].err === "string") {
        ltcResolved = true;
    }

    expect(bitcoinResolved).toBeTruthy();
    expect(floResolved).toBeTruthy();
    expect(ltcResolved).toBeTruthy();
}, 10000);

