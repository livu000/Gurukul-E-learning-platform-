const router = require("express").Router();
const ctrl = require("../controllers/certificate.controller");
const auth = require("../middleware/auth.middleware");

router.post("/course/:courseId/issue", auth, ctrl.issueCertificate);
router.get("/my", auth, ctrl.getMyCertificates);
router.get("/verify/:certificateId", ctrl.verifyCertificate);

module.exports = router;
