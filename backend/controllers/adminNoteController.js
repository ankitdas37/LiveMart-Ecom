const AdminNote = require('../models/AdminNote');
const { Op } = require('sequelize');

// @desc  Get all admin notes (admin view)
// @route GET /api/admin-notes
const getAllNotes = async (req, res) => {
  try {
    const notes = await AdminNote.findAll({ order: [['createdAt', 'DESC']] });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get public notes (for frontend display - filtered by context)
// @route GET /api/admin-notes/public
const getPublicNotes = async (req, res) => {
  try {
    const { user_email, product_id, order_status, order_id } = req.query;

    const where = {};
    if (req.query.include_inactive !== 'true') {
      where.is_active = true;
    }
    const orConditions = [
      { target_type: 'all' },
    ];

    if (user_email) {
      orConditions.push({ target_type: 'user', target_user_email: user_email });
    }
    if (product_id) {
      orConditions.push({ target_type: 'product', target_product_id: parseInt(product_id) });
    }
    if (order_status) {
      orConditions.push({ target_type: 'order_status', target_order_status: order_status });
      orConditions.push({ target_type: 'all_orders' }); // If it's an order context, fetch all_orders
    }
    if (order_id) {
      orConditions.push({ target_type: 'order', target_order_id: parseInt(order_id) });
      orConditions.push({ target_type: 'all_orders' }); // Ensure it's caught
    }

    where[Op.or] = orConditions;

    const notes = await AdminNote.findAll({
      where,
      order: [
        // Priority order: urgent → high → normal → low
        ['priority', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create note
// @route POST /api/admin-notes
const createNote = async (req, res) => {
  try {
    const {
      title, content, file_url, file_type, file_name,
      target_type, target_user_email, target_product_id, target_order_status, target_order_id,
      priority, is_active,
    } = req.body;

    const note = await AdminNote.create({
      title,
      content,
      file_url: file_url || null,
      file_type: file_type || null,
      file_name: file_name || null,
      target_type: target_type || 'all',
      target_user_email: target_user_email || null,
      target_product_id: target_product_id || null,
      target_order_status: target_order_status || null,
      target_order_id: target_order_id || null,
      priority: priority || 'normal',
      is_active: is_active !== undefined ? is_active : true,
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update note
// @route PUT /api/admin-notes/:id
const updateNote = async (req, res) => {
  try {
    const note = await AdminNote.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await note.update(req.body);
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete note
// @route DELETE /api/admin-notes/:id
const deleteNote = async (req, res) => {
  try {
    const note = await AdminNote.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.file_url && note.file_url.includes('cloudinary.com')) {
      try {
        const cloudinary = require('../config/cloudinary');
        const urlParts = note.file_url.split('/');
        const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
        const publicId = folderAndFile.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Failed to delete Cloudinary file:', error);
      }
    }

    await note.destroy();
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Bulk delete notes
// @route DELETE /api/admin-notes/bulk
const bulkDeleteNotes = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No note IDs provided' });
    }

    const notes = await AdminNote.findAll({ where: { id: ids } });
    const cloudinary = require('../config/cloudinary');

    const deletePromises = [];
    notes.forEach((note) => {
      if (note.file_url && note.file_url.includes('cloudinary.com')) {
        try {
          const urlParts = note.file_url.split('/');
          const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
          const publicId = folderAndFile.split('.')[0];
          if (publicId) deletePromises.push(cloudinary.uploader.destroy(publicId));
        } catch (error) {
          console.error(`Failed to queue Cloudinary file deletion:`, error);
        }
      }
    });

    if (deletePromises.length > 0) {
      await Promise.allSettled(deletePromises);
    }

    await AdminNote.destroy({ where: { id: ids } });
    res.json({ message: `${ids.length} note(s) removed successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getAllNotes, getPublicNotes, createNote, updateNote, deleteNote, bulkDeleteNotes };
