var ArtifactPaymentBuilder = require("../lib/ArtifactPaymentBuilder");
var { Wallet, Coin } = require("oip-hdmw");

const wallet = new Wallet("00000000000000000000000000000000", {discover: false})

test("Get exchange rate with ONE COIN", async () => {
    expect.assertions(1);
    const APB = new ArtifactPaymentBuilder();
    await expect(APB.getExchangeRates(["flo"],"usd")).resolves.toMatchObject(
        {
            "flo": {"usd": expect.any(Number)}
        }
    )
})

test("Get exchange rate with MULTIPLE (3) COINS", async () => {
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

test("get FLO Coin balance from ArtifactPaymentBuild", () => {
    // expect.assertions(1);
    const APB = new ArtifactPaymentBuilder(wallet);
    // const returnValue = APB.getBalances()
    expect(APB.getBalances()).resolves.toBe();
});


// test("misc", () => {
    // const balances = await APB.getBalances();


    // var bitcoinResolved = false;
    //
    // if (typeof balances.bitcoin.balance === "number")
    //     bitcoinResolved = true
    //
    // if (balances.bitcoin.error)
    //     bitcoinResolved = true
    //
    //
    // expect(bitcoinResolved).toBe(true);
    // var coins = wallet.getCoins();
    //
    // expect(coins.bitcoin instanceof Coin).toBe(true)
    // expect(coins.litecoin instanceof Coin).toBe(true)
    // expect(coins.flo instanceof Coin).toBe(true)
// })
