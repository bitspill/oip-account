var LocalStorageAdapter = require("../lib/LocalStorageAdapter")

var isValidIdentifier = require("../lib/util").isValidIdentifier;

var test_account_data = { wallet: "test data", something: { subthing: { hi: "hello!"}}}

test("Create new Account & Load", (done) => {
	var adapter = new LocalStorageAdapter()

	adapter.create(test_account_data).then((id) => {
		test_account_data.identifier = id;

		adapter.load().then((account_data) => {
			expect(account_data).toEqual(test_account_data);
			expect(isValidIdentifier(account_data.identifier)).toBe(true);
			done()
		})
	})
})