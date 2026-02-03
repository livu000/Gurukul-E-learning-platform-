const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/auth.middleware");
//console.log("DEBUG auth =>", authenticate);
const certificateController = require("../controllers/certificate.controller");
//console.log("DEBUG controller import =>", certificateController);
router.post(
  "/course/:courseId/issue",
  authenticate,
  certificateController.issueCertificate
);

router.get(
  "/my",
  authenticate,
  certificateController.getMyCertificates
);

router.get(
  "/verify/:certificateId",
  certificateController.verifyCertificate
);

module.exports = router;
