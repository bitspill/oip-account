import Account from '../src/Account';
import ArtifactPaymentBuilder from '../src/ArtifactPaymentBuilder'

import { InvalidPassword, AccountNotFoundError } from '../src/Errors'

test("Create new Account MemoryStorage!", (done) => {
	var acc = new Account(undefined, undefined, {store_memory: true, discover: false});

	acc.create().then((account_info) => {
		expect(account_info.identifier).toBeDefined()
		expect(account_info.wallet.seed).toBeDefined()
		done()
	})
})

test("Create Account from Mnemonic MemoryStorage!", (done) => {
	var acc = new Account("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about", undefined, {store_memory: true, discover: false});

	acc.login().then((account_info) => {
		expect(account_info.identifier).toBeDefined()
		expect(account_info.wallet.seed).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
		expect(acc.wallet.getMnemonic()).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
		done()
	})
})

test("Create Account from Mnemonic (localStorage)", (done) => {
	var acc = new Account("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about", "password", {discover: false});

	acc.create().then((account_info) => {
		expect(account_info.identifier).toBeDefined()
		expect(account_info.wallet.seed).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
		expect(acc.wallet.getMnemonic()).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
		done()
	})
})

test("Can't find account if doesn't exist (localStorage)", async (done) => {
	var acc = new Account("test@me.com", "password", {discover: false})

	let acc_data, acc_err
	try {
		acc_data = await acc.login()
	} catch (err){
		acc_err = err
	}

	expect(acc_err instanceof AccountNotFoundError).toBe(true)

	done()
}, 10000)

test("Create Account (email) (localStorage)", async (done) => {
	var acc = new Account("test@me.com", "password", {discover: false})

	var account_info = await acc.create()

	expect(account_info.identifier).toBeDefined()
	expect(account_info.email).toBe("test@me.com")
	expect(account_info.wallet.seed).toBeDefined()

	var acc2 = new Account("test@me.com", "password", {discover: false})

	var account_info_2 = await acc2.login()

	expect(account_info_2).toEqual(account_info)

	account_info_2.settings.displayNSFW = false;

	var account_info_3 = await acc2.setSetting("displayNSFW", false)

	expect(account_info_3).toEqual(account_info_2)

	expect(acc2.getSetting("displayNSFW")).toBe(false)
	expect(acc2.getSetting("nonSetting")).toBe(undefined)

	done()
})

test("Invalid Password", async (done) => {
	let acc = new Account("test333@me.com", "password", {discover: false})

	let account_info = await acc.create()

	expect(account_info.identifier).toBeDefined()
	expect(account_info.email).toBe("test333@me.com")
	expect(account_info.wallet.seed).toBeDefined()

	let login_error

	try {
		let acc2 = new Account("test333@me.com", "not-the-right-password", {discover: false})

		// Should throw error on login failure
		let acc_data = await acc2.login()

		// Should not get here
		expect(acc_data).toBe({nope: "not-right"})
	} catch (err) {
		login_error = err
	}

	expect(login_error instanceof InvalidPassword).toBe(true)
	done()
})

test("Create Account (no email) (localStorage)", async (done) => {
	var acc = new Account(undefined, "password", {discover: false})

	var account_info = await acc.create()

	expect(account_info.identifier).toBeDefined()
	expect(account_info.email).toBeUndefined()
	expect(account_info.wallet.seed).toBeDefined()
	done()
})
