import {ArtifactFile} from 'oip-index'
import {Artifact} from 'oip-index'
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
    async getPaymentAmount(){
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
    async getPaymentAddresses(artifact){
        return artifact ? await artifact.getPaymentAddresses() : await this._artifact.getPaymentAddresses()
    }
    /**
     * getSupportedCoins retrieves the coins the Artifact accepts as payment
     * @param {(Object|Artifact)} [addresses] - Either an object of [coin][addrs] or an Artifact to get the addresses from. If nothing is passed in, it will attempt to use the constructor's Artifact
     * @param {Array.<string>} [walletCoins] - An array of coins you want to check support for
     * @returns {Array} An array of coins that the Artifact accepts as payment. If Artifact does not support coin input, an empty array will be returned
     */
    getSupportedCoins(addresses, walletCoins) {
        let addrs = addresses || this._artifact
        let supported_coins = [];
        if (addrs instanceof Artifact) {
            addrs = addrs.getPaymentAddresses()
        }
        if (typeof addrs === "object") {
            for (let coin in addrs) {
                supported_coins.push(coin)
            }
        } else { throw new Error("Invalid parameter. Expecting an Array of Objects: [{[coin][addr]},]")}

        if (walletCoins) {
            let coins = []
            for (let coin of walletCoins) {
                for (let sup_coin of supported_coins) {
                    if (coin === sup_coin)
                        coins.push(coin)
                }
            }
            return coins
        }
        return supported_coins
    }
    
    /**
     * Calculate Exchange Rate (only for the supported coins) (this is so that we can know how much to pay in the cryptocurrency to the Artifact/ArtifactFile)
     * @param  {Array.<String>} [coins_array=this._wallet.getCoins()]    - An array of coins you want to get exchange rates for. If none are given, an array of all available coins will be used.
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
        // console.log(`Exchange rates: ${JSON.stringify(rates, null, 4)}`)
        return rates;
    }

    /**
     * Convert fiat price to crypto price using live exchange_rates
     * @param {Object} exchange_rates           - see getExchangeRates()
     * @param {number|Array.<Number>} payment_amounts          - the amount you wish to tip or the cost of a file to view or buy (currently only supports one payment amount)
     * @returns {Object} conversion_costs
     * @example
     * //returns
     * {
     *      "coin": expect.any(Number),
     *      ...
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
        // console.log(`Conversion costs: ${JSON.stringify(conversion_costs, null, 4)}`)
        return conversion_costs
    }

    /**
     * Get Balances for each coin that is supported (The supported coins that the Artifact accepts)
     * @param  {Array.<string>} [coins_array=this._wallet.getCoins()]    - An array of coins you want to get balances for. If no coins are given, an array of all available coins will be used.
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
        // console.log(`Coin balances: ${JSON.stringify(coin_balances, null, 4)}`);
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
        // console.log(`Usable coin(s): ${usableCoins}. \n The selectedCoin: ${selected_coin}`);
        return selected_coin
    }

    /**
     * Pay is the overall function that runs a series of methods to calculate balances, addresses, and execute payment
     * @returns {Promise} A promise that resolves to a txid if the tx went through or an error if it didn't
     */
    async pay(){
        //Step 1.a: Determine amount to pay
        let payment_amount
         try {
            payment_amount = await this.getPaymentAmount();
         } catch (err) {throw new Error("Could not get amount to pay")}
        console.log(`payment_amount: ${payment_amount}`)

        // Step 1.b: Get supported_coin and addresses
        let paymentAddresses = []
        try {
            paymentAddresses = await this.getPaymentAddresses();
        } catch (err) {throw new Error("Could not get payment addresses")}
        console.log(`paymentAddresses: ${JSON.stringify(paymentAddresses, null, 4)}`)


        let supported_coins = [];

        for (let addr of paymentAddresses) {
            for (let coin in addr) {
                supported_coins.push(coin);
            }
        }
        console.log(`supported_coins: ${supported_coins}`)

        //checks to see if there is a coin the user wants to pay with
        if (this._coin) {
            let found_coin = false
            for (let coin of supported_coins) {
                if (this._coin === coin) {
                    found_coin = true
                    supported_coins = [coin]
                    break
                }
            }
            if (!found_coin)
                throw new Error("File does not accept selected coin: ", this._selected_coin)
        }

        // Step 2: Get exchange rates for supported_coins
        let exchange_rates
        try {
            exchange_rates = await this.getExchangeRates(supported_coins);
        } catch (err) {throw new Error(`Could not get exchange rates for ${supported_coins}`)}
        console.log(`exchange_rates: ${JSON.stringify(exchange_rates, null, 4)}`)


        // Step 3: Convert the file/tip costs using the exchange_rates
        let conversion_costs
        try {
            conversion_costs = await this.convertCosts(exchange_rates, payment_amount);
        } catch (err) {throw new Error("Could not get conversion costs for artifact file")}
        console.log(`conversion_costs: ${JSON.stringify(conversion_costs)}`)

        // Step 4 (this step can be running while Step 3 is running)
        let coin_balances
        try {
            coin_balances = await this.getWalletBalances(supported_coins);
        } catch (err) {throw new Error("Could not get coin_balances")}
        console.log(`coin_balances: ${JSON.stringify(coin_balances, null, 4)}`)

        // Step 5
        let selected_coin
        try {
            selected_coin = await this.selectCoin(coin_balances, conversion_costs)
        } catch (err) {throw new Error("Coin(s) did not have enough balance to pay for costs")}
        console.log(`selected_coin: ${selected_coin}`)

        let payment_address;
        for (let addr of paymentAddresses) {
            for (let coin in addr) {
                if (coin === selected_coin) {
                    payment_address = addr[coin];
                }
            }
        }
        console.log(`payment_address: ${payment_address}`)

        const amount_to_pay = conversion_costs[selected_coin];
        console.log(`amount_to_pay: ${amount_to_pay}`)

        return await this.sendPayment(payment_address, amount_to_pay, selected_coin)
    }
    /**
     * Send the Payment to the Payment Addresses using the selected coin from selectCoin() for the amount calculated
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