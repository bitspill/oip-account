import { Wallet, util } from 'oip-hdmw';
import { isValidEmail, isValidIdentifier, isValidSharedKey } from './util';

import FakeStorageAdapter from './FakeStorageAdapter';
import LocalStorageAdapter from './LocalStorageAdapter';
import KeystoreStorageAdapter from './KeystoreStorageAdapter';

const DEFAULT_KEYSTORE_SERVER = "https://keystore.oip.li/"

class Account {
	/**
	 * Create a new Account
	 * @param  {string} username - Pass in your Email, Account ID, or a BIP39 Mnemonic
	 * @param  {string} password - Your Accounts password
	 * @param  {Object} [options]  - Options about the Account being spawned
	 * @param  {Boolean} [options.store_local=false] - If the wallet should be stored locally or on a Keystore server
	 * @param  {string} [options.keystore_url="https://keystore.oip.li/"] - Keystore to use to store the Account
	 * @return {Account}
	 */
	constructor(username, password, options){
		this._username = username
		this._password = password

		this._account = {
			identifier: "",
			email: "",
			wallet: {

			},
			settings: {

			},
			history: {

			},
			paymentHistory: {

			}
		}

		// Detect what kind of Username we are being passed.
		if (options && options.store_local) {
			this._storageAdapter = new LocalStorageAdapter(this._username, this._password);
		} else if (options && options.store_in_keystore) {
			if (options.keystore_url){
				this._storageAdapter = new KeystoreStorageAdapter(options.keystore_url, this._username, this._password);
			} else {
				this._storageAdapter = new KeystoreStorageAdapter(DEFAULT_KEYSTORE_SERVER, this._username, this._password);
			}
		} else if (util.isMnemonic(this._username)){
			this._account.wallet.mnemonic = this._username;
			this._storageAdapter = new FakeStorageAdapter(this._account);
		} else if (!this._username && !this._password) {
			this._storageAdapter = new FakeStorageAdapter(this._account);
		}

		this.discover = true

		if (options && options.discover !== undefined)
			this.discover = options.discover
	}
	/**
	 * Create a new Wallet and save it to the Storage Adapter
	 * @return {Promise} Returns a Promise that resolves if the wallet is created successfully.
	 */
	create(){
		return new Promise((resolve, reject) => {
			this._storageAdapter.check().then((identifier) => {
				reject(new Error("Account already exists!"), identifier)
			}).catch(() => {
				this.wallet = new Wallet(undefined, {discover: this.discover });

				this._account.wallet.mnemonic = this.wallet.getMnemonic()

				this.store().then((identifier) => {
					resolve(this._account);
				}).catch(reject)
			});
		})
	}
	/**
	 * Login to the Selected Account. This spawns and creates the oip-hdmw account.
	 * @return {Promise} Returns a Promise that resolves after logging in successfully.
	 */
	login(){
		return new Promise((resolve, reject) => {
			this._storageAdapter.load().then((account_info) => {
				this._account = account_info;

				if (!this._account.wallet.mnemonic)
					reject(new Error("Accounts not containing a Wallet Mnemonic are NOT SUPPORTED!"))

				this.wallet = new Wallet(this._account.wallet.mnemonic, {discover: this.discover})

				resolve(this._account)
			}).catch(reject)
		})
	}
	/**
	 * Logout of the currently logged in Account
	 * @return {[type]} [description]
	 */
	logout(){
		this._wallet = undefined;
		this._account = undefined;
	}
	/**
	 * Store changed information about the account to the StorageAdapter
	 * @return {Promise} Returns a Promise that will resolve if the account is saved successfully, or rejects if there was an error storing.
	 */
	store(){
		return this._storageAdapter.save(this._account)
	}
	/**
	 * Set a setting on the Account
	 * @param {string} setting_node - The Setting you wish to set
	 * @param {Object} setting_info - What you wish to set the setting to
	 * @return {Promise} Returns a Promise that will resolve with the setting is saved to the StorageAdapter
	 */
	setSetting(setting_node, setting_info){

	}
	/**
	 * Get a specific setting
	 * @param {string} setting_node - The Setting you wish to get
	 * @return {Promise<Object>} Returns a Promise that will resolve to the requested setting
	 */
	getSettings(setting_node){

	}
	/**
	 * Pay to View or Buy and Artifact File. This makes the purchase as well as saving that info to the wallet.
	 * @param  {Artifact} artifact      - The Artifact from which you got the ArtifactFile from. This is used to lookup payment percentage information.
	 * @param  {ArtifactFile} artifact_file - The specific ArtifactFile that you wish to pay for
	 * @param  {string} purchase_type - Either `view` or `buy`
	 * @return {Promise<Transaction>} Returns a Promise that will resolve to the payment transaction, or rejects if there is a payment error.
	 */
	payForArtifactFile(artifact, artifact_file, purchase_type){
		return new Promise((resolve, reject) => {
			// If not logged in
			reject(new Error("Not Logged In!"))

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
	/**
	 * Send a tip to the Publisher for a specific Artifact
	 * @param  {Artifact} artifact - The Artifact you wish to tip
	 * @param  {number} amount   - The Amount in `fiat` you wish to tip
	 * @param  {string} fiat     - A string containing information about the users source currency (i.e. "usd")
	 * @return {Promise<Transaction>} Returns a Promise that will resolve to the payment transaction, or rejects if there is a payment error.
	 */
	sendArtifactTip(artifact, amount, fiat){
		return new Promise((resolve, reject) => {

		})
	}
}

module.exports = Account