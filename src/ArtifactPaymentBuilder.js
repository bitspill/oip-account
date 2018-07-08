const Exchange = require("oip-exchange-rate");
var { ArtifactFile } = require("oip-index");

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
     * @param  {string} [fiat="usd"]   - The Fiat you wish to `tip` in (if amount was a number and NOT an ArtifactFile) default: "usd"
	 * @return {ArtifactPaymentBuilder}
	 */
	constructor(wallet, artifact, amount, type, fiat = "usd"){
        this._wallet = wallet;
        this._type = type;
        this._artifact = artifact;
        this._amount = amount;
        this._fiat = fiat;
        this._exchange = new Exchange();
	}

    /**
     * Get Artifact Payment Addresses (to know what coins are supported)
     * @return {Array.<Object>}
     * @example
     * let APB = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "view")
     * APB.getPaymentAddresses()
     *
     * //returns
     * [{ flo: "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k" }]
     */
    async getPaymentAddresses(){
        return await this._artifact.getPaymentAddresses();
    }

    /**
     * Get Payment Amount. Uses constructor variables to get payment amount based off ArtifactFile or amount parameter.
     * @return {Number} payment_amount
     */
    async getPaymentAmount(){
        switch (this._type) {
            case "view":
                if (this._amount instanceof ArtifactFile) {
                    return this._amount.getSuggestedPlayCost()
                } else throw new Error("Must provide valid ArtifactFile");
                break;
            case "buy":
                if (this._amount instanceof ArtifactFile) {
                    return this._amount.getSuggestedBuyCost()
                } else throw new Error("Must provide valid ArtifactFile");
                break;
            case "tip":
                if (typeof this._amount === "number") {
                    return this._amount;
                } else throw new Error("Amount must be valid number");
                break;
            default:
                throw new Error("Must have type either 'buy', 'view', or 'tip'")
        }
    }

    /**
     * Calculate Exchange Rate (only for the supported coins) (this is so that we can know how much to pay in the cryptocurrency to the Artifact/ArtifactFile)
     * @param  {array} [coins_array=this._wallet.getCoins()]    - An array of coins you want to get exchange rates for. If none are given, an array of all available coins will be used.
     * @param  {string} [fiat="usd"]     - The fiat currency you wish to check against. If none is given, "usd" is defaulted.
     * @return {Object} exchange_rates
     * @example
     * let APB = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "view")
     * APB.getExchangeRates("usd", ["flo", "bitcoin", "litecoin"])
     *
     * //returns
     * {
     *      "flo": expect.any(Number) || "error",
     *      "bitcoin": expect.any(Number) || "error",
     *      "litecoin": expect.any(Number) || "error"
     * }
     */
    async getExchangeRates(coins_array, fiat = this._fiat){
        let coins =  coins_array || Object.keys(this._wallet.getCoins());
        let rates = {};
        let promiseArray = {};

        if (!coins) throw new Error("No coins found to fetch exchange rates");

        for (let coin of coins) {
            promiseArray[coin] = this._exchange.getExchangeRate(coin, fiat);
        }

        for (let coin in promiseArray) {
            try {
                let rate = await promiseArray[coin];
                rates[coin] = rate;
            } catch (err) {
                rates[coin] = "error fetching rate";
            }
        }
        console.log(`Exchange rates: ${JSON.stringify(rates, null, 4)}`)
        return rates;
    }

    /**
     * Calculate Payment Amounts for each cryptocurrency for all the supported coins (this uses the exchange rate along with the fiat amount defined in the Artifact/ArtifactFile)
     * @param {Object} exchange_rates           - see getExchangeRates()
     * @param {number|Array.<Number>} payment_amounts          - the amount you wish to tip or the cost of a file to view or buy (currently only supports one payment amount)
     * @returns {Object} conversion_costs
     * @example
     * //returns
     * {
     *      "coin": expect.any(Number),
     * }
     */
    async convertCosts(exchange_rates, payment_amounts){
        let conversion_costs = {};
        for (let coin in exchange_rates) {
            //this filters out coins that don't have a balance
            if (typeof exchange_rates[coin] === "number") {
                //@ToDo: add support for multiple payments (currently only accepts a single amount)
                conversion_costs[coin] = payment_amounts / exchange_rates[coin];
            }
        }
        console.log(`Conversion costs: ${JSON.stringify(conversion_costs, null, 4)}`)
        return conversion_costs
    }

    /**
     * Get Balances for each coin that is supported (The supported coins that the Artifact accepts)
     * @param  {array} [coins_array=this._wallet.getCoins()]    - An array of coins you want to get balances for. If no coins are given, an array of all available coins will be used.
     * @return {object} coin_balances
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
    async getWalletBalances(coins_array){
        const coins = coins_array || Object.keys(this._wallet.getCoins());
        let _coins = this._wallet.getCoins();
        // console.log(`Check to see coin_array: ${coins_array} -- ${coins} -- ${_coins}`)

        let coinPromises = {};
        let coin_balances = {};

        for (let coin of coins) {
            try {
                coinPromises[coin] = _coins[coin].getBalance({discover: true})
            } catch (err) {
                coinPromises[coin] = `${err}`;
                // console.log(`Error on fetching promise for ${coin}: ${err}`)
            }
        }

        for (let coin in coinPromises) {
            try {
                coin_balances[coin] = await coinPromises[coin];
                // console.log(`${coin}: resolved balance: ${coin_balances[coin]}`)

            } catch (err) {
                coin_balances[coin] = "error fetching balance";
                // console.log(`Error while trying to resolve the balance of ${coin}: ${err}`)

                if (err.response && err.response.statusText) {
                    // console.log("error response status text: ", err.response.statusText)
                }
            }
        }
        console.log(`Coin balances: ${JSON.stringify(coin_balances, null, 4)}`);
        return coin_balances
    }

    /**
     * Choose a coin with enough balance in our wallet to spend (default to Flo, then Litecoin, then Bitcoin last)
     * @param  {object} coin_balances    - Key value pairs [coin][balance]. See: getBalances()
     * @param  {object} conversion_costs    - Key value pairs [coin][conversion cost]. See: convertCosts()
     * @return {string} The `selected_coin` to use for the transaction
     * @example
     * let APB = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "view")
     * APB.selectCoin(coin_balances, conversion_costs)
     *
     * //returns
     * "flo"
     */
    async selectCoin(coin_balances, conversion_costs){
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

        if (!usableCoins.length) {
            throw new Error("Insufficient Funds");
        }
        if (usableCoins.includes("flo")) {selected_coin = "flo"}
        else if (usableCoins.includes("litecoin")) {selected_coin = "litecoin"}
        else if (usableCoins.includes("bitcoin")) {selected_coin = "bitcoin"}
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
        console.log(`Usable coin(s): ${usableCoins}. The selectedCoin: ${selected_coin}`);
        return selected_coin
    }


    // (For now, only do Steps 1-5 and Step 9, we will add Steps 6-8 later :D)
    // Step 6: Get the Payment Addresses for the selected coin for both the Platform we are on, as well as the Influencer
    // Step 7: Get the Payment Percentages to be sent to the Platform and the Influencer from the Artifact/ArtifactFile
    // Step 8: Calculate amounts to send in the Selected Coin for each split to the Publisher, Platform, and Influencer
    // 
    // Step 9: Send the Payment to the Payment Addresses from Step 1 (and Step 6) using the selected coin from Step 5 for the amount calculated in Step 3 (or Step 7)

    /**
     * Send the Payment to the Payment Addresses using the selected coin from selectCoin() for the amount calculated
     * @param {string} payment_address      -The addresses you wish to send money to
     * @param {number} amount_to_pay                       -The amount you wish to pay
     * @returns {Promise} A promise that resolves to a txid if the tx went through or an error if it didn't
     */
    async sendPayment(payment_address, amount_to_pay){
        // payment_address = "FLZXRaHzVPxJJfaoM32CWT4GZHuj2rx63k"
        // amount = 1.154

        let payment_options = {}, to ={};
        to[payment_address] = amount_to_pay;
        payment_options.to = to;

        console.log(`payment_options: ${JSON.stringify(payment_options, null, 4)}`)
        return this._wallet.sendPayment(payment_options)
    }

    /**
     * Pay is the overall function that runs a series of methods to calculate balances, addresses, and execute payment
     * @returns {Promise} A promise that resolves to a txid if the tx went through or an error if it didn't
     */
    async pay(){
        //Step 1.a: Determine amount to pay
        let payment_amount = await this.getPaymentAmount();

        // Step 1.b: Get supported_coin and addresses
        const paymentAddresses = await this.getPaymentAddresses();

        const supported_coins = [];

        for (let coin in paymentAddresses) {
            supported_coins.push(coin);
        }

        // Step 2: Get exchange rates for supported_coins
        const exchange_rates = await this.getExchangeRates(supported_coins);

        // Step 3: Convert the costs using the exchange_rates
        const conversion_costs = await this.convertCosts(exchange_rates, payment_amount);

        // Step 4 (this step can be running while Step 3 is running)
        const coin_balances = await this.getWalletBalances(supported_coins);

        // Step 5
        const selected_coin = await this.selectCoin(coin_balances, conversion_costs);

        const payment_address = paymentAddresses[selected_coin];
        const amount_to_pay = conversion_costs[selected_coin];

        return await this.sendPayment(payment_address, amount_to_pay)
    }
}

module.exports = ArtifactPaymentBuilder;