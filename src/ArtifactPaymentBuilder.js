const Exchange = require("oip-exchange-rate");
var { ArtifactFile } = require("oip-index");

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

    // Sky Young (July 6, 2018)
    // Step 1: Get Artifact Payment Addresses (to know what coins are supported)
    async getPaymentAddresses(){
        return { flo: "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k" }
    }
    // Step 2: Calculate Exchange Rate (only for the supported coins) (this is so that we can know how much to pay in the cryptocurrency to the Artifact/ArtifactFile)
    async getExchangeRates(fiat, supported_coins_array){
        // Examples
        // 
        // return { 
        //      coin_name: exchange_rate_for_fiat,
        //      coin_name: exchange_rate_for_fiat 
        // }
        // 
        // fiat = "usd"
        // supported_coins_array: ["flo"]
        return { flo: 0.0512584 }
    }
    // Step 3: Calculate Payment Amounts for each cryptocurrency for all the supported coins (this uses the exchange rate along with the fiat amount defined in the Artifact/ArtifactFile)
    async calculatePaymentAmounts(artifact, artifactFile || amount, exchange_rates){
        return { flo: 1.154 }
    }
    // Step 4: Get Balances from our wallet for each coin that is supported (The supported coins that the Artifact accepts, gotten in step 1)
    async getWalletBalances(coins_array){
        // coins_array = ["flo"]
        return { flo: 2.5981 }
    }
    // Step 5: Choose a coin with enough balance in our wallet to spend (default to Flo, then Litecoin, then Bitcoin last)
    async selectCoin(balances, payment_amounts){
        // balances = { flo: 2.5981 }
        // payment_amounts = { flo: 1.154 }
        return "flo"
    }
    // (For now, only do Steps 1-5 and Step 9, we will add Steps 6-8 later :D)
    // Step 6: Get the Payment Addresses for the selected coin for both the Platform we are on, as well as the Influencer
    // Step 7: Get the Payment Percentages to be sent to the Platform and the Influencer from the Artifact/ArtifactFile
    // Step 8: Calculate amounts to send in the Selected Coin for each split to the Publisher, Platform, and Influencer
    // 
    // Step 9: Send the Payment to the Payment Addresses from Step 1 (and Step 6) using the selected coin from Step 5 for the amount calculated in Step 3 (or Step 7)
    async sendPayment(payment_address, amount){
        // payment_address = "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"
        // amount = 1.154
        
        var to = {};

        to[payment_address] = amount

        return this._wallet.sendPayment(to)
    }

    // Run is an overall function that runs the series of steps specified above and wires them all together
    async run(){
        // Step 1
        var payment_addresses = await this.getPaymentAddresses()

        var supported_coins = []

        for (var coin in payment_addresses)
            supported_coins.push(coin)

        // Step 2
        var exchange_rates = await this.getExchangeRates(this._artifact.getPaymentFiat(), supported_coins)

        // Step 3
        var payment_amounts = await this.calculatePaymentAmounts(this._artifact, this._artifactFile)

        // Step 4 (this step can be running while Step 3 is running)
        var wallet_balances = await this.getBalances(supported_coins)

        // Step 5
        var selected_coin = await this.selectCoin(wallet_balances, payment_amounts)

        var payment_address = payment_addresses[selected_coin]
        var amount_to_pay = payment_amounts[selected_coin]

        return await this.sendPayment(payment_addresses, amount_to_pay)
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
     * @param  {array} [paymentAddresses]     - Array of keyVal pair objects: [{[coin][coin address]},]
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
        // let addressPairs = paymentAddresses || false
        let coinsToFetch = [];
        // ------ @ToDo: use this when you get a valid 42 artifact
        if (!paymentAddresses) {
            addressPairs = this.getPaymentAddresses();
            if (!addressPairs) {
                for (let coin in addressPairs) {
                    for (let coin in addressPairs[coin]) {
                        coinsToFetch.push(coin)
                    }
                }
            } else return new Error("could not get payment addresses")

        }

        // ------ @ToDo: then delete this
        let addressPairs = [{flo: "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"}];
        for (let addr in addressPairs) {
            for (let coin in addressPairs[addr]) {
                coinsToFetch.push(coin)
            }
        }

        console.log(`Coins to fetch: ${coinsToFetch}`)

        // @ToDO: Get percentages to be paid out to Platforms and Influencers
        let platformCut, influencerCut;

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