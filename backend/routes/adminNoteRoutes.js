const express = require('express');
const router = express.Router();
const {
  getAllNotes,
  getPublicNotes,
  createNote,
  updateNote,
  deleteNote,
  bulkDeleteNotes,
} = require('../controllers/adminNoteController');

router.get('/public', getPublicNotes);
router.route('/').get(getAllNotes).post(createNote);
router.delete('/bulk', bulkDeleteNotes);
router.route('/:id').put(updateNote).delete(deleteNote);

module.exports = router;
