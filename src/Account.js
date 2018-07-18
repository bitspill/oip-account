import { Wallet, util } from 'oip-hdmw';
import ArtifactPaymentBuilder from './ArtifactPaymentBuilder';
import { isValidEmail, isValidIdentifier, isValidSharedKey } from './util';

import MemoryStorageAdapter from './MemoryStorageAdapter';
import LocalStorageAdapter from './LocalStorageAdapter';
import KeystoreStorageAdapter from './KeystoreStorageAdapter';

class Account {
	/**
	 * Create a new Account
	 * @param  {string} username - Pass in your Email, Account ID, or a BIP39 Mnemonic
	 * @param  {string} password - Your Accounts password
	 * @param  {Object} [options]  - Options about the Account being spawned
	 * @param  {Boolean} [options.store_memory=false] - If the wallet should be stored only in the Memory and wiped completely on logout
     * @param  {Boolean} [options.store_in_keystore=false] - If the wallet should be stored on a Keystore server
	 * @param  {string} [options.keystore_url="https://keystore.oip.li/"] - Keystore to use to store the Account
     * @param  {Boolean} [options.discover=false] - set discovery
     * @return {Account}
	 */
	constructor(username, password, options){
		this._username = username
		this._password = password

		this._account = {
			identifier: undefined,
			wallet: {

			},
			settings: {

			},
			history: {

			},
			paymentHistory: {

			}
		};

		if (util.isMnemonic(this._username)){
			this._account.wallet.mnemonic = this._username;
			this._username = undefined
		}

		// Detect what kind of Username we are being passed.
		if (options && options.store_memory) {
			this._storageAdapter = new MemoryStorageAdapter(this._account);
		} else if (options && options.store_in_keystore) {
			this._storageAdapter = new KeystoreStorageAdapter(options.keystore_url, this._username, this._password);
		} else {
			this._storageAdapter = new LocalStorageAdapter(this._username, this._password);
		}

		this.discover = true;

		if (options && options.discover !== undefined)
			this.discover = options.discover
	}
	/**
	 * Create a new Wallet and save it to the Storage Adapter
	 *
	 * @async
	 * @return {Promise<Object>} Returns a Promise that resolves if the wallet is created successfully.
	 */
	async create(){
		try {
			var identifier = await this._storageAdapter.check()
		} catch (e) {

			// If an error was thrown in `check()` then it means the account does not exist, go ahead and create it then
			this.wallet = new Wallet(this._account.wallet.mnemonic, {discover: this.discover });

			this._account.wallet.mnemonic = this.wallet.getMnemonic()

			var account_data = await this._storageAdapter.create(this._account, this._account.email)

			this._account = account_data

			return this._account	
		}

		throw new Error("Account already exists!")
	}
	/**
	 * Login to the Selected Account. This spawns and creates the oip-hdmw account.
	 * @return {Promise} Returns a Promise that resolves after logging in successfully.
	 */
	async login(){
		// We pass in this._account to the load() on the StorageAdapter in case we are using the Memory Storage Adapter
		var account_info = await this._storageAdapter.load(this._account)

		this._account = account_info;

		if (!this._account.wallet.mnemonic)
		    throw new Error("Accounts not containing a Wallet Mnemonic are NOT SUPPORTED!")

		this.wallet = new Wallet(this._account.wallet.mnemonic, {discover: this.discover})

		return JSON.parse(JSON.stringify(this._account))
	}
	/**
	 * Logout of the currently logged in Account
	 */
	logout(){
		this._account.wallet = undefined;
		this._account = undefined;
	}
	/**
	 * Store changed information about the account to the StorageAdapter
	 * @return {Promise<Object>} Returns a Promise that will resolve to the Account Data if the account is saved successfully, or rejects if there was an error storing.
	 */
	async store(){
		return await this._storageAdapter.save(this._account, this._account.identifier)
	}
	/**
	 * Set a setting on the Account
	 *
	 * @async
	 * @param {string} setting_node - The Setting you wish to set
	 * @param {Object} setting_info - What you wish to set the setting to
	 * @return {Promise<Object>} Returns a Promise that will resolve with the Account Data after the new setting is saved to the StorageAdapter
	 */
	async setSetting(setting_node, setting_info){
		if (!setting_node)
			throw new Error("setting_node is a required parameter!")

		if (!setting_info && setting_info !== false)
			throw new Error("setting_info is a required parameter!")

		this._account.settings[setting_node] = setting_info

		return JSON.parse(JSON.stringify(await this.store()));
	}
	/**
	 * Get a specific setting
	 * @param {string} setting_node - The Setting you wish to get
	 * @return {Object} Returns the requested setting_info
	 */
	getSetting(setting_node){
		if (!setting_node)
			throw new Error("setting_node is a required parameter!")

		return this._account.settings[setting_node]
	}
	/**
	 * Pay to View or Buy and Artifact File. This makes the purchase as well as saving that info to the wallet.
	 * @param  {Artifact} artifact      - The Artifact from which you got the ArtifactFile from. This is used to lookup payment percentage information.
	 * @param  {ArtifactFile} artifact_file - The specific ArtifactFile that you wish to pay for
	 * @param  {string} purchase_type - Either `view` or `buy`
     * @param  {string} fiat     - A string containing information about the users source currency (i.e. "usd")
     * @return {Promise<Transaction>} Returns a Promise that will resolve to the payment transaction, or rejects if there is a payment error.
	 */
	payForArtifactFile(artifact, artifact_file, purchase_type, fiat){
		return new Promise((resolve, reject) => {
			let builder = new ArtifactPaymentBuilder(this.wallet, artifact, artifact_file, purchase_type, fiat);

			builder.pay().then(resolve).catch(reject)
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
			let builder = new ArtifactPaymentBuilder(this.wallet, artifact, amount, 'tip', fiat)
			
			builder.pay().then(resolve).catch(reject)
		})
	}
}

module.exports = Account