

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

	}
	getPaymentAddresses(){
		
	}
	/**
	 * Pay for the item you requested
	 * @return {Promise<Transaction>} Returns a Promise that resolves to the payment transaction, or rejects if there was an error
	 */
	pay(){
		return new Promise((resolve, reject) => {
			// Get ArtifactFile Cost and Artifact Fiat
			// Get percentages to be paid out to Platforms and Influencers (don't worry about this for now)
			
			// Calculate crypto cost based on the exchange rate for the Fiat (using oip-exchange-rate)
				// Check Balances of Cryptocurrencies
				// If not enough balance
				reject(new Error("Not Enough Balance!"))

				// Select which cryptocurrency to use
				
				// Send the payment in that crypto to the User (using this.wallet)
				
				// Save Transaction to `paymentHistory` if payment went through successfully
		})
	}
}

module.exports = ArtifactPaymentBuilder