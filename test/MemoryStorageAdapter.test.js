var MemoryStorageAdapter = require("../lib/MemoryStorageAdapter")

var isValidIdentifier = require("../lib/util").isValidIdentifier;

var test_account_data = { wallet: "test data", something: { subthing: { hi: "hello!"}}}

test("Create new Account & Load", (done) => {
	var adapter = new MemoryStorageAdapter()

	adapter.create(test_account_data).then((id) => {
		test_account_data.identifier = id;

		adapter.load().then((account_data) => {
			expect(account_data).toEqual(test_account_data);
			expect(isValidIdentifier(account_data.identifier)).toBe(true);
			done()
		})
	})
})

test("Check always returns false on MemoryStorageAdapter", (done) => {
	var adapter = new MemoryStorageAdapter()

	adapter.check().catch((e) => {
		expect(e).toEqual(new Error("Account Not Found!"))
		done()
	})
})

test("Load should be undefined on create", (done) => {
	var adapter = new MemoryStorageAdapter()

	adapter.load().then((account_data) => {
		expect(account_data).toBe(undefined)
		done()
	})
})

test("Load should be defined after save on create", (done) => {
	var adapter = new MemoryStorageAdapter()

	adapter.save({wallet: "test"}, "test-id").then(() => {
		adapter.load().then((account_data) => {
			expect(account_data).toEqual({identifier: "test-id", wallet: "test"})
			done()
		})
	})
})