var Account = require("../lib/Account");

test("Create new Account NO STORAGE!", (done) => {
	var acc = new Account(undefined, undefined, {discover: false});

	acc.create().then((account_info) => {
		expect(account_info.identifier).toBeDefined()
		expect(account_info.wallet.mnemonic).toBeDefined()
		done()
	})
})

test("Create Account from Mnemonic NO STORAGE!", (done) => {
	var acc = new Account("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about", undefined, {discover: false});

	acc.login().then((account_info) => {
		expect(account_info.identifier).toBe("")
		expect(account_info.wallet.mnemonic).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
		expect(acc.wallet.getMnemonic()).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
		done()
	})
})

test("Can't find account if doesn't exist", (done) => {
	var acc = new Account("test@me.com", "password", {store_local: true, discover: false})

	acc.login().catch((error) => {
		expect(error).toEqual(new Error("Account Not Found!"))
		done()
	})
})

test("", (done) => {
	var acc = new Account("test@me.com", "password", {store_local: true, discover: false})

	acc.create().then((account_info) => {
		expect(account_info.identifier).toBeDefined()
		expect(account_info.wallet.mnemonic).toBeDefined()
		done()
	})
})

