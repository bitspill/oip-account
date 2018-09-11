export class InvalidPassword extends Error {
	constructor(message) {
		super(message);

		this.name = "InvalidPassword"
	}
}

export class AccountNotFoundError extends Error {
	constructor(message){
		super(message)

		this.name = "AccountNotFoundError"
	}
}