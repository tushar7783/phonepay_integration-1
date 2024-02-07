const { newPayment, checkStatus } = require("../controller/paymentController");
const express = require("express");
const router = express();

router.post("/payment", newPayment);
router.post("/status/", checkStatus);

module.exports = router;
