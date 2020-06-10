import { https } from 'firebase-functions'
import bent = require("bent")

const sendToApple = async (data: string) => {
	const body = JSON.stringify({ 'receipt-data': data })
	const post = bent('POST', 'json', 200)

	/* We try production following Apple recommendation */
	try {
		const productionResponse: bent.Json & { status?: number } = await post('https://buy.itunes.apple.com/verifyReceipt', body)
		/* If status is 21007, we try sandbox */
		if (productionResponse.status === 21007) {
			return await post('https://sandbox.itunes.apple.com/verifyReceipt', body)
		}
		return productionResponse
	} catch (e) {
		console.error(e);
		return { 'error': JSON.stringify(e) }
	}
}

export const validateReceipt = https.onRequest(async (req, res) => {
	const body = await sendToApple(req.body)

	res.header("Content-Type", "application/json")
	res.send(JSON.stringify(body))
})

