var ArtifactPaymentBuilder = require("../lib/ArtifactPaymentBuilder");
var { Wallet } = require("oip-hdmw");

test("Get exchange rate with ONE COIN", async () => {
    expect.assertions(1);
    const APB = new ArtifactPaymentBuilder();
    await expect(APB.calculateCryptoExchangeRate(["flo"],"usd")).resolves.toMatchObject(
        {
            "flo": {"usd": expect.any(Number)}
        }
    )
})

test("Get exchange rate with MULTIPLE (3) COINS", async () => {
    expect.assertions(1);
    const APB = new ArtifactPaymentBuilder();
    await expect(APB.calculateCryptoExchangeRate(["flo", "btc", "ltc"],"usd")).resolves.toMatchObject(
        {
            "flo": {"usd": expect.any(Number)},
            "btc": {"usd": expect.any(Number)},
            "ltc": {"usd": expect.any(Number)}
        }
    )
})

test("get Coins from Wallet()", () => {
    const wallet = new Wallet();
    const APB = new ArtifactPaymentBuilder(wallet);
    const walletAPB = APB._wallet
    expect(walletAPB).toBe({})
})
