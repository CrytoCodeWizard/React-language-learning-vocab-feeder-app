const express = require("express");
const router = express.Router();
const vocabController = require('../controllers/vocab.controller');

router.get("/slack-info", vocabController.getSlackInfo);
router.get("/review-categories", vocabController.getReviewCategories);
router.get("/lesson-people-names", vocabController.getLessonPeopleNames);
router.get("/vocab", vocabController.getVocab);
router.post("/api/vocab", vocabController.postVocab);
router.post("/slack-message", vocabController.postSlackMessage);
router.post("/vocab-for-category", vocabController.getVocabForCategory);

module.exports = router;