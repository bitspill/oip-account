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
     * Internal function used for both nameToTicker and tickerToName
     * @param  {String|Array.<String>} coins - The Coins names/tickers you would like to swap
     * @param  {String} from_type - Either "ticker" or "name"
     * @param  {String} to_type - Either "ticker" or "name"
     * @return {String|Array.<String>} Returns the converted tickers/names
     */
    _swapCoinTickerName(coins, from_type, to_type){
    	// Get all coins supported by the wallet
    	let wallet_coins = this._wallet.getCoins()

    	// Get all of the networks from those coins
    	let coin_networks = []
        for (let w_coin in wallet_coins){
        	coin_networks.push(wallet_coins[w_coin].getCoinInfo())
        }

        // Create name/ticker pairs from the networks
        let name_pairs = coin_networks.map((network) => {
            return {
                name: network.name.toLowerCase(), 
                ticker: network.ticker.toLowerCase()
            }
        })

        // Function to swap ticker/name
        let swap = (coin) => {
            for (let pair of name_pairs){
                if (pair[from_type] === coin)
                    return pair[to_type]
            }

            return coin
        }

        // Handle if `coins` is an array
        if (Array.isArray(coins)) {
        	let swapped_array = []

            for (let coin of coins) {
                swapped_array.push(swap(coin))
            }

            return swapped_array
        }

        // Handle if `coins` is only a string
        return swap(coins)
    }
    /**
     * Name to Ticker (only supports bitcoin, litecoin, and flo currently
     * @param {(string|Array.<string>)} coin_names - Names of coins
     * @return {(string|Array.<string>)}
     */
    nameToTicker(coin_names){
       return this._swapCoinTickerName(coin_names, "name", "ticker")
    }
    /**
     * Ticker to name (only supports btc, ltc, and flo currently
     * @param {(string|Array.<string>)} coin_tickers - Coin tickers
     * @return {(string|Array.<string>)}
     */
    tickerToName(coin_tickers){
        return this._swapCoinTickerName(coin_tickers, "ticker", "name")
    }
    /**
     * getSupportedCoins retrieves the coins the Artifact accepts as payment
     * @param {string|Array.<string>} [preferred_coins] - An array of coins you would prefer to use
     * @param {Artifact} [artifact] - An Artifact to get the addresses from. If nothing is passed in, it will attempt to use the constructor's Artifact.
     * @returns {string|Array.<string>} An array of coins that the Artifact accepts as payment. If Artifact does not support coin input, an empty array will be returned
     */
    getSupportedCoins(preferred_coins, artifact) {
        let artifact_to_use = artifact || this._artifact
        let artifact_payment_addresses
        let artifact_supported_coins = [];

        // Get the artifact payment addresses
        if (artifact_to_use instanceof Artifact) {
            artifact_payment_addresses = artifact_to_use.getPaymentAddresses()
        }

        // Make sure that we get the correct response back
        if (typeof artifact_payment_addresses === "object") {
            for (let coin in artifact_payment_addresses) {
                artifact_supported_coins.push(coin)
            }
        } else { 
        	throw new Error("Invalid parameter. Expecting an Array of Objects: [{[coin][addr]},]")
        }

        // If we are passed preferred_coins to try to select, attempt to grab them
        if (preferred_coins) {
        	// The preferred_coins param might be an array
            if (Array.isArray(preferred_coins)) {
                let matched_preferred_coins = []

                // Match coins that are supported by the artifact, as well as the
                // preferred coins
                for (let preferred_coin of preferred_coins) {
                    for (let supported_coin of artifact_supported_coins) {
                        if (preferred_coin === supported_coin)
                            matched_preferred_coins.push(preferred_coin)
                    }
                }

                // Check if we matched to preferred coins
                if (matched_preferred_coins.length > 0)
	                return matched_preferred_coins
            } else if (typeof preferred_coins === "string") {
            	// See if the preferred coin can be selected
                if (artifact_supported_coins.includes(preferred_coins)) {
                	// If we matched, return it
                	return preferred_coins
                }
            }
        }

        // If we didn't match to the preferred coins, then just return 
        // all the found artifact supported coins
        return artifact_supported_coins
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
     * Picks a coin with enough balance in our wallet to spend (default to flo, then litecoin, then bitcoin last)
     * @param  {object} coin_balances    - Key value pairs [coin][balance]. See: getBalances()
     * @param  {object} conversion_costs    - Key value pairs [coin][conversion cost]. See: convertCosts()
     * @param {string} [preferred_coin] - Preferred coin to pay with
     * @return {string|Object} - A string with the selected coin that has enough balance to pay with or an object containing an error status and response
     * @example
     * let APB = new ArtifactPaymentBuilder(wallet, artifact, artifactFile, "view")
     * APB.coinPicker(coin_balances, conversion_costs)
     *
     * //returns
     * "flo" || {error: true, response: "function coinPicker could not get coin with sufficient balance"}
     */
    coinPicker(coin_balances, conversion_costs, preferred_coin){
        let selected_coin;
        let usableCoins = [];

        // Get coins that we can use to send
        for (let coin in coin_balances) {
            if (typeof coin_balances[coin] === "number" && typeof conversion_costs[coin] === "number") {
                if (coin_balances[coin] >= conversion_costs[coin]) {
                    usableCoins.push(coin)
                }
            }
        }

        // If no coins were matched, then return an error
        if (!usableCoins.length) {
            return {
            	error: true, 
            	response: "Unable to find coins that we can pay with!"
            }
        }

        // If we are able to use the selected coin, pass back that for use
        if (usableCoins.includes(preferred_coin)) {
        	return preferred_coin
        }

        // Next, try to match based on preference order
        let coin_preferences = ["flo", "litecoin", "bitcoin"]

        for (let coin_preference of coin_preferences){
        	if (usableCoins.includes(coin_preference))
        		return coin_preference
        }

        // If we still haven't matched the coin yet, then just use the coin with the highest balance
        let highestAmount = 0;
        let coinWithHighestAmount;

        for (let coin of usableCoins) {
            if (coin_balances[coin] >= highestAmount) {
                highestAmount = coin_balances[coin];
                coinWithHighestAmount = coin;
            }
        }

        selected_coin = coinWithHighestAmount;

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
        	// First attempt to check if we have sufficient balance based on what
        	// has already been discovered.
            coin_balances = await this._wallet.getCoinBalances({
            	discover: false,
            	coins: this.tickerToName(supported_coins)
            });
        } catch (err) {
        	throw new Error("Could not get current balances from Wallet! \n" + err)
        }

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