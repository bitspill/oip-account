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

test("APB, getPaymentAddresses()", () => {
    expect(APB.getPaymentAddresses()).toEqual({
        btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
        ltc: "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN",
        flo: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
    })
}, 10000)

test("APB, getPaymentAddresses() with artifact argument", () => {
    let test = new ArtifactPaymentBuilder();
    expect(test.getPaymentAddresses(artifact)).toEqual({
        btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
        ltc: "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN",
        flo: "F6esyn5opgUDcEdJpujxS9WLfu8Zj9XUZQ"
    })
}, 10000)

test("APB, getPaymentAddress()", () => {
    let test = new ArtifactPaymentBuilder(undefined, artifact);
    expect(test.getPaymentAddress(["btc"])).toEqual({
        btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
    })
}, 10000)

test("APB, getPaymentAddress() multiple coins", (done) => {
    let test = new ArtifactPaymentBuilder(undefined, artifact);
    expect(test.getPaymentAddress(["btc", "ltc"])).toEqual({
        btc: "19HuaNprtc8MpG6bmiPoZigjaEu9xccxps",
        ltc: "LbpjYYPwYBjoPQ44PrNZr7nTq7HkYgcoXN"
    })
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
    expect(test.getSupportedCoins(undefined, artifact)).toEqual(["btc", "ltc", "flo"])
})

test("APB, getSupportedCoins() with string param and return",  () => {
    let test = new ArtifactPaymentBuilder(undefined, artifact);
    expect(test.getSupportedCoins("flo")).toEqual("flo")
})

test("APB, getSupportedCoins() with BS string param and return",  () => {
    let test = new ArtifactPaymentBuilder(undefined, artifact);
    expect(test.getSupportedCoins("kazy")).toEqual(["btc", "ltc", "flo"])
})

test("APB, getSupportedCoins() from constructor ",  () => {
    let test = new ArtifactPaymentBuilder(undefined, artifact);
    expect(test.getSupportedCoins()).toEqual(["btc", "ltc", "flo"])
})

test("APB, getSupportedCoins() from parameter ",  () => {
    let test = new ArtifactPaymentBuilder();
    expect(test.getSupportedCoins(undefined, artifact)).toEqual(["btc", "ltc", "flo"])
})

test("APB, getSupportedCoins() with custom coin params ",  () => {
    let test = new ArtifactPaymentBuilder();
    expect(test.getSupportedCoins(["flo"], artifact)).toEqual(["flo"])
})

test("APB, getSupportedCoins() with multiple custom coin params ",  () => {
    let test = new ArtifactPaymentBuilder();
    expect(test.getSupportedCoins(["flo", "btc"], artifact)).toEqual(["flo", "btc"])
})

test("APB, getSupportedCoins() with unsupported custom coin params ",  () => {
    let test = new ArtifactPaymentBuilder();
    expect(test.getSupportedCoins(["tron"], artifact)).toEqual(["btc", "ltc", "flo"])
})

test("APB, fiatToCrypto", () => {
    let exchange_rates = {
        "bitcoin": 8000,
        "litecoin": 100,
        "flo": 0.10
    }

    let conversion_costs = APB.fiatToCrypto(exchange_rates, 1);
    
    expect(conversion_costs.bitcoin).toBe(0.000125)
    expect(conversion_costs.litecoin).toBe(0.01)
    expect(conversion_costs.flo).toBe(10)
})

test("APB, coinPicker()", () => {
    let exchange_rates = {
        "bitcoin": 8000,
        "litecoin": 100,
        "flo": 0.10
    }

    let conversion_costs = APB.fiatToCrypto(exchange_rates, 1)

    let coin_balances = {
        "bitcoin": 0.1,
        "litecoin": 0.1,
        "flo": 12
    };

    let selected_coin = APB.coinPicker(coin_balances, conversion_costs);

    expect(selected_coin).toBe("flo")
});

test("APB, coinPicker() with coin parameter (not enough balance will return error)", () => {
    let exchange_rates = {
        "bitcoin": 8000,
        "litecoin": 100,
        "flo": 0.10
    }

    let conversion_costs = APB.fiatToCrypto(exchange_rates, 1)

    let coin_balances = {
        "bitcoin": 0.0001,
        "litecoin": 0.001,
        "flo": 9.99
    };

    let selected_coin = APB.coinPicker(coin_balances, conversion_costs);

    expect(selected_coin.error).toBe(true)
});

/*test("APB, pay()", async (done) => {
    await wallet.getCoinBalances()
    console.log(JSON.stringify(wallet.serialize()))
    let apb = new ArtifactPaymentBuilder(wallet, artifact, 0.00001, "tip");
    let txid = await apb.pay();
    done()
}, 45000)*/

//@ToDo: add tests for 'view' and 'buy' type artifactFiles