const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const qs = require('qs');
const path = require('path')
const axios = require('axios')
const app = express();
const PORT = 8080;
const allowedOrigins = [
  'http://localhost:4200',
  'https://brave-ground-08cf8f81e.1.azurestaticapps.net',
  'https://zuora.surveymonkey.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(bodyParser.json());
let accessToken = '';
let dimainToken = process.env.DOMAIN_TOKEN || 'WZpJ0rcK2t_3mq1cRz7y5A';

function verifyCustomHeader(req, res, next) {
  if (req.headers['x-requested-by'] === dimainToken) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}


app.get('/zuora/invoice/:id',verifyCustomHeader, async (req, res) => {
  const invoiceId = req.params.id;

   if(invoiceId.includes('INV') || invoiceId.includes('INV-') || invoiceId.includes('-')){
        return res.status(500).json({ error: 'Invalid Request' });
   }  else{
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

     accessToken = tokenResponse.data.access_token;
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

    // Step 3: Get Query Job data for Subscription ID
    const queryData = await axios.post(
      `https://rest.test.zuora.com/query/jobs`,

      {
        "query": `SELECT DISTINCT sub.ID AS SubscriptionID FROM invoiceitem 
        ii JOIN Invoice inv ON ii.InvoiceId = inv.ID JOIN Subscription sub ON 
        ii.SubscriptionId = sub.ID WHERE inv.ID = '${invoiceData.id}'`,
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
    //Step 4: Get file details 

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

    // Step 5: Get Subscription ID from the file
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

        const { CCEligible__c, CCFee__c ,accountName } = invoiceWithCCResponse.data;
        const basicinvoiceWithCCResponse = { CCEligible__c, CCFee__c ,accountName };
        const { id, invoiceNumber, accountId, amount,  balance, currency} = invoiceData;
        const basicinvoiceData =  { id, invoiceNumber, accountId, amount,  balance, currency} 

        res.setHeader('Cache-Control', 'no-cache, private, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        // Combine invoice and account info 
        res.json({
          invoiceWithCCDetails: basicinvoiceWithCCResponse,
          invoice: basicinvoiceData
          
        });

      } catch (err) {
        console.error('Zuora API error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to retrieve invoice or account data' });
      }
      }
    });


      // Create Payment Session API
      async function createPaymentSession(currency, accountId, amount, invoiceId, tken) {
      //console.log('currency', currency, 'createPaymentSession called with accountId:', accountId, 'amount:', amount, 'invoiceId', invoiceId, 'tken:', tken);
        let paymentGateway = currency == 'USD' ? process.env.paymentGatewayUSD : process.env.paymentGatewayNonUSD
        const response = await axios.post(
          `https://rest.test.zuora.com/web-payments/sessions`,
            {
              "currency": currency,
              "accountId": accountId,
              "processPayment": true,
              "storePaymentMethod": true,
              "paymentGateway": paymentGateway,
              "supports3DS2": true,
              "amount": amount
            
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

           const requester = req.headers['x-requested-by'];
          if (requester !== dimainToken) {
            return res.status(403).json({ error: 'Unauthorized request source' });
          }

          const { currency, inaccountId, amount, invoiceId } = req.body;
          const tken = accessToken;
          const accountId = inaccountId
          const sessionToken = await createPaymentSession(currency, accountId, amount, invoiceId, tken);
          res.json(sessionToken);
        } catch (error) {
          console.error('Zuora API error:', error.response?.data || error.message);
          res.status(500).json({ error: 'Failed to create payment session' });
        }
      });

          // Create Payment Session Endpoint
        app.post('/apply-payment', async (req, res) => {
        try {
          const { paymentid,amount,invoiceId,accountingCode } = req.body;
          const updatePaymentResponse = await updatePayment(paymentid,accessToken,accountingCode);
          const applyPaymentResponse = await applyPayment(paymentid, amount,invoiceId,accessToken);
          res.json({applyPaymentResponse,
                  updatePaymentResponse}
                  );
        } catch (error) {
          console.error('Zuora API error:', error.response?.data || error.message);
          res.status(500).json({ error: 'Failed to apply Payment to invoice' });
        }
      });

      async function updatePayment(paymentkey,accessToken,accountingCode ) {
      // console.log('updatePayment paymentkey', paymentkey, 'AccountingCode', accountingCode,'accessToken',accessToken);
        const response = await axios.put(
          `https://rest.test.zuora.com/v1/payments/${paymentkey}`,
                {
                  "financeInformation": {
                          "bankAccountAccountingCode": accountingCode
                  }
                },
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                  }
                }
        );

        return response.data;

      }


      async function applyPayment(paymentkey, amount,invoiceid, accessToken) {
      //console.log('applyPayment paymentkey', paymentkey, 'invoiceid', invoiceid, 'amount:', amount, 'accessToken', accessToken);
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

        return response.data;

      }

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
