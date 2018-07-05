import CryptoJS from 'crypto-js';
import crypto from 'crypto';

import { isValidEmail, isValidIdentifier } from './util'

const AES_CONFIG = {
	mode: CryptoJS.mode.CTR,
	padding: CryptoJS.pad.Iso10126,
	iterations: 5
}

/**
 * A Unique identifier for the user. This is a set of characters seperated by dashes.
 * @typedef {string} Identifier
 * @example
 * e7c7a45-8aac7317-b2b0098-2c7a046
 */

/**
 * A Generic StorageAdapter class that provides shared functions between all StorageAdapters
 */
class StorageAdapter {
	/**
	 * Create a new Storage Adapter
	 * @param  {string} username - The username of the account you wish to use
	 * @param  {string} password - The password of the account you wish to use
	 * @return {StorageAdapter}
	 */
	constructor(username, password){
		this._username = username
		this._password = password || ""

		this.storage = {
			identifier: undefined,
			email: undefined,
			encrypted_data: ""
		}

		if (this._username && !isValidIdentifier(this._username) && isValidEmail(this._username))
			this.storage.email = this._username;
	}
	/**
	 * Create an account using the StorageAdapter
	 *
	 * @async
	 * @param  {Object} account_data - The Account Data you wish to save
	 * @param  {string} [email]      - The Email you wish to attach to your account
	 * @return {Promise<Identifier>} The Identifier of the Created Account
	 */
	async create(account_data, email){
		var account_data_copy = JSON.parse(JSON.stringify(account_data));

		if (email){
			this.storage.email = email
			account_data_copy.email = email;

			if (!this._username)
				this._username = email
		} else {
			if (isValidEmail(this._username)){
				this.storage.email = this._username
				account_data_copy.email = this._username
			}
		}

		var identifier = this.generateIdentifier();

		account_data_copy.identifier = identifier;

		if (!this._username)
			this._username = identifier

		return await this.save(account_data_copy, identifier)
	}
	/**
	 * Save an Account using the StorageAdapter
	 *
	 * @async
	 * @param  {Object} account_data - The Account Data you wish to save
	 * @param  {Identifier} [identifier] - The Identifier of the Account you wish to save to
	 * @return {Promise<Identifier>} Returns the Identifier of the saved account
	 */
	async save(account_data, identifier){
		if (identifier){
			return await this._save(account_data, identifier)
		} else {
			try {
				var id = await this.check()

				return await this._save(account_data, id)
			} catch(e) {
				if (this.storage.identifier && e.response && e.response.data && e.response.data.type)
					throw new Error(e.response.data.type)

				// No ID, generate new and save
				return await this.create(account_data)
			}
		}
	}
	/**
	 * Load the Wallet from the StorageAdapter, this function is overwritten by sub-classes
	 *
	 * @async
	 * @return {Promise<Object>} Returns the Account Data for the specified account
	 */
	async load(){}
	/**
	 * Check if the Wallet exists on the StorageAdapter, this function is overwritten by sub-classes
	 * @return {Promise<Identifier>} Returns the Identifier of the matched wallet (if found)
	 */
	async check(){}
	/**
	 * Generate a valid Identifier
	 * @return {Identifier} Returns a newly generated identifier
	 */
	generateIdentifier() {
		var bytes = crypto.randomBytes(16).toString('hex')

		var identifier = bytes.slice(0, 7) + "-" + bytes.slice(8, 16) + "-" + bytes.slice(17, 24) + "-" + bytes.slice(25, 32)

		this.storage.identifier = identifier

		return identifier
	}
	/**
	 * Decrypt the Account data
	 * @param  {string} encrypted_data - The Encrypted Data string to Decrypt
	 * @return {Object} Returns the decrypted data as a JSON Object  
	 */
	decrypt(encrypted_data){
		try {
			var decrypted = CryptoJS.AES.decrypt(encrypted_data, this._password, AES_CONFIG);
			var hydrated_decrypted = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))

			if (hydrated_decrypted && hydrated_decrypted.email)
				this.storage.email = hydrated_decrypted.email

			if (hydrated_decrypted && hydrated_decrypted.identifier)
				this.storage.identifier = hydrated_decrypted.identifier

			return hydrated_decrypted
		} catch (e) {
			return undefined
		}

		return undefined
	}
	/**
	 * Encrypt the Account data
	 * @param  {Object} decrypted_data - A JSON object of the data you would like to encrypt
	 * @return {string} Returns the Encrypted Data as a String
	 */
	encrypt(decrypted_data){
		if (decrypted_data && !decrypted_data.email && this.storage.email && this.storage.email !== "")
			decrypted_data.email = this.storage.email

		if (decrypted_data && !decrypted_data.identifier && this.storage.identifier && this.storage.identifier !== ""){
			decrypted_data.identifier = this.storage.identifier
		}

		try {
			var decrypted_string = JSON.stringify(decrypted_data);
			var encrypted = CryptoJS.AES.encrypt(decrypted_string, this._password, AES_CONFIG)
			var encrypted_string = encrypted.toString();

			this.storage.encrypted_data = encrypted_string

			return encrypted_string
		} catch (e) {
			return undefined
		}

		return undefined
	}
}

module.exports = StorageAdapter;