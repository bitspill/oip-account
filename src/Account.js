import { Wallet, util } from 'oip-hdmw';
import EventEmitter from 'eventemitter3'

import ArtifactPaymentBuilder from './ArtifactPaymentBuilder';
import { isValidEmail, isValidIdentifier, isValidSharedKey } from './util';

import MemoryStorageAdapter from './StorageAdapters/MemoryStorageAdapter';
import LocalStorageAdapter from './StorageAdapters/LocalStorageAdapter';
import KeystoreStorageAdapter from './StorageAdapters/KeystoreStorageAdapter';
import {AccountNotFoundError} from "./Errors";

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
			this._account.wallet.seed = this._username;
			this._username = undefined;
		}

		if (isValidEmail(this._username))
			this._account.email = this._username

		if (isValidIdentifier(this._username))
			this._account.identifier = this._username

		// Detect what kind of Username we are being passed.
		if (options && options.store_memory) {
			this._storageAdapter = new MemoryStorageAdapter(this._account);
		} else if (options && options.store_in_keystore) {
			this._storageAdapter = new KeystoreStorageAdapter(this._username, this._password, options.keystore_url);
		} else {
			this._storageAdapter = new LocalStorageAdapter(username, this._password);
		}

		this.event_emitter = new EventEmitter()

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
			this.wallet = new Wallet(this._account.wallet.seed, {discover: this.discover});

			// Subscribe to Websocket Updates
			this.wallet.onWebsocketUpdate(this._handleWalletWebsocketUpdate.bind(this))

			this._account.wallet = this.wallet.serialize()

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
		let account_info;
		try {
			account_info = await this._storageAdapter.load(this._account)
		} catch (err) {
			if (err instanceof AccountNotFoundError) {
				try {
					account_info = await this.create()
				} catch (err) {
					throw new Error(`Login and New Account creation failed: ${err}`)
				}
			} else {
				throw new Error(err)
			}
		}

		this._account = account_info;

		if (!this._account.wallet.seed)
			throw new Error("Accounts not containing a Wallet Seed are NOT SUPPORTED!")

		this.wallet = new Wallet(this._account.wallet.seed, {
			discover: this.discover,
			serialized_data: this._account.wallet
		})

		this._account.wallet = this.wallet.serialize()

		this.wallet.onWebsocketUpdate(this._handleWalletWebsocketUpdate.bind(this))

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
		// Always save the latest wallet state :)
		this._account.wallet = this.wallet.serialize()

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
	 * Internal function used to handle Websocket updates streaming in from the Wallet
	 * @param  {Address} address - The Address that was updated
	 */
	_handleWalletWebsocketUpdate(address){
		this.event_emitter.emit("wallet_websocket_update", this, address)

		this._account.wallet = this.wallet.serialize()
		this.store()
	}
	/**
	 * Subscribe to Wallet Websocket updates
	 * @param  {function} subscriberFunction - The function you want called when a Websocket update happens
	 */
	onWalletWebsocketUpdate(subscriberFunction){
		this.event_emitter.on("wallet_websocket_update", subscriberFunction)
	}
	/**
	 * Pay to View or Buy and Artifact File. This makes the purchase as well as saving that info to the wallet.
	 * @param  {Artifact} artifact      - The Artifact from which you got the ArtifactFile from. This is used to lookup payment percentage information.
	 * @param  {ArtifactFile} artifact_file - The specific ArtifactFile that you wish to pay for
	 * @param  {string} purchase_type - Either `view` or `buy`
	 * @param  {string} [coin]   - The Coin you wish to pay with
	 * @param  {string} [fiat]     - A string containing information about the users source currency (i.e. "usd")
	 * @return {Promise<Transaction>} Returns a Promise that will resolve to the payment transaction, or rejects if there is a payment error.
	 */
	payForArtifactFile(artifact, artifact_file, purchase_type, coin, fiat){
		return new Promise((resolve, reject) => {
			let builder = new ArtifactPaymentBuilder(this.wallet, artifact, artifact_file, purchase_type, coin, fiat);

			builder.pay().then(resolve).catch(reject)
		}) 
	}
	/**
	 * Send a tip to the Publisher for a specific Artifact
	 * @param  {Artifact} artifact - The Artifact you wish to tip
	 * @param  {number} amount   - The Amount in `fiat` you wish to tip
	 * @param  {string} [coin]   - The Coin you wish to pay with
	 * @param  {string} [fiat="usd"]     - A string containing information about the users source currency (i.e. "usd")
	 * @return {Promise<Transaction>} Returns a Promise that will resolve to the payment transaction, or rejects if there is a payment error.
	 */
	sendArtifactTip(artifact, amount, coin, fiat){
		return new Promise((resolve, reject) => {
			let builder = new ArtifactPaymentBuilder(this.wallet, artifact, amount, 'tip', coin, fiat)
			
			builder.pay().then(resolve).catch(reject)
		})
	}

	/**
	 * Instantiate and Artifact payment builder so you can do cool stuff! All params are optional. Include what you need to use. Put undefined for those you don't need.
	 * @param {Wallet} [wallet] - oip-HDMW
	 * @param {Artifact} [artifact] - oip-Artifact
	 * @param {(ArtifactFile|number)} [file] - an oip-ArtifactFile or the amount you want to pat
	 * @param {string} [type] - 'view', 'buy', or 'tip'
	 * @param {string} [coin] - the coin you prefer to pay with (currently only supports one coin
	 * @param {string} [fiat="usd"] - the fiat currency you deal with
	 * @returns {ArtifactPaymentBuilder}
	 */
	getPaymentBuilder(wallet, artifact, file, type, coin, fiat) {
		return new ArtifactPaymentBuilder(wallet, artifact, file, type, coin, fiat)
	}
}

module.exports = Account