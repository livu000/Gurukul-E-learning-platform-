const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const certificateController = require("../controllers/certificate.controller");
router.post(
  "/course/:courseId/issue",
  authenticate,
  authorizeRoles('student'),
  certificateController.issueCertificate
);

router.get(
  "/my",
  authenticate,
  certificateController.getMyCertificates
);

router.get(
  "/issued",
  authenticate,
  authorizeRoles('admin'),
  certificateController.getIssuedCertificates
);

router.get(
  "/:certificateId/download",
  authenticate,
  certificateController.downloadCertificate
);

router.patch(
  "/:certificateId/revoke",
  authenticate,
  authorizeRoles('admin'),
  certificateController.revokeCertificate
);

router.get(
  "/verify/:certificateId",
  certificateController.verifyCertificate
);

module.exports = router;
