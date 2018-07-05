var LocalStorageAdapter = require("../src/LocalStorageAdapter")

var isValidIdentifier = require("../src/util").isValidIdentifier;

var test_account_data = { wallet: "test data", something: { subthing: { hi: "hello!"}}}
var test_account_data_2 = { wallet: "test data", something: { subthing: { hi: "hello!"}}}

var password = "password"

test("Create new Account & Load (no email)", async (done) => {
	var adapter = new LocalStorageAdapter(undefined, password)

	var account_data = await adapter.create(test_account_data)

	test_account_data.identifier = account_data.identifier;

	var adapter2 = new LocalStorageAdapter(account_data.identifier, password)

	var account_data = await adapter2.load()

	test_account_data.shared_key = account_data.shared_key;

	expect(account_data).toEqual(test_account_data);
	expect(isValidIdentifier(account_data.identifier)).toBe(true);

	test_account_data.wallet = { bitcoin: "test-key" }

	var saved_data = await adapter2.save(test_account_data)
	var saved_account_data = await adapter2.load()

	expect(saved_data).toEqual(test_account_data)
	expect(saved_account_data).toEqual(test_account_data)

	done()
})

test("Create new Account & Load (email)", async (done) => {
	var adapter = new LocalStorageAdapter(undefined, password)

	var acc_data = await adapter.create(test_account_data_2, "test@example.com")
	test_account_data_2.identifier = acc_data.identifier;
	test_account_data_2.email = acc_data.email;

	expect(acc_data).toEqual(test_account_data_2);

	var adapter2 = new LocalStorageAdapter("test@example.com", password)

	var account_data = await adapter2.load()
	expect(account_data).toEqual(test_account_data_2);

	expect(isValidIdentifier(account_data.identifier)).toBe(true);

	test_account_data_2.wallet = { litecoin: "test-key" }

	var saved_data = await adapter2.save(test_account_data_2)
	var saved_account_data = await adapter2.load()

	expect(saved_data).toEqual(test_account_data_2)
	expect(saved_account_data).toEqual(test_account_data_2)

	done()
})