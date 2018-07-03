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
        this._amount = amount;
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
			// Get ArtifactFile Cost and Artifact Fiat
        const artifactFileCost = this._amount;
        const artifactFiat = this._fiat;
			// Get percentages to be paid out to Platforms and Influencers (don't worry about this for now)
			
			// Calculate crypto cost based on the exchange rate for the Fiat (using oip-exchange-rate)
        const rates = await this.calculateCryptoExchangeRate();

				// Check Balances of Cryptocurrencies
				// If not enough balance
				//reject(new Error("Not Enough Balance!"))

				// Select which cryptocurrency to use
				
				// Send the payment in that crypto to the User (using this.wallet)
				
				// Save Transaction to `paymentHistory` if payment went through successfully
	}

	async getCryptoRate(coins, fiat) {
        let rates = {}
        for (let coin of coins) {

        }
    }

    /**
     * Calculate the exchange rate between a fiat currency and a cryptocurrency
     * @param  {array} coins    - An array of coins you want to get exchange rates for
     * @param  {string} fiat     - The fiat currency you wish to check against
     * @return {object}          [An object: {[key]: [[fiat]: [exchange rate]],}]
     * * @example
     *  {
            "flo": {"usd": expect.any(Number)},
            "btc": {"usd": expect.any(Number)},
            "ltc": {"usd": expect.any(Number)}
        }
     */
    async calculateCryptoExchangeRate(coins, fiat) {
        let rates = {};
        let promiseArray = {};

        for (let coin of coins) {
            promiseArray[coin] = {};
            promiseArray[coin].promise = this._exchange.getExchangeRate(coin, fiat)
            promiseArray[coin].fiat = fiat
        }

        for (let p in promiseArray) {
            let rate = await promiseArray[p].promise;
            rates[p] = {};
            rates[p][promiseArray[p].fiat] = rate
        }

        return rates
    }
}

module.exports = ArtifactPaymentBuilder;