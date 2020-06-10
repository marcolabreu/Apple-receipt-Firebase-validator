import { RuntimeOptions, runWith } from "firebase-functions";
import bent = require("bent");

const sendToApple = async (data: string) => {
  const body = JSON.stringify({ "receipt-data": data });
  const post = bent("POST", "json", 200);

  /* We try production following Apple recommendation */
  try {
    const productionResponse: bent.Json & { status?: number } = await post(
      "https://buy.itunes.apple.com/verifyReceipt",
      body
    );

    /* If status is 21007, we try sandbox */
    if (productionResponse.status === 21007) {
      return await post("https://sandbox.itunes.apple.com/verifyReceipt", body);
    }

    return productionResponse;
  } catch (e) {
    console.error(e);
    return { error: JSON.stringify(e) };
  }
};

const runtimeOpts: RuntimeOptions = {
  timeoutSeconds: 5,
  memory: "128MB",
};

export const validateReceipt = runWith(runtimeOpts).https.onRequest(
  async (req, res) => {
    const appleResponse = await sendToApple(req.body);

    if (appleResponse.status === 0) {
      console.info(
        `Receipt for app ${appleResponse.receipt.bundle_id} decrypted by Apple ${appleResponse.environment} server.`
      );
    }

    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(appleResponse));
  }
);
