const {ArtifactFile} = require("oip-index")
const {Artifact} = require("oip-index")
const Exchange = require("oip-exchange-rate");

/**
 * A payment builder that calculates exchange rates, balances, conversion costs, and which coin to use for payment
 */
class ArtifactPaymentBuilder {
	/**
	 * Create a new ArtifactPaymentBuilder
	 * @param  {Wallet} wallet   - A live OIP-HDMW logged in wallet
	 * @param  {Artifact} artifact - The Artifact related to the Payment you wish to make
     * @param  {ArtifactFile|number} amount	- The amount you wish to pay (`tip`), or the ArtifactFile you wish to pay for (`view` & `buy`)
     * @param  {string} type     - The type of the purchase, either `tip`, `view`, or `buy`
     * @param  {string} [coin=undefined]   - The Coin you wish to pay with
     * @param  {string} [fiat="usd"]   - The Fiat you wish to `tip` in (if amount was a number and NOT an ArtifactFile) default: "usd"
	 * @return {ArtifactPaymentBuilder}
	 */
	constructor(wallet, artifact, amount, type, coin = undefined, fiat = "usd"){
        this._wallet = wallet;
        this._type = type;
        this._artifact = artifact;
        this._amount = amount;
        this._coin = coin;
        this._fiat = fiat;
        this._exchange = new Exchange();
	}
    /**
     * Get Payment Amount. Uses constructor variables to get payment amount based off ArtifactFile or amount parameter.
     * @return {Number} payment_amount
     */
    getPaymentAmount(){
        switch (this._type) {
            case "view":
                if (this._amount instanceof ArtifactFile) {
                    return this._amount.getSuggestedPlayCost()
                } else throw new Error("Must provide valid ArtifactFile");
            case "buy":
                if (this._amount instanceof ArtifactFile) {
                    return this._amount.getSuggestedBuyCost()
                } else throw new Error("Must provide valid ArtifactFile");
            case "tip":
                if (typeof this._amount === "number") {
                    return this._amount;
                } else throw new Error("Amount must be valid number");
            default:
                throw new Error("Must have type either 'buy', 'view', or 'tip'")
        }
    }
    /**
     * Get Artifact Payment Addresses (to know what coins are supported)
     * @param {Artifact} [artifact] - Get the payment addresses of a given artifact... if no artifact is given, it will use the artifact given in the constructor
     * @return {Object}
     * @example
     * let APB = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "view")
     * APB.getPaymentAddresses()
     *
     * //returns
     * { flo: "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k" }
     */
    getPaymentAddresses(artifact){
        return artifact ? artifact.getPaymentAddresses() : this._artifact.getPaymentAddresses()
    }
    /**
     * Get Artifact Payment Address
     * @param {string|Array.<string>} coins - A string or array of strings you wish to get the payment addresses for
     * @param {Artifact} [artifact] - Get the payment addresses of a given artifact... if no artifact is given, it will use the artifact given in the constructor
     * @return {Object}
     * @example
     * let APB = new ArtifactPaymentBuilder(undefined, artifact)
     * APB.getPaymentAddresses(["btc"])
     *
     * //returns
     * { btc: "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k" }
     */
    getPaymentAddress(coins, artifact){
        return artifact ? artifact.getPaymentAddress(coins) : this._artifact.getPaymentAddress(coins)
    }
    /**
     * Name to Ticker (only supports bitcoin, litecoin, and flo currently
     * @param {(string|Array.<string>)} coin_names - Names of coins
     * @return {(string|Array.<string>)}
     */
    nameToTicker(coin_names){
        let switchNames = (name) => {
            switch(name) {
                case "bitcoin":
                    return "btc"
                case "litecoin":
                    return "ltc"
                case "flo":
                    return "flo"
                default:
                    return name
            }
        }
        let coin_array = []
        if (Array.isArray(coin_names)) {
            for (let name of coin_names) {
                coin_array.push(switchNames(name))
            }
            return coin_array
        }
        return switchNames(coin_names)
    }

    /**
     * Ticker to name (only supports btc, ltc, and flo currently
     * @param {(string|Array.<string>)} coin_tickers - Coin tickers
     * @return {(string|Array.<string>)}
     */
    tickerToName(coin_tickers){
        let switchNames = (ticker) => {
            switch(ticker) {
                case "btc":
                    return "bitcoin"
                case "ltc":
                    return "litecoin"
                case "flo":
                    return "flo"
                default:
                    return ticker
            }
        }
        let coin_array = []
        if (Array.isArray(coin_tickers)) {
            for (let ticker of coin_tickers) {
                coin_array.push(switchNames(ticker))
            }
            return coin_array
        }
        return switchNames(coin_tickers)

    }


    /**
     * getSupportedCoins retrieves the coins the Artifact accepts as payment
     * @param {(string|Array.<string>)} [coins] - An array of coins you want to check support for
     * @param {(Object|Artifact)} [artifact] - Either an object of [coin][addrs] or an Artifact to get the addresses from. If nothing is passed in, it will attempt to use the constructor's Artifact
     * @returns {(string|Array.<string>)} An array of coins that the Artifact accepts as payment. If Artifact does not support coin input, an empty array will be returned
     */
    getSupportedCoins(coins, artifact) {
        let addrs = artifact || this._artifact
        let supported_coins = [];
        if (addrs instanceof Artifact) {
            addrs = addrs.getPaymentAddresses()
        }
        if (typeof addrs === "object") {
            for (let coin in addrs) {
                supported_coins.push(coin)
            }
        } else { throw new Error("Invalid parameter. Expecting an Array of Objects: [{[coin][addr]},]")}

        if (coins) {
            if (Array.isArray(coins)) {
                let _coins = []
                for (let my_coin of coins) {
                    for (let sup_coin of supported_coins) {
                        if (my_coin === sup_coin)
                            _coins.push(my_coin)
                    }
                }
                return _coins
            } else if (typeof coins === "string") {
                if (supported_coins.includes(coins)) {return coins}
                else { return ""}
            }
        }

        return supported_coins
    }
    
    /**
     * Calculate Exchange Rate (only for the supported coins) (this is so that we can know how much to pay in the cryptocurrency to the Artifact/ArtifactFile)
     * @param  {Array.<String>} [coin_array=this._wallet.getCoins()]    - An array of coins you want to get exchange rates for. If none are given, an array of all available coins will be used.
     * @param  {string} [fiat="usd"]     - The fiat currency you wish to check against. If none is given, "usd" is defaulted.
     * @return {Object} exchange_rates
     * @example
     * let APB = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "view")
     * APB.getExchangeRates(["flo", "bitcoin", "litecoin"], "usd")
     *
     * //returns
     * {
     *      "flo": expect.any(Number) || "error",
     *      "bitcoin": expect.any(Number) || "error",
     *      "litecoin": expect.any(Number) || "error"
     * }
     */
    async getExchangeRates(coin_array, fiat = this._fiat){
        let coins =  coin_array || Object.keys(this._wallet.getCoins());
        if (typeof coin_array === "string") {coins = [coin_array]}
        let rates = {};
        let promiseArray = {};

        if (!coins) throw new Error("No coins found to fetch exchange rates. Check coin_array parameter or constructor");

        for (let coin of coins) {
            promiseArray[coin] = this._exchange.getExchangeRate(coin, fiat);
        }

        for (let coin in promiseArray) {
            try {
                let rate = await promiseArray[coin];
                rates[coin] = rate;
            } catch (err) {
                rates[coin] = "error fetching rate";

                // if (err.response && err.response.statusText) {
                //     console.log("error response statusText: ", err.response.statusText)
                // }
            }
        }
        // console.log(`Exchange rates: ${JSON.stringify(rates, null, 4)}`)
        return rates;
    }

    /**
     * Convert fiat price to crypto price using live exchange_rates
     * @param {Object} exchange_rates           - see getExchangeRates()
     * @param {number} fiat_amount          - the amount you wish to get the conversion cost for
     * @returns {Object} conversion_costs
     * @example
     *  let exchange_rates = await APB.getExchangeRates(wallet)
     *  let conversion_costs = await APB.fiatToCrypto(exchange_rates, .00012);
     * //returns
     * {
     *      "coin": expect.any(Number),
     *      ...
     * }
     */
    fiatToCrypto(exchange_rates, fiat_amount){
        let conversion_costs = {};
        for (let coin in exchange_rates) {
            //this filters out coins that don't have a balance
            if (typeof exchange_rates[coin] === "number") {
                //@ToDo: add support for multiple payments (currently only accepts a single amount)
                conversion_costs[coin] = fiat_amount / exchange_rates[coin];
            }
        }
        // console.log(`Conversion costs: ${JSON.stringify(conversion_costs, null, 4)}`)
        return conversion_costs
    }

    /**
     * Get Balances for each coin that is supported (The supported coins that the Artifact accepts)
     * @param  {Array.<string>} [coin_array=this._wallet.getCoins()]    - FULL NAMES OF COINS REQUIRED: An array of coins you want to get balances for. If no coins are given, an array of all available coins will be used.
     * @return {Promise.<Object>} coin_balances
     * @example
     * let APB = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "view")
     * APB.getBalances(["flo", "bitcoin", "litecoin"])
     *
     * //returns
     * {
     *      "flo": 2.16216,
     *      "bitcoin": "error fetching balance",
     *      "litecoin": 3.32211
     * }
     */
    async getWalletBalances(coin_array){
        let coins = coin_array || Object.keys(this._wallet.getCoins());
        if (typeof coin_array === "string") {coins = [coin_array]}
        let walletCoins = this._wallet.getCoins();

        let coinPromises = {};
        for (let coin of coins) {
            try {
                if (walletCoins[coin]) {
                    coinPromises[coin] = walletCoins[coin].getBalance({discover: true})
                }
            } catch (err) {
                coinPromises[coin] = `${err}`;
            }
        }

        let coin_balances = {};
        for (let coin in coinPromises) {
            try {
                coin_balances[coin] = await coinPromises[coin];
            } catch (err) {
                if (err) {
                    coin_balances[coin] = err.message;
                }
            }
        }
        return coin_balances
    }

    /**
     * Picks a coin with enough balance in our wallet to spend (default to flo, then litecoin, then bitcoin last)
     * @param  {object} coin_balances    - Key value pairs [coin][balance]. See: getBalances()
     * @param  {object} conversion_costs    - Key value pairs [coin][conversion cost]. See: convertCosts()
     * @param {string} [coin] - Preferred coin to pay with
     * @return {string|Object} - A string with the selected coin that has enough balance to pay with or an object containing an error status and response
     * @example
     * let APB = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "view")
     * APB.coinPicker(coin_balances, conversion_costs)
     *
     * //returns
     * "flo" || {error: true, response: "function coinPicker could not get coin with sufficient balance"}
     */
    coinPicker(coin_balances, conversion_costs, coin){
	    let selected_coin;
        let usableCoins = [];
        for (let coin in coin_balances) {
            if (typeof coin_balances[coin] === "number" && typeof conversion_costs[coin] ==="number") {
                if (coin_balances[coin] >= conversion_costs[coin]) {
                    usableCoins.push(coin)
                } else {
                    // console.log(`${coin} has insufficient funds: either error or amount <= ${conversion_costs[coin]}`)
                }
            }
        }

        if (!usableCoins.length || (coin && !usableCoins.includes(coin))) {
           return {error: true, response: "function coinPicker could not get coin with sufficient balance"}
        }
        if (usableCoins.includes(coin)) {return coin}
        else if (usableCoins.includes("flo")) {return "flo"}
        else if (usableCoins.includes("litecoin")) {return "litecoin"}
        else if (usableCoins.includes("bitcoin")) {return "bitcoin"}
        else {
            let highestAmount = 0;
            let coinWithHighestAmount;
            for (let coin of usableCoins) {
                if (coin_balances[coin] >= highestAmount) {
                    highestAmount = coin_balances[coin];
                    coinWithHighestAmount = coin;
                }
            }
            selected_coin = coinWithHighestAmount;
        }
        return selected_coin
    }


    /**
     * Pay is the overall function that runs a series of methods to calculate balances, addresses, and execute payment
     * @param {string} [coin] - The coin you want to pay with
     * @returns {Promise.<string>} A promise that resolves to a txid if the tx went through or an error if it didn't
     */
    async pay(coin){
        //Step 1.a: Determine amount to pay
        let payment_amount
         try {
            payment_amount = await this.getPaymentAmount();
         } catch (err) {throw new Error("Could not get amount to pay")}

        let supported_coins = this.getSupportedCoins(this._artifact, coin);

        if (!supported_coins.length)
            throw new Error("Coin(s) not supported. Artifact may not support coin parameter")

        // Step 2: Get exchange rates for supported_coins
        let exchange_rates
        try {
            exchange_rates = await this.getExchangeRates(supported_coins);
        } catch (err) {throw new Error(`Could not get exchange rates for ${supported_coins}`)}

        // Step 3: Convert the file/tip costs using the exchange_rates
        let conversion_costs
        try {
            conversion_costs = await this.fiatToCrypto(exchange_rates, payment_amount);
        } catch (err) {throw new Error("Could not get conversion costs for artifact file")}

        // Step 4 (this step can be running while Step 3 is running)
        let coin_balances
        try {
            coin_balances = await this.getWalletBalances(this.tickerToName(supported_coins));
        } catch (err) {throw new Error("Could not get coin_balances")}

        // Step 5
        let payment_coin = this.coinPicker(coin_balances, conversion_costs, coin)
        if (payment_coin.error) {throw new Error("Insufficient funds")}

        let payment_address = this.getPaymentAddress(payment_coin)

        const amount_to_pay = conversion_costs[payment_coin];

        return await this.sendPayment(payment_address, amount_to_pay, payment_coin)
    }
    /**
     * Send the Payment to the Payment Addresses using the selected coin from coinPicker() for the amount calculated
     * @param {string} payment_address      -The addresses you wish to send money to
     * @param {number} amount_to_pay                       -The amount you wish to pay in crypto
     * @param {string} [selected_coin]                     -The coin you wish to spend with. If no coin is given, function will try to match address with a coin.
     * @returns {Promise} A promise that resolves to a txid if the tx went through or an error if it didn't
     */
    async sendPayment(payment_address, amount_to_pay, selected_coin){
        // payment_address = "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"
        // amount = 1.154

        let payment_options = {}, to ={};
        to[payment_address] = amount_to_pay;
        payment_options.to = to;
        if (selected_coin) {payment_options.coin = selected_coin};

        // console.log(`payment_options: ${JSON.stringify(payment_options, null, 4)}`)
        return await this._wallet.sendPayment(payment_options)
    }
}



export default ArtifactPaymentBuilder;