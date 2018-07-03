var ArtifactPaymentBuilder = require("../lib/ArtifactPaymentBuilder");

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
