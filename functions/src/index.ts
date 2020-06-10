import {https} from 'firebase-functions';
import bent = require("bent");

/*
* Docs
* https://firebase.google.com/docs/functions/typescript
* https://developer.apple.com/documentation/appstorereceipts/verifyreceipt
*/

/*
Apple validation status codes
	[0]:     { message: 'Active', valid: true, error: false },
	[21000]: { message: 'App store could not read', valid: false, error: true },
	[21002]: { message: 'Data was malformed', valid: false, error: true },
	[21003]: { message: 'Receipt not authenticated', valid: false, error: true },
	[21004]: { message: 'Shared secret does not match', valid: false, error: true },
	[21005]: { message: 'Receipt server unavailable', valid: false, error: true },
	[21006]: { message: 'Receipt valid but sub expired', valid: true, error: false },
	[21007]: { message: 'Sandbox receipt sent to Production environment', valid: false, error: true, redirect: true },
	[21008]: { message: 'Production receipt sent to Sandbox environment', valid: false, error: true },
*/

const sendToApple = async (data: string) => {
	const body = JSON.stringify({ 'receipt-data': data })
	const post = bent('POST', 'json', 200)

	/* We try production following Apple recommendation */
	const productionResponse: bent.Json & { status?: number } = await post('https://buy.itunes.apple.com/verifyReceipt', body)

	/* If status is 21007, we try sandbox */
	if (productionResponse.status === 21007) {
		return await post('https://sandbox.itunes.apple.com/verifyReceipt', body)
	}

	return productionResponse
}

/*
*
* Postman can be used to test the deployed function.
* Paste a receipt data encoded as base64, without quotes, to a POST request Body as raw Text.
* Check if Content-Type is set to  text/plain in Header.
*
* * A sample receipt, working as of June 2020, can be obtained at
* https://stackoverflow.com/questions/33843281/apple-receipt-data-sample
*/
export const validateReceipt = https.onRequest(async (req, res) => {
	const body = await sendToApple(req.body)

	res.header("Content-Type", "application/json")
	res.send(JSON.stringify(body))
})

