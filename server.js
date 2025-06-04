const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const qs = require('qs');
const path = require('path') 
const axios = require('axios') 
const app = express();
const PORT = 3000;
app.use(cors()); // ✅ enable CORS for all origins
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend/src/frontend')));

// sam
let zuoraToken = null;

// app.post('/create-payment-session', async (req, res) => {
//   try {
//     const { firstName, lastName, currency, amount } = req.body;

//     const contact = { 
//       firstName,
//       lastName,
//       country: "US",
//       state: "CA"
//     };

//     const accountRequest = {
//       name: `${firstName} ${lastName}`,
//       billToContact: contact,
//       billCycleDay: 1,
//       soldToSameAsBillTo: true,
//       autoPay: false,
//       currency
//     };

//     const accountResp = await zuoraClient.accountsApi().createAccountApi(accountRequest).execute();

//     const paymentSessionReq = {
//       currency,
//       amount: parseFloat(amount),
//       processPayment: true,
//       accountId: accountResp.getAccountId()
//     };

//     const sessionResp = await zuoraClient.paymentMethodsApi().createPaymentSessionApi(paymentSessionReq).execute();

//     res.json(sessionResp.getToken());
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Payment session creation failed" });
//   }
// });


// app.post('/zuora/token', async (req, res) => {
//   try {
//     const response = await axios.post(
//       'https://rest.apisandbox.zuora.com/oauth/token',
//       qs.stringify({
//         client_id: process.env.CLIENT_ID,
//         client_secret: process.env.CLIENT_SECRET,
//         grant_type: 'client_credentials'
//       }),
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Accept': 'application/json'
//         }
//       }
//     );
//     res.json(response.data);
//      zuoraToken = response.data.access_token;
    
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ error: 'Failed to get Zuora token' });
//   }
// });


app.get('/zuora/invoice/:id', async (req, res) => {
  const invoiceId = req.params.id;

  try {

    // Step 1: Get OAuth token
    const tokenResponse = await axios.post(
      'https://rest.test.zuora.com/oauth/token',
      qs.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
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
   console.log('accessToken',tokenResponse)
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
    const accountId = invoiceData.accountId;

    if (!accountId) {
      return res.status(404).json({ error: 'Account ID not found in invoice data' });
    }

    // Step 3: Get account by accountId
    const accountResponse = await axios.get(
      `https://rest.test.zuora.com/v1/accounts/${accountId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );

    // Combine invoice and account info
    res.json({
      accessToken:accessToken,
      invoice: invoiceData,
      account: accountResponse.data
    });

  } catch (err) {
    console.error('Zuora API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to retrieve invoice or account data' });
  }
});  



// Create Account API
// async function createZuoraAccount(data) {
//   const accountPayload = {
//     name: `${data.firstName} ${data.lastName}`,
//     billToContact: {
//       firstName: data.firstName,
//       lastName: data.lastName,
//       country: "US",
//       state: "CA"
//     },
//     soldToSameAsBillTo: true,
//     billCycleDay: 1,
//     autoPay: false,
//     currency: data.currency
//   };

//   const response = await axios.post(
//     `${process.env.ZUORA_ENV}/v1/accounts`,
//     accountPayload,
//     {
//       headers: {
//         Authorization: `Bearer ${zuoraToken}`,
//         Accept: 'application/json',
//         'Content-Type': 'application/json'
//       }
//     }
//   );

//   return response.data.accountId;
// }

// Create Payment Session API
  async function createPaymentSession(accountId,amount,invoiceId,tken) {
    console.log('createPaymentSession called with accountId:', accountId, 'amount:', amount, 'invoiceId',invoiceId, 'tken:', tken);
    const response = await axios.post(
      `https://rest.test.zuora.com/web-payments/sessions`,
      {
        
        "currency": "USD",
        "accountId": accountId,
        "processPayment": true,
        "storePaymentMethod": true,
        "paymentGateway": "2c92a00e768e480a017690d7302d7d70",
        
        "invoices": [
                      {
                        "invoiceNumber": invoiceId
                      }
    ],
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
    return response.data.token;

  }

// Create Payment Session Endpoint
app.post('/create-payment-session', async (req, res) => {
  try {
    const { inaccountId, amount,invoiceId,accessToken } = req.body;

    if (!this.zuoraToken) {
      //await getZuoraAccessToken();
    }
    const tken = accessToken; 
    console.log('tken',tken)
    const accountId = inaccountId
     console.log('accountId',accountId)
    const sessionToken = await createPaymentSession(accountId, amount,invoiceId,tken);
     console.log('sessionToken',sessionToken)
    res.json(sessionToken );
  } catch (error) {
    console.error('Zuora API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/index.html'));
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
