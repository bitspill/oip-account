import StorageAdapter from './StorageAdapter'
import { AccountNotFoundError } from '../Errors'

/**
 * The MemoryStorageAdapter is used when the user only wants their wallet stored in memory for the single session.
 * @extends {StorageAdapter}
 */
class MemoryStorageAdapter extends StorageAdapter {
	/**
	 * Create a new MemoryStorageAdapter
	 * @param  {string} username     - The username of the account you wish to use
	 * @param  {string} password     - The password of the account you wish to use
	 * @param  {string} [keystore_url="https://keystore.oip.li/v2/"] - The URL of the [OIP Keystore](https://github.com/oipwg/oip-keystore) server to use
	 * @return {MemoryStorageServer}
	 */
	constructor(account, username, password){
		super(username, password)

		this._account = account
	}
	async create(account_data){
		var account_data_copy = JSON.parse(JSON.stringify(account_data));

		var identifier = this.generateIdentifier();

		this.storage.identifier = identifier

		account_data_copy.identifier = identifier;

		if (!this._username)
			this._username = identifier

		return await this._save(account_data_copy, identifier)
	}
	/**
	 * Load an Account from the Memory
	 *
	 * @async
	 * @param {Object} account_data - The Account Data if you are "logging" in and not just "refreshing"
	 * @return {Promise<Object>} Returns a Promise that will resolve to the Account Data
	 */
	async load(account_data){
		if (!account_data)
			return this._account

		return await this.create(account_data)
	}
	/**
	 * Internal Save function to Save an Account to the Memory
	 *
	 * @async
	 * @param  {Object} account_data - The new Account Data you wish to save
	 * @param  {Identifier} identifier - The Identifier of the account you wish to save
	 * @return {Promise<Object>} Returns a Promise that will resolve to the Account Data of the updated account
	 */
	async _save(account_data, identifier){
		this._account = account_data
		
		return this._account
	}
	/**
	 * Check if the Account exists in Memory. It will never exists, so it always will return an error 
	 * This matches an email to an identifier if the username being used is an email.
	 *
	 * @async
	 * @throws {AccountNotFoundError} If no Account is found
	 * @return {Promise<Identifier>} Returns a Promsie that will resolve to the Accounts Identifier if set
	 */
	async check(){
		if (this._account.identifier)
			return this._account.identifier
		
		throw new AccountNotFoundError("No Account found")
	}
}

module.exports = MemoryStorageAdapter;