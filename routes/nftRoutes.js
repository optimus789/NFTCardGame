const router = require("express").Router();

router.route("/").get((req, res) => {});

router.route("/add").post((req, res) => {});

router.route("/:id").get((req, res) => {});

router.route("/:id").delete((req, res) => {});

router.route("/update/:id").post((req, res) => {});
module.exports = router;
