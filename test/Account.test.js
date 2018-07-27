import Account from '../src/Account';

test("Create new Account MemoryStorage!", (done) => {
	var acc = new Account(undefined, undefined, {store_memory: true, discover: false});

	acc.create().then((account_info) => {
		expect(account_info.identifier).toBeDefined()
		expect(account_info.wallet.mnemonic).toBeDefined()
		done()
	})
})

test("Create Account from Mnemonic MemoryStorage!", (done) => {
	var acc = new Account("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about", undefined, {store_memory: true, discover: false});

	acc.login().then((account_info) => {
		expect(account_info.identifier).toBeDefined()
		expect(account_info.wallet.mnemonic).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
		expect(acc.wallet.getMnemonic()).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
		done()
	})
})

test("Create Account from Mnemonic (localStorage)", (done) => {
	var acc = new Account("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about", "password", {discover: false});

	acc.create().then((account_info) => {
		expect(account_info.identifier).toBeDefined()
		expect(account_info.wallet.mnemonic).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
		expect(acc.wallet.getMnemonic()).toBe("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about")
		done()
	})
})

test("Can't find account if doesn't exist (localStorage)", (done) => {
	var acc = new Account("test@me.com", "password", {discover: false})

	acc.login().catch((error) => {
		expect(error).toEqual(new Error("Account Not Found!"))
		done()
	})
}, 10000)

test("Create Account (email) (localStorage)", async (done) => {
	var acc = new Account("test@me.com", "password", {discover: false})

	var account_info = await acc.create()

	expect(account_info.identifier).toBeDefined()
	expect(account_info.email).toBe("test@me.com")
	expect(account_info.wallet.mnemonic).toBeDefined()

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

test("Create Account (no email) (localStorage)", async (done) => {
	var acc = new Account(undefined, "password", {discover: false})

	var account_info = await acc.create()

	expect(account_info.identifier).toBeDefined()
	expect(account_info.email).toBeUndefined()
	expect(account_info.wallet.mnemonic).toBeDefined()
	done()
})

test("Account wallet methods (localStorage)", async (done) => {
    var acc = new Account("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about", "password", {discover: false});

    let info = await acc.create();
    let x = await acc.wallet.getFiatBalances()
    let y = await acc.wallet.getCoinBalances()
    let z = await acc.wallet.getExchangeRates()
    expect(x).toBeDefined()
    expect(y).toBeDefined()
    expect(z).toBeDefined()
    done()
}, 100000)