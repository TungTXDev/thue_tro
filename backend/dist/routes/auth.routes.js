const { Router } = require("express");
const { register, login, getMe } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, getMe);

module.exports = router;
