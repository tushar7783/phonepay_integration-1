const crypto = require("crypto");
const axios = require("axios");
const salt_key = process.env.SALT_KEY;
merchant_id = "DHURONLINE";
function generateTranscationid() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const merchentPrefix = "T";
  const transactionId = `${merchentPrefix}${timestamp}${random}`;
  return transactionId;
}
// const merchantTransactionId = 10000000;

const newPayment = async (req, res) => {
  try {
    merchantTransactionId = generateTranscationid();
    const data = {
      merchantId: merchant_id,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.MUID,
      name: req.body.name,
      amount: req.body.amount * 100,
      redirectUrl: `http://localhost:5000/api/status/${merchantTransactionId}`,
      redirectMode: "POST",
      mobileNumber: req.body.number,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const payload = JSON.stringify(data);
    // console.log(payload);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data)
        res.send(response.data);
        // return res.redirect(
        //   response.data.data.instrumentResponse.redirectInfo.url
        // );
      })
      .catch(function (error) {
        console.error(error.response.data);
      });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

const checkStatus = async (req, res) => {
  const merchantTransactionId = req.body.transactionId;
  const merchantId = merchant_id;

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  // CHECK PAYMENT TATUS
  axios
    .request(options)
    .then(async (response) => {
      if (response.data.success === true) {
        // const url = `http://localhost:3000/success`;
        return res.send({ data: response.data });
      } else {
        // const url = `http://localhost:3000/failure`;
        return res.send({ data: response.data });
      }
    })
    .catch((error) => {
      console.error(error.response.data);
    });
};

module.exports = {
  newPayment,
  checkStatus,
};
