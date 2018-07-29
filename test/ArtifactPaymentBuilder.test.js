import ArtifactPaymentBuilder from "../src/ArtifactPaymentBuilder"
var { Wallet } = require("oip-hdmw");
const {Artifact} = require("oip-index")
const {ArtifactFile} = require("oip-index")

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
                "addresses":
                    {
                        "btc": "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
                        "ltc": "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN",
                        "flo": "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
                    }

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

test("APB, getPaymentAmount() view", () => {
    let test = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "view");
    expect(test.getPaymentAmount()).toEqual(expect.any(Number))
})

test("APB, getPaymentAmount(): tip", () => {
    let test = new ArtifactPaymentBuilder(wallet, artifact, 0.0012, "tip");
    expect(test.getPaymentAmount()).toBe(.0012)
})

test("APB, getPaymentAmount(): buy", () => {
    let test = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "buy");
    expect(test.getPaymentAmount()).toEqual(expect.any(Number))
})

test("APB, getPaymentAddresses()", (done) => {
    expect(APB.getPaymentAddresses()).toEqual(
        {
            btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
            ltc: "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN",
            flo: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
        }
    )
    done()
}, 10000)

test("APB, getPaymentAddresses() with artifact argument", (done) => {
    let test = new ArtifactPaymentBuilder();
    expect(test.getPaymentAddresses(artifact)).toEqual(
        {
            btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
            ltc: "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN",
            flo: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
        }
    )
    done()
}, 10000)

test("APB, getPaymentAddress()", (done) => {
    let test = new ArtifactPaymentBuilder(undefined, artifact);
    expect(test.getPaymentAddress(["btc"])).toEqual(
        {
            btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
        }
    )
    done()
}, 10000)

test("APB, getPaymentAddress() multiple coins", (done) => {
    let test = new ArtifactPaymentBuilder(undefined, artifact);
    expect(test.getPaymentAddress(["btc", "ltc"])).toEqual(
        {
            btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
            ltc: "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN"
        }
    )
    done()
}, 10000)

test("APB, nameToTicker() single string param", () => {
    expect(APB.nameToTicker("bitcoin")).toEqual("btc")
})

test("APB, nameToTicker() array param", () => {
    expect(APB.nameToTicker(["bitcoin", "litecoin", "flo"])).toEqual(["btc", "ltc", "flo"])
})

test("APB, tickerToName() single string param", () => {
    expect(APB.tickerToName("btc")).toEqual("bitcoin")
})

test("APB, tickerToName() array param", () => {
    expect(APB.tickerToName(["btc", "ltc", "flo"])).toEqual(["bitcoin", "litecoin", "flo"])
})

test("APB, getSupportedCoins() ",  () => {
    let test = new ArtifactPaymentBuilder();
    expect(test.getSupportedCoins(artifact)).toEqual(["btc", "ltc", "flo"])
})

test("APB, getSupportedCoins() from constructor ",  () => {
    let test = new ArtifactPaymentBuilder(undefined, artifact);
    expect(test.getSupportedCoins()).toEqual(["btc", "ltc", "flo"])
})

test("APB, getSupportedCoins() from parameter ",  () => {
    let test = new ArtifactPaymentBuilder();
    expect(test.getSupportedCoins(artifact.getPaymentAddresses())).toEqual(["btc", "ltc", "flo"])
})

test("APB, getSupportedCoins() from parameter 2 ",  () => {
    let test = new ArtifactPaymentBuilder();
    expect(test.getSupportedCoins( {
        btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
        ltc: "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN",
        flo: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
    })).toEqual(["btc", "ltc", "flo"])
})

test("APB, getSupportedCoins() with custom coin params ",  () => {
    let test = new ArtifactPaymentBuilder();
    expect(test.getSupportedCoins(artifact, ["flo"])).toEqual(["flo"])
})

test("APB, getSupportedCoins() with multiple custom coin params ",  () => {
    let test = new ArtifactPaymentBuilder();
    expect(test.getSupportedCoins(artifact, ["flo", "btc"])).toEqual(["flo", "btc"])
})

test("APB, getSupportedCoins() with unsupported custom coin params ",  () => {
    let test = new ArtifactPaymentBuilder();
    expect(test.getSupportedCoins(artifact, ["tron"])).toEqual([])
})


test("APB, getExchangeRates(): No Coin Parameters", async (done) => {
    try {
        let exchange_rates = await APB.getExchangeRates();
        expect(exchange_rates).toHaveProperty('flo');
        expect(exchange_rates).toHaveProperty('bitcoin');
        expect(exchange_rates).toHaveProperty('litecoin');
    } catch(err) {
        expect(err).toBeDefined()
    }

    done()
}, 100000);

test("APB, getExchangeRates(): single string parameter Parameters", async (done) => {
    try {
        let exchange_rates = await APB.getExchangeRates("flo");
        expect(exchange_rates).toHaveProperty('flo');
    } catch (err) {
        expect(err).toBeDefined()
    }

    done()
}, 100000);

test("APB, getExchangeRates(): One Coin Parameter", async (done) => {
    try {
        let exchange_rates = await APB.getExchangeRates(["flo"], "usd");
        expect(exchange_rates).toHaveProperty('flo');
    } catch (err) {
        expect(err).toBeDefined()
    }
    done()
}, 10000);

test("APB, getExchangeRates(): Multiple Coin Parameters", async (done) => {
    try {
        let exchange_rates = await APB.getExchangeRates(["flo", "bitcoin", "litecoin"], "usd");
        expect(exchange_rates).toHaveProperty('flo');
        expect(exchange_rates).toHaveProperty('bitcoin');
        expect(exchange_rates).toHaveProperty('litecoin');
    } catch (err) {
        expect(err).toBeDefined()
    }

    done()
}, 10000);

test("APB, fiatToCrypto", async (done) => {
    try {
        let exchange_rates = await APB.getExchangeRates()
        let conversion_costs = await APB.fiatToCrypto(exchange_rates, .00012);
        for (let coin in exchange_rates) {
            if (Object.keys(conversion_costs).indexOf(coin) !== -1){
                expect(conversion_costs).toHaveProperty(coin);
            }
        }
    } catch (err) {
        expect(err).toBeDefined()
    }

    done()
}, 10000)

test("APB, getWalletBalances(): without coin parameters", async (done) => {
    try {
        let b = await APB.getWalletBalances()
        expect(typeof b.flo === "number").toBeTruthy()
        expect(typeof b.bitcoin === "number" || typeof b.bitcoin === "string").toBeTruthy()
        expect(typeof b.litecoin === "number").toBeTruthy()
    } catch (err) {
        expect(err).toBeDefined()
    }

    done()
}, 30000);

test("APB, getWalletBalances(): with string parameter ", async (done) => {
    try {
        let balances = await APB.getWalletBalances("bitcoin");
        let b = balances["bitcoin"]
        expect(typeof b === "number" || typeof b === "string").toBeTruthy()
    } catch (err) {
        expect(err).toBeDefined()
    }

    done()
}, 20000);


test("APB, getWalletBalances(): with one coin parameter (flo)", async (done) => {
    try {
        let balances = await APB.getWalletBalances(["flo"]);
        expect(typeof balances["flo"] === "number").toBeTruthy()
    } catch (err) {
        expect(err).toBeDefined()
    }

    done()
}, 20000);

test("APB, getWalletBalances(): with two coin parameters (flo, bitcoin)", async (done) => {
    try {
        let b = await APB.getWalletBalances(["flo", "bitcoin"]);
        expect(typeof b.flo === "number").toBeTruthy()
        expect(typeof b.bitcoin === "number" || typeof b.bitcoin === "string").toBeTruthy()
    } catch (err) {
        expect(err).toBeDefined()
    }
    done()
}, 20000);

test("APB, getWalletBalances(): ticker to name (flo, btc)", async (done) => {
    try {
        let b = await APB.getWalletBalances(APB.tickerToName(["flo", "btc"]));
        expect(typeof b.flo === "number").toBeTruthy()
        expect(typeof b.bitcoin === "number" || typeof b.bitcoin === "string").toBeTruthy()
    } catch(err) {
        expect(err).toBeDefined()
    }

    done()
}, 20000);

test("APB, coinPicker()", async (done) => {
    try {
        let exchange_rates = await APB.getExchangeRates()
        let conversion_costs = await APB.fiatToCrypto(exchange_rates, .00012)
        let coin_balances = await APB.getWalletBalances();

        let selected_coin = APB.coinPicker(coin_balances, conversion_costs);
        expect(selected_coin).toEqual(expect.any(String));
    } catch (err) {
        expect(err).toBeDefined()
    }
    done()
}, 20000);

test("APB, coinPicker() with coin parameter (not enough balance will throw error)", async (done) => {
    try {
        let exchange_rates = await APB.getExchangeRates()
        let conversion_costs = await APB.fiatToCrypto(exchange_rates, .00012)
        let coin_balances = await APB.getWalletBalances();

        let selected_coin = APB.coinPicker(coin_balances, conversion_costs, "btc");
        expect(selected_coin.error).toBeTruthy()
    } catch (err) {
        expect(err).toBeDefined()
    }


    done()
}, 20000);

test("APB, sendPayment()", async (done) => {
    try {
        let payment = await APB.sendPayment("FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k", .00001);
        expect(typeof payment === "string").toBeTruthy()
    } catch (err) {
        expect(err).toBeDefined()
    }

    done()
}, 10000);

test("APB, pay()", async (done) => {
    try {
        let APBpay = new ArtifactPaymentBuilder(wallet, artifact, 0.00001, "tip");
        let pay = await APBpay.pay();
        expect(typeof pay === "string").toBeTruthy()
    } catch (err) {
        expect(err).toBeDefined()
    }

    done()
}, 20000)


test("APB, pay() with bitcoin (insufficient balance returns err)", async (done) => {
    let APBpay = new ArtifactPaymentBuilder(wallet, artifact, 0.00001, "tip", "flo");
    APBpay.pay("btc")
        .then(res => {expect(res).toBeDefined()})
        .catch(err => {expect(err).toBeDefined()})
    done()
}, 20000)

//@ToDo: add tests for 'view' and 'buy' type artifactFiles