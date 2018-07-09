[![](https://travis-ci.org/oipwg/oip-account.svg?branch=master)](https://travis-ci.org/oipwg/oip-account)
[![](https://img.shields.io/npm/v/oip-account.svg)](https://www.npmjs.com/package/oip-account)
# OIP Account
OIP Account is an NPM Module that provides access to User Account functions such as making payments and accessing settings. There are several StorageAdapters that you can select from depending on where you want your Wallet saved/stored (if at all).

## Table of Contents
* [Installation Instructions](https://github.com/oipwg/oip-account/#installation-instructions)
* [Getting Started](https://github.com/oipwg/oip-account/#getting-started)
	* [Creating your first Account](https://github.com/oipwg/oip-account/#)
	* [Logging in to your Account](https://github.com/oipwg/oip-account/#)
	* [Paying for an Artifact](https://github.com/oipwg/oip-account/#)
* [API Documentation](https://github.com/oipwg/oip-account/#api-documentation)
	* [Account](https://oipwg.github.io/oip-account/Account.html)
	* [ArtifactPaymentBuilder](https://oipwg.github.io/oip-account/Account.html)
	* [StorageAdapter](https://oipwg.github.io/oip-account/StorageAdapter.html)
	* [MemoryStorageAdapter](https://oipwg.github.io/oip-account/MemoryStorageAdapter.html)
	* [LocalStorageAdapter](https://oipwg.github.io/oip-account/LocalStorageAdapter.html)
	* [KeystoreStorageAdapter](https://oipwg.github.io/oip-account/KeystoreStorageAdapter.html)
* [License](https://github.com/oipwg/oip-account/#license)

## Installation Instructions

To install `OIP Account` for use in your applcation, install the latest version from NPM, and save it to your `package.json`.
```bash
$ npm install --save oip-account@latest
```
Now that you have installed `OIP Account`, look in the [Getting Started](https://github.com/oipwg/oip-account/#getting-started) section for information on how to use it.
## Getting Started

To get started using OIP Account, take a look at the [Create your first Account](https://github.com/oipwg/oip-account/#) example below.

### Creating your first Account

To create your first account, we will first need to import the `Account` class from the `oip-account` module.
```javascript
import { Account } from 'oip-account'
```

After you have imported your account, you can go ahead and spawn a new `Account` Object. You can pass it an `email` if you would like it to be able to login using your email as your username. You can also pass in a `password` if you would like to encrypt your account with the password you define. If you don't define a password, it will be encrypted using a blank string WHICH IS NOT SAFE!

```javascript
var myAccount = new Account("test@me.com", "password")
```

Now that we have created our `Account` Object (named `myAccount` in this case), we will need to "create" the wallet on the StorageAdapter. We do this by running the [`.create()` method](https://oipwg.github.io/oip-account/Account.html#create) on the `Account` object we just created. This method returns a Promise that will resolve if your Account was created successfully and saved to the StorageAdapter properly. In this case, the Account created will be saved to the localStorage.

```javascript
myAccount.create().then((account_info) => {
	console.log(account_info)
})
```

Now that you have created your account, you should be able to move on to the [Logging in to your Account]() section below to demonstrate how to login to the account we just created.

### Logging in to your Account

To login to an already created account, we will first need to import the `Account` class from the `oip-account` module. 

Note: If you have not yet created an Account, please see the [Create your first Account](https://github.com/oipwg/oip-account/#) Getting Started right above this one.

Go ahead and spawn a new `Account` Object with your login ID or Email. You will want to set the `password` to the password you chose in the [Create your first Account](https://github.com/oipwg/oip-account/#) section. 

```javascript
import { Account } from 'oip-account'

var myAccount = new Account("test@me.com", "password")
```

Now that we have created our `Account` Object (named `myAccount` in this case), we will want to "login" to it. We do this by running the [`.login()` method](https://oipwg.github.io/oip-account/Account.html#login) on the `Account` object we just created. This method returns a Promise that will be resolved if able to login to your account properly.

```javascript
myAccount.login().then((account_data) => {
	console.log("Account Login Successful", account_data)
})
```

### Paying for an Artifact

To Pay for an Artifact, we need to first get the Artifact we want to pay for from the index using the [OIP Index](https://github.com/oipwg/oip-index/) Module. Once we have selected the Artifact as well as the ArtifactFile for which we wish to pay, we can make the payment to view/buy the specific File. 

In order to make the Payment, we need to make sure that we are logging into the Account. You can view an example below of how we login to the account we created in [Create your first Account](https://github.com/oipwg/oip-account/#) and then pay for the ArtifactFile we wish to view.
```javascript
import { Account } from 'oip-account';
import { Index } from 'oip-index';

var myAccount = new Account("test@me.com", "password")

var index = new Index();

myAccount.login().then((account_data) => {
	console.log("Logged Into Account");

	index.getArtifact("513691", (artifact) => {
		var files = artifact.getFiles();
		var file = files[0];

		myAccount.payForArtifactFile(artifact, file, "view", "usd").then((txid) => {
			console.log("Payment Successful! https://livenet.flocha.in/tx/" + txid)
		})
	})
})
```

## API Documentation
Learn more about how each Class works, or take a look at all functions available to you.
* [Documentation Home](https://oipwg.github.io/oip-account/)
	* [Account](https://oipwg.github.io/oip-account/Account.html)
	* [ArtifactPaymentBuilder](https://oipwg.github.io/oip-account/Account.html)
	* [StorageAdapter](https://oipwg.github.io/oip-account/StorageAdapter.html)
	* [MemoryStorageAdapter](https://oipwg.github.io/oip-account/MemoryStorageAdapter.html)
	* [LocalStorageAdapter](https://oipwg.github.io/oip-account/LocalStorageAdapter.html)
	* [KeystoreStorageAdapter](https://oipwg.github.io/oip-account/KeystoreStorageAdapter.html)

## License
MIT License

Copyright (c) 2018 Open Index Protocol Working Group

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.