import CryptoJS from 'crypto-js';
import crypto from 'crypto';

import { isValidEmail } from './util'

const AES_CONFIG = {
	mode: CryptoJS.mode.CTR,
	padding: CryptoJS.pad.Iso10126,
	iterations: 5
}

class StorageAdapter {
	constructor(username, password){
		this._username = username
		this._password = password || ""

		this.storage = {
			identifier: undefined,
			email: undefined,
			encrypted_data: ""
		}

		if (this._username && isValidEmail(this._username))
			this.storage.email = this._username;
	}
	create(account_data, email){
		if (email)
			this.storage.email = email

		var identifier = this.generateIdentifier();

		account_data.identifier = identifier;

		return this.save(account_data, identifier)
	}
	async save(account_data, identifier){
		if (identifier){
			return await this._save(account_data, identifier)
		} else {
			try {
				var id = await this.check()
				return await this._save(account_data, id)
			} catch(e) {
				// No ID, generate new and save
				var id = await this.create(account_data)
				return await this._save(account_data, id)
			}
		}
	}
	load(){}
	check(){}
	/**
	 * Generate Identifier
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
		if (decrypted_data && !decrypted_data.email && this.storage.email !== "")
			decrypted_data.email = this.storage.email

		if (decrypted_data && !decrypted_data.identifier && this.storage.identifier !== ""){
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