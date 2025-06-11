"use strict";

var _this = void 0;
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (c = i[4] || 3, u = i[5] === e ? i[3] : i[5], i[4] = 3, i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { if (r) i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n;else { var o = function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); }; o("next", 0), o("throw", 1), o("return", 2); } }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
require('dotenv').config();
var qs = require('qs');
var path = require('path');
var axios = require('axios');
var app = express();
var PORT = 3000;
app.use(cors()); // ✅ enable CORS for all origins
app.use(bodyParser.json());
app.use(express["static"](path.join(__dirname, '../frontend/src/frontend')));

// sam
var zuoraToken = null;

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

app.get('/zuora/invoice/:id', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(req, res) {
    var invoiceId, tokenResponse, accessToken, invoiceResponse, invoiceData, queryData, queryDerails, status, responseData, fileDetails, subscriptionResponse, subscriptionData, invoiceWithCCResponse, _err$response, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          invoiceId = req.params.id;
          _context.p = 1;
          _context.n = 2;
          return axios.post('https://rest.test.zuora.com/oauth/token', qs.stringify({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'client_credentials'
          }), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            }
          });
        case 2:
          tokenResponse = _context.v;
          accessToken = tokenResponse.data.access_token;
          console.log('accessToken', tokenResponse);
          if (accessToken) {
            _context.n = 3;
            break;
          }
          return _context.a(2, res.status(500).json({
            error: 'Failed to get access token'
          }));
        case 3:
          _context.n = 4;
          return axios.get("https://rest.test.zuora.com/v1/invoices/".concat(invoiceId), {
            headers: {
              Authorization: "Bearer ".concat(accessToken),
              Accept: 'application/json'
            }
          });
        case 4:
          invoiceResponse = _context.v;
          invoiceData = invoiceResponse.data; // const accountId = invoiceData.accountId;
          // if (!accountId) {
          //   return res.status(404).json({ error: 'Account ID not found in invoice data' });
          // }
          // // Step 3: Get account by accountId
          // const accountResponse = await axios.get(
          //   `https://rest.test.zuora.com/v1/accounts/${accountId}`,
          //   {
          //     headers: {
          //       Authorization: `Bearer ${accessToken}`,
          //       Accept: 'application/json'
          //     }
          //   }
          // );
          if (invoiceData.id) {
            _context.n = 5;
            break;
          }
          return _context.a(2, res.status(404).json({
            error: 'Invoice ID not found in invoice data'
          }));
        case 5:
          _context.n = 6;
          return axios.post("https://rest.test.zuora.com/query/jobs", {
            "query": "SELECT DISTINCT sub.ID AS SubscriptionID FROM invoiceitem ii JOIN Invoice inv ON ii.InvoiceId = inv.ID JOIN Subscription sub ON ii.SubscriptionId = sub.ID WHERE inv.ID = '".concat(invoiceData.id, "'"),
            "compression": "NONE",
            "output": {
              "target": "S3"
            },
            "outputFormat": "JSON"
          }, {
            headers: {
              Authorization: "Bearer ".concat(accessToken),
              Accept: 'application/json'
            }
          });
        case 6:
          queryData = _context.v;
          queryDerails = queryData.data.data;
          if (queryDerails.id) {
            _context.n = 7;
            break;
          }
          return _context.a(2, res.status(404).json({
            error: 'No subscription data found for the invoice'
          }));
        case 7:
          console.log('queryDerailsID', queryDerails.id);
          //Step 3: Get account by accountId
          status = null;
          responseData = null;
          fileDetails = null;
        case 8:
          if (!(status != 'completed')) {
            _context.n = 10;
            break;
          }
          _context.n = 9;
          return axios.get("https://rest.test.zuora.com/query/jobs/".concat(queryDerails.id), {
            headers: {
              Authorization: "Bearer ".concat(accessToken),
              Accept: 'application/json'
            }
          });
        case 9:
          fileDetails = _context.v;
          responseData = fileDetails.data.data;
          status = responseData.queryStatus;
          if (status != 'completed') {
            setTimeout(function () {}, 2000);
          }
          _context.n = 8;
          break;
        case 10:
          if (status) {
            _context.n = 11;
            break;
          }
          return _context.a(2, res.status(404).json({
            error: 'status not found in invoice data'
          }));
        case 11:
          _context.n = 12;
          return axios.get(responseData.dataFile);
        case 12:
          subscriptionResponse = _context.v;
          subscriptionData = subscriptionResponse.data;
          if (subscriptionData.SubscriptionID) {
            _context.n = 13;
            break;
          }
          return _context.a(2, res.status(404).json({
            error: 'subscriptionData not found in invoice data'
          }));
        case 13:
          _context.n = 14;
          return axios.get("https://rest.test.zuora.com/v1/subscriptions/".concat(subscriptionData.SubscriptionID), {
            headers: {
              Authorization: "Bearer ".concat(accessToken),
              Accept: 'application/json'
            }
          });
        case 14:
          invoiceWithCCResponse = _context.v;
          // Combine invoice and account info 
          res.json({
            invoiceWithCCDetails: invoiceWithCCResponse.data,
            subscriptionDetails: subscriptionData,
            fileDetails: fileDetails.data,
            queryData: queryData.data,
            accessToken: accessToken,
            invoice: invoiceData
            // account: accountResponse.data
          });
          _context.n = 16;
          break;
        case 15:
          _context.p = 15;
          _t = _context.v;
          console.error('Zuora API error:', ((_err$response = _t.response) === null || _err$response === void 0 ? void 0 : _err$response.data) || _t.message);
          res.status(500).json({
            error: 'Failed to retrieve invoice or account data'
          });
        case 16:
          return _context.a(2);
      }
    }, _callee, null, [[1, 15]]);
  }));
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

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
function createPaymentSession(_x3, _x4, _x5, _x6, _x7) {
  return _createPaymentSession.apply(this, arguments);
} // Create Payment Session Endpoint
function _createPaymentSession() {
  _createPaymentSession = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(currency, accountId, amount, invoiceId, tken) {
    var paymentGateway, response;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          console.log('currency', currency, 'createPaymentSession called with accountId:', accountId, 'amount:', amount, 'invoiceId', invoiceId, 'tken:', tken);
          paymentGateway = currency == 'USD' ? "2c92a00e768e480a017690d7302d7d70" : "2c92a00f768e4fac017690d99cb73e9f";
          console.log('paymentGateway', paymentGateway);
          _context3.n = 1;
          return axios.post("https://rest.test.zuora.com/web-payments/sessions", {
            "currency": currency,
            "accountId": accountId,
            "processPayment": true,
            "storePaymentMethod": true,
            "paymentGateway": paymentGateway,
            "supports3DS2": true,
            "invoices": [{
              "invoiceNumber": invoiceId
            }],
            "amount": 1.00
          }, {
            headers: {
              Authorization: "Bearer ".concat(tken),
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }
          });
        case 1:
          response = _context3.v;
          console.log('createPaymentSession response:', response.data);
          return _context3.a(2, response.data.token);
      }
    }, _callee3);
  }));
  return _createPaymentSession.apply(this, arguments);
}
app.post('/create-payment-session', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(req, res) {
    var _req$body, currency, inaccountId, amount, invoiceId, accessToken, tken, accountId, sessionToken, _error$response, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          _context2.p = 0;
          _req$body = req.body, currency = _req$body.currency, inaccountId = _req$body.inaccountId, amount = _req$body.amount, invoiceId = _req$body.invoiceId, accessToken = _req$body.accessToken;
          if (!_this.zuoraToken) {
            //await getZuoraAccessToken();
          }
          tken = accessToken;
          console.log('tken', tken);
          accountId = inaccountId;
          console.log('accountId', accountId);
          _context2.n = 1;
          return createPaymentSession(currency, accountId, amount, invoiceId, tken);
        case 1:
          sessionToken = _context2.v;
          console.log('sessionToken', sessionToken);
          res.json(sessionToken);
          _context2.n = 3;
          break;
        case 2:
          _context2.p = 2;
          _t2 = _context2.v;
          console.error('Zuora API error:', ((_error$response = _t2.response) === null || _error$response === void 0 ? void 0 : _error$response.data) || _t2.message);
          res.status(500).json({
            error: 'Failed to create payment session'
          });
        case 3:
          return _context2.a(2);
      }
    }, _callee2, null, [[0, 2]]);
  }));
  return function (_x8, _x9) {
    return _ref2.apply(this, arguments);
  };
}());
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '../frontend/src/index.html'));
});
app.listen(PORT, function () {
  return console.log("Backend running on http://localhost:".concat(PORT));
});
