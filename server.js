const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const qs = require('qs');
const path = require('path')
const axios = require('axios')
const app = express();
const PORT = 8080;
app.use(cors()); // ✅ enable CORS for all origins
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')));

// sam
let zuoraToken = null;

app.get('/zuora/invoice/:id', async (req, res) => {
  const invoiceId = req.params.id;

  try {

    // Step 1: Get OAuth token
    const tokenResponse = await axios.post(
      'https://rest.test.zuora.com/oauth/token',
      qs.stringify({
        client_id: 'c3641623-a1e5-450c-a24d-6593c7278019',
        client_secret: '=T7Kq=74I/Nritk0GMooUUKCJaXa8n33EAyAhu/',
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;
    console.log('accessToken', tokenResponse)
    if (!accessToken) {
      return res.status(500).json({ error: 'Failed to get access token' });
    }


    // Step 2: Get invoice by ID
    const invoiceResponse = await axios.get(
      `https://rest.test.zuora.com/v1/invoices/${invoiceId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );

    const invoiceData = invoiceResponse.data;
    // const accountId = invoiceData.accountId;

    if (!invoiceData.id) {
      return res.status(404).json({ error: 'Invoice ID not found in invoice data' });
    }

    // Step 3: Get account by accountId
    const queryData = await axios.post(
      `https://rest.test.zuora.com/query/jobs`,

      {
        "query": `SELECT DISTINCT sub.ID AS SubscriptionID FROM invoiceitem ii JOIN Invoice inv ON ii.InvoiceId = inv.ID JOIN Subscription sub ON ii.SubscriptionId = sub.ID WHERE inv.ID = '${invoiceData.id}'`,
        "compression": "NONE",
        "output": {
          "target": "S3"
        },
        "outputFormat": "JSON"
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );

    const queryDerails = queryData.data.data;
    if (!queryDerails.id) {
      return res.status(404).json({ error: 'No subscription data found for the invoice' });
    }
    console.log('queryDerailsID', queryDerails.id)
    //Step 3: Get account by accountId

    let status = null;
    let responseData = null;
    let fileDetails = null;
    while (status != 'completed') {
      fileDetails = await axios.get(
        `https://rest.test.zuora.com/query/jobs/${queryDerails.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
          }
        }
      );
      responseData = fileDetails.data.data
      status = responseData.queryStatus

      if (status != 'completed') {
        setTimeout(() => { }, 2000);
      }
    }


    if (!status) {
      return res.status(404).json({ error: 'status not found in invoice data' });
    }

    // Step 3: Get account by accountId
    const subscriptionResponse = await axios.get(responseData.dataFile);
    const subscriptionData = subscriptionResponse.data;


    if (!subscriptionData.SubscriptionID) {
      return res.status(404).json({ error: 'subscriptionData not found in invoice data' });
    }

    const invoiceWithCCResponse = await axios.get(
      `https://rest.test.zuora.com/v1/subscriptions/${subscriptionData.SubscriptionID}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    // Combine invoice and account info 
    res.json({
      invoiceWithCCDetails: invoiceWithCCResponse.data,
      // subscriptionDetails: subscriptionData,
      // fileDetails: fileDetails.data,
      // queryData: queryData.data,
      accessToken: accessToken,
      invoice: invoiceData,
      // account: accountResponse.data
    });

  } catch (err) {
    console.error('Zuora API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to retrieve invoice or account data' });
  }
});


// Create Payment Session API
async function createPaymentSession(currency, accountId, amount, invoiceId, tken) {
  console.log('currency', currency, 'createPaymentSession called with accountId:', accountId, 'amount:', amount, 'invoiceId', invoiceId, 'tken:', tken);
  let paymentGateway = currency == 'USD' ? "2c92a00e768e480a017690d7302d7d70" : "2c92a00f768e4fac017690d99cb73e9f"
  console.log('paymentGateway', paymentGateway)
  const response = await axios.post(
    `https://rest.test.zuora.com/web-payments/sessions`,
    {

      "currency": currency,
      "accountId": accountId,
      "processPayment": true,
      "storePaymentMethod": true,
      "paymentGateway": paymentGateway,
      "supports3DS2": true,
      // "invoices": [
      //   {
      //     "invoiceNumber": invoiceId
      //   }
      // ],
      "amount": amount,

    },

              

    {
      headers: {
        Authorization: `Bearer ${tken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('createPaymentSession response:', response.data);
  return response.data.token;

}

// Create Payment Session Endpoint
app.post('/create-payment-session', async (req, res) => {
  try {
    const { currency, inaccountId, amount, invoiceId, accessToken } = req.body;

    if (!this.zuoraToken) {
      //await getZuoraAccessToken();
    }
    const tken = accessToken;
    console.log('tken', tken)
    const accountId = inaccountId
    console.log('accountId', accountId)
    const sessionToken = await createPaymentSession(currency, accountId, amount, invoiceId, tken);
    console.log('sessionToken', sessionToken)
    res.json(sessionToken);
  } catch (error) {
    console.error('Zuora API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

    // Create Payment Session Endpoint
app.post('/apply-payment', async (req, res) => {
  try {
    const { paymentid,amount,invoiceId,accessToken } = req.body;
    // const tken = accessToken;
    // console.log('tken', tken)
    // const accountId = inaccountId
    // console.log('accountId', accountId)
    const applyPaymentResponse = await applyPayment(paymentid, amount,invoiceId,accessToken);
    console.log('applyPaymentResponse', applyPaymentResponse)
    res.json(applyPaymentResponse);
  } catch (error) {
    console.error('Zuora API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to apply Payment to invoice' });
  }
});


async function applyPayment(paymentkey, amount,invoiceid, accessToken) {
  console.log('paymentkey', paymentkey, 'invoiceid', invoiceid, 'amount:', amount, 'accessToken', accessToken);
  console.log("paymentURL", `https://rest.test.zuora.com/v1/payments/${paymentkey}/apply`);
  const response = await axios.put(
    `https://rest.test.zuora.com/v1/payments/${paymentkey}/apply`,
          {
            "invoices": [
              {
                "invoiceId": invoiceid,
                "amount": amount
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            }
          }
  );

  console.log('applyPayment response:', response.data);
  return response.data;

}




app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
