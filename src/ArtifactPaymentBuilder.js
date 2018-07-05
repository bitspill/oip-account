const Exchange = require("oip-exchange-rate");

class ArtifactPaymentBuilder {
	/**
	 * Create a new ArtifactPaymentBuilder
	 * @param  {Wallet} wallet   - A live OIP-HDMW logged in wallet
	 * @param  {string} type     - The type of the purchase, either `tip`, `view`, or `buy`
	 * @param  {Artifact} artifact - The Artifact related to the Payment you wish to make
	 * @param  {ArtifactFile|number} amount	- The amount you wish to pay (`tip`), or the ArtifactFile you wish to pay for (`view` & `buy`)
	 * @param  {string} [fiat]   - The Fiat you wish to `tip` in (if amount was a number and NOT an ArtifactFile)
	 * @return {ArtifactPaymentBuilder}          [description]
	 */
	constructor(wallet, type, artifact, amount, fiat){
        this._wallet = wallet;
        this._type = type;
        this._artifact = artifact;
        this._amount = amount; //or ArtifactFile?
        this._fiat = fiat;
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
	    let rates, balances;
        // Get ArtifactFile Cost and Artifact Fiat
	    let artifactFileCost = this._amount;
        let fiat = this._fiat;

        // Get percentages to be paid out to Platforms and Influencers (don't worry about this for now)
			
			// Calculate crypto cost based on the exchange rate for the Fiat (using oip-exchange-rate)
        try {rates = await this.getExchangeRates(this._fiat);}
        catch (err) {console.log(`Error on getExchangeRates: ${err}`)};

        // Check Balances of Cryptocurrencies

        try {balances = await this.getBalances()}
        catch (err) {console.log(`Error on getBalances: ${err}`)};


        // If not enough balance

				//reject(new Error("Not Enough Balance!"))

				// Select which cryptocurrency to use
				
				// Send the payment in that crypto to the User (using this.wallet)
				
				// Save Transaction to `paymentHistory` if payment went through successfully

	}

    /**
     * Get balances for each coin
     * @return {object}
     *   @example
     * {
     *      "flo": {balance: 216},
     *      "btc": {error: "Error text"},
     *      "ltc": {"usd": 333}
     * }
     */
     async getBalances() {
            const coins = this._wallet.getCoins();

            let coinPromises = {};
            let balances = {};

            for (let coin in coins) {
                coinPromises[coin] = {};
                try {
                    coinPromises[coin].promise = coins[coin].getBalance({discover: true})
                } catch (err) {
                    coinPromises[coin].error = err
                    console.log(`Error on ${coin}: ${err}`)
                }
            }

            for (let coin in coinPromises) {
                try {
                    let balance = await coinPromises[coin].promise
                    balances[coin] = {};
                    balances[coin].balance = balance
                } catch (err) {
                    balances[coin] = {};
                    balances[coin].err = err.response.statusText
                }
            }
            return balances
    }


    /**
     * Calculate the exchange rate between a fiat currency and a cryptocurrency
     * @param  {string} fiat     - The fiat currency you wish to check against
     * @param  {array} [coinArray]    - An array of coins you want to get exchange rates for. If no coins are given, an array of all available coins will be used.
     * @return {object}
     * @example
     * {
     *      "flo": {"usd": expect.any(Number)},
     *      "btc": {"usd": expect.any(Number)},
     *      "ltc": {"usd": expect.any(Number)}
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
                rates[p][promiseArray[p].err] = err.response.statusText;

            }
        }

        return rates
    }
}

module.exports = ArtifactPaymentBuilder;