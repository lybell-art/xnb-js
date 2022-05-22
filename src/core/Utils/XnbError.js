export default class XnbError extends Error {
	constructor(message = '') {
		super(message);
		this.name = "XnbError";
		this.message = message;
		Error.captureStackTrace(this, XnbError);
	}
}