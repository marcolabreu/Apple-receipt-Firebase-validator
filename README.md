# Apple receipt Firebase validator function 
This is a simple function to verify an iOS app receipt using Apple servers. 
It uses `bent`, a very small functional HTTPS client with zero dependencies and 
can be deployed with the standard `firebase deploy` command.

## Testing
To test, just make a POST request to your function with a base64 
encoded receipt in the body.

### Using Postman
[Postman](https://www.postman.com) is a free API client for developers. Create a POST 
request, put your base64 encoded receipt—without quotes—in the Body as raw Text.
Check if Content-Type is set to text/plain in the Header, send it and check the response.

A sample receipt, still working as of June 2020, can be found on 
[this Stackoverflow post](https://stackoverflow.com/questions/33843281/apple-receipt-data-sample).

## Apple response status codes
	[0]:     { message: 'Active', valid: true, error: false },
	[21000]: { message: 'App store could not read', valid: false, error: true },
	[21002]: { message: 'Data was malformed', valid: false, error: true },
	[21003]: { message: 'Receipt not authenticated', valid: false, error: true },
	[21004]: { message: 'Shared secret does not match', valid: false, error: true },
	[21005]: { message: 'Receipt server unavailable', valid: false, error: true },
	[21006]: { message: 'Receipt valid but sub expired', valid: true, error: false },
	[21007]: { message: 'Sandbox receipt sent to Production environment', valid: false, error: true, redirect: true },
	[21008]: { message: 'Production receipt sent to Sandbox environment', valid: false, error: true },

## Some online docs
* [Firebase TypeScript functions](https://firebase.google.com/docs/functions/typescript)
* [Apple receipts](https://developer.apple.com/documentation/appstorereceipts/verifyreceipt)
