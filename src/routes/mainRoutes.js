const router = require("express").Router(),
  notes = require("../controllers/afterAuth/main/notes");
  getNote = require("../controllers/afterAuth/main/getNote");

router.get("/api/user/notes", notes);

  router.get("/api/user/note/:noteid", getNote);

module.exports = router;
