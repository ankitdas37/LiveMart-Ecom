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
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/public', getPublicNotes); // Public announcements
router.route('/').get(protect, admin, getAllNotes).post(protect, admin, createNote);
router.delete('/bulk', protect, admin, bulkDeleteNotes);
router.route('/:id').put(protect, admin, updateNote).delete(protect, admin, deleteNote);

module.exports = router;
