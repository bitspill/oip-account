const Exchange = require("oip-exchange-rate");
var { ArtifactFile } = require("oip-js");

class ArtifactPaymentBuilder {
	/**
	 * Create a new ArtifactPaymentBuilder
	 * @param  {Wallet} wallet   - A live OIP-HDMW logged in wallet
	 * @param  {Artifact} artifact - The Artifact related to the Payment you wish to make
     * @param  {ArtifactFile|number} amount	- The amount you wish to pay (`tip`), or the ArtifactFile you wish to pay for (`view` & `buy`)
     * @param  {string} type     - The type of the purchase, either `tip`, `view`, or `buy`
     * @param  {string} [fiat]   - The Fiat you wish to `tip` in (if amount was a number and NOT an ArtifactFile) default: "usd"
	 * @return {ArtifactPaymentBuilder}          [description]
	 */
	constructor(wallet, artifact, amount, type, fiat){
        this._wallet = wallet;
        this._type = type;
        this._artifact = artifact;
        this._amount = amount;
        this._fiat = fiat || "usd";
        this._exchange = new Exchange();
	}
	getPaymentAddresses(){
        return this._artifact.getPaymentAddresses();
	}

	/**
	 * Pay for the item you requested
	 * @return {Promise<Transaction>} Returns a Promise that resolves to the payment transaction, or rejects if there was an error
	 */
	async pay(){
	    console.log("Beginning Payment")
	    let paymentAmount, fiat;
	    fiat = this._fiat;
        // Get ArtifactFile Cost and Artifact Fiat
	    if (this._amount instanceof ArtifactFile) {
	        switch (this._type) {
                case "buy":
                    paymentAmount = this._amount.getSuggestedBuyCost();
                    break;
                case "play":
                    paymentAmount = this._amount.getSuggestedPlayCost();
                    break;
                case "tip":
                    paymentAmount = this._amount;
                    break;
            }
            //@ToDo: set default
        } else {paymentAmount = this._amount}

        console.log(`paymentAmount: ${paymentAmount} and Fiat: ${this._fiat}`);

        let superObject = await this.superFunction(paymentAmount, fiat);
        let usableCoins = superObject["usableCoins"];

        // Send the payment in that crypto to the User (using this.wallet)
        if (usableCoins.length > 0) {
            // Grab Public Addresses
            this.getPaymentAddresses()

            // Choose coin to use

            resolve(await this._wallet.sendPayment());
        } else (reject(new Error("Insufficient funds!")))

        // @ToDo: Save Transaction to `paymentHistory` if payment went through successfully

    }

    /**
     * Get balances for each coin
     * @param  {array} [coinArray]    - An array of coins you want to get balances for. If no coins are given, an array of all available coins will be used.
     * @return {object}
     * @example
     * let APB = new ArtifactPaymentBuilder(...)
     * APB.getBalances(["flo", "bitcoin", "litecoin"])
     *
     * //returns
     * {
     *      "flo": 2.16216,
     *      "bitcoin": "error fetching balance",
     *      "litecoin": 3.32211
     * }
     */
     async getBalances(coinArray) {
            const coins = coinArray || Object.keys(this._wallet.getCoins());
            let coinClass = this._wallet.getCoins();

            let coinPromises = {};
            let balances = {};
            console.log(`Coin in get balances: ${JSON.stringify(coins, null, 4)}`);
            for (let coin of coins) {
                coinPromises[coin] = {};
                try {
                    coinPromises[coin] = coinClass[coin].getBalance({discover: true})
                } catch (err) {
                    coinPromises[coin] = "promise error fetching balance";
                    console.log(`Error on ${coin}: ${err}`)
                }
            }

            for (let coin in coinPromises) {
                try {
                    let balance = await coinPromises[coin];
                    balances[coin] = {};
                    balances[coin] = balance
                } catch (err) {
                    balances[coin] = {};
                    balances[coin] = "error fetching balance";
                    if (err.response && err.response.statusText) {
                        console.log("error fetching balance: ", err.response.statusText)
                    }
                }
            }
            return balances
    }


    /**
     * Calculate the exchange rate between a fiat currency and a cryptocurrency
     * @param  {string} fiat     - The fiat currency you wish to check against
     * @param  {array} [coinArray]    - An array of coins you want to get exchange rates for. If no coins are given, an array of all available coins will be used.
     * @return {object} rates
     * @example
     * let APB = new ArtifactPaymentBuilder(...)
     * APB.getExchangeRates("usd", ["flo", "bitcoin", "litecoin"])
     *
     * //returns
     * {
     *      "flo": {"usd": expect.any(Number) || "error},
     *      "bitcoin": {"usd": expect.any(Number) || "error},
     *      "litecoin": {"usd": expect.any(Number) || "error"}
     * }
     */
    async getExchangeRates(fiat, coinArray) {
        let coins =  coinArray || Object.keys(this._wallet.getCoins());
        let rates = {};
        let promiseArray = {};

        for (let coin of coins) {
            promiseArray[coin] = {};
            promiseArray[coin].promise = this._exchange.getExchangeRate(coin, fiat);
            promiseArray[coin].fiat = fiat
        }

        for (let p in promiseArray) {
            try {
                let rate = await promiseArray[p].promise;
                rates[p] = {};
                rates[p][promiseArray[p].fiat] = rate;
            } catch (err) {
                rates[p] = {};
                rates[p][promiseArray[p].fiat] = "error fetching rate";

            }
        }

        return rates
    }

    /**
     * Gets the coins with a sufficient balance to pay crpyto amount after price conversion
     * @param  {string} paymentAmount     - The amount in fiat you wish to send or the cost of an item
     * @param  {array} [paymentAddresses]     - Array of keyVal pairs: [coin][coin address]
     * @return {object}
     * @example
     *
     * const APB = new APB(wallet, artifact, 00.00012, "view");
     * APB.superFunction(00.00012)
     *
     * //returns
     *{
     *    "usableCoins": [
     *         "flo"
     *     ],
     *     "conversionPrices": {
     *         "flo": 0.0024994844813257264
     *     },
     *     "coinBalances": {
     *         "flo": 0.00302368
     *     },
     *     "exchangeRates": {
     *         "flo": {
     *             "usd": 0.0480099
     *         }
     *     }
     * }
     *
     */
    
    async superFunction(paymentAmount, paymentAddresses) {
        let coinsToFetch = [];
        // ------ @ToDo: use this when you get a valid 42 artifact
        addrs = this.getPaymentAddresses();
        // for (let coin in addrs) {
        //    for (let coin in addrs[coin]) {
        //         coinsToFetch.push(coin)
        //     }
        // }

        // ------ @ToDo: then delete this
        let addressPairs = [{flo: "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"}];
        for (let addr in addressPairs) {
            for (let coin in addressPairs[addr]) {
                coinsToFetch.push(coin)
            }
        }

        console.log(`Coins to fetch: ${coinsToFetch}`)

        // @ToDO: Get percentages to be paid out to Platforms and Influencers

        // Calculate crypto cost based on the exchange rate for the Fiat (using oip-exchange-rate)
        let exchangeRates;
        try {
            exchangeRates = await this.getExchangeRates(this._fiat, coinsToFetch);
            console.log(`exchangeRates: ${JSON.stringify(exchangeRates, null, 4)}`)
        } catch (err) {
            console.log(`Error on getExchangeRates: ${err}`)
        };

        // Check Coin Balances
        let coinBalances;
        try {
            coinBalances = await this.getBalances(coinsToFetch)
            console.log(`myCoinBalances: ${JSON.stringify(coinBalances, null, 4)}`)

        } catch (err) {
            console.log(`Error on getBalances: ${err}`)
        }

        //exchange rate / file cost
        let conversionPrices = {};
        for (let coin in exchangeRates) {
            if (typeof exchangeRates[coin][this._fiat] === "number") {
                conversionPrices[coin] = paymentAmount / exchangeRates[coin][this._fiat];
                console.log(`${conversionPrices[coin]} = ${paymentAmount} / ${exchangeRates[coin][this._fiat]}`)
            }
        }
        console.log("conversionPrices: ", conversionPrices);

        // If not enough balance
        // reject(new Error("Not Enough Balance!"))
        // Pick crypto(s) to pay with

        let usableCoins = [];
        for (let coin in coinBalances) {
            if (coinBalances[coin] && conversionPrices[coin]) {
                if (coinBalances[coin] >= conversionPrices[coin]) {
                    usableCoins.push(coin)
                } else console.log(`Balance not enough for ${coin}: ${coinBalances[coin]} <= ${conversionPrices[coin]}`)
            }
        }
        console.log(`Usable coins: ${usableCoins}`);

        return {
            usableCoins,
            conversionPrices,
            coinBalances,
            exchangeRates
        }
    }
}

module.exports = ArtifactPaymentBuilder;