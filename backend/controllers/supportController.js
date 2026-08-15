const { SupportTicket, EmailHistory } = require('../models');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');

// @desc    Create a new support ticket (Contact Us form)
// @route   POST /api/support
// @access  Public
const createTicket = async (req, res) => {
  try {
    const { name, email, subject, message, toDeveloper } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const ticket = await SupportTicket.create({
      name,
      email,
      subject,
      message,
      status: 'Open'
    });

    // Send confirmation email to User
    try {
      const userHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #FF8C00;">Support Ticket Received</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for contacting W!FO MART Support. We have received your message regarding <strong>${subject}</strong>.</p>
          <p>Our team is reviewing your request and will get back to you as soon as possible.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">Your message:</p>
          <blockquote style="font-size: 12px; color: #555; background: #fafafa; padding: 10px; border-left: 2px solid #ccc; margin: 0; white-space: pre-wrap;">
            ${message}
          </blockquote>
          <p style="margin-top: 20px;">Best regards,<br/><strong>W!FO MART Support Team</strong></p>
        </div>
      `;
      sendEmail({
        email,
        subject: `Ticket Received: ${subject}`,
        text: `Hi ${name},\n\nWe have received your support request regarding "${subject}". Our team will get back to you shortly.\n\nW!FO MART Support`,
        html: userHtml
      }).catch(e => console.error('Failed to send ticket confirmation to user', e));
    } catch (e) { console.error('Failed to prepare ticket confirmation', e); }

    // Send alert email to Admin / Developer
    try {
      const targetEmail = toDeveloper ? process.env.DEVELOPER_EMAIL : process.env.EMAIL_USER;
      
      if (targetEmail) {
        const adminHtml = `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: ${toDeveloper ? '#e83e8c' : '#d9534f'};">${toDeveloper ? 'New Developer Contact' : 'New Support Ticket'}</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <blockquote style="font-size: 14px; color: #555; background: #f9f9f9; padding: 10px; border-left: 3px solid ${toDeveloper ? '#e83e8c' : '#d9534f'}; margin: 0; white-space: pre-wrap;">
              ${message}
            </blockquote>
            <p style="margin-top: 20px;"><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/support" style="background: ${toDeveloper ? '#e83e8c' : '#FF8C00'}; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View in Admin Panel</a></p>
          </div>
        `;
        sendEmail({
          email: targetEmail, 
          subject: `[ACTION REQUIRED] ${toDeveloper ? 'New Developer Message' : 'New Ticket'}: ${subject}`,
          text: `New Message from ${name} (${email})\nSubject: ${subject}\n\nMessage:\n${message}`,
          html: adminHtml
        }).catch(e => console.error('Failed to send ticket alert to admin', e));
      }
    } catch (e) { console.error('Failed to prepare ticket alert to admin', e); }

    res.status(201).json({ message: 'Ticket submitted successfully', ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all tickets
// @route   GET /api/support
// @access  Admin
const getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reply to a ticket and mark as Resolved
// @route   POST /api/support/:id/reply
// @access  Admin
const replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage, admin_attachment_url } = req.body;

    if (!replyMessage) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Update ticket
    ticket.admin_reply = replyMessage;
    ticket.status = 'Resolved';
    ticket.resolvedAt = new Date();
    if (admin_attachment_url) {
      ticket.admin_attachment_url = admin_attachment_url;
    }
    await ticket.save();

    let attachmentHtml = '';
    if (admin_attachment_url) {
      attachmentHtml = `
        <div style="margin-top: 15px;">
          <strong>Attachment:</strong> <br/>
          <a href="${admin_attachment_url}" target="_blank" style="color: #FF8C00; text-decoration: none;">View File</a>
        </div>
      `;
    }

    // Send email to user
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #FF8C00;">Support Reply: ${ticket.subject}</h2>
        <p>Hi <strong>${ticket.name}</strong>,</p>
        <p>Thank you for reaching out to W!FO MART Support. Here is the response to your inquiry:</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #FF8C00; margin: 20px 0;">
          <p style="white-space: pre-wrap; margin: 0;">${replyMessage}</p>
          ${attachmentHtml}
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">Your original message:</p>
        <blockquote style="font-size: 12px; color: #555; background: #fafafa; padding: 10px; border-left: 2px solid #ccc; margin: 0; white-space: pre-wrap;">
          ${ticket.message}
        </blockquote>
        <p style="margin-top: 20px;">Best regards,<br/><strong>W!FO MART Support Team</strong></p>
      </div>
    `;

    sendEmail({
      email: ticket.email,
      subject: `RE: ${ticket.subject}`,
      text: `Hi ${ticket.name},\n\nThank you for reaching out to W!FO MART Support. Here is the response to your inquiry:\n\n${replyMessage}\n\nBest regards,\nW!FO MART Support Team`,
      html: htmlEmail
    }).catch(err => console.error('Failed to send background email:', err));

    res.json({ message: 'Reply sent successfully', ticket });
  } catch (error) {
    console.error('Error replying to ticket:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Send a direct email to any user
// @route   POST /api/support/direct-email
// @access  Admin
const sendDirectEmail = async (req, res) => {
  try {
    const { toEmail, ccEmail, subject, message } = req.body;

    if (!toEmail || !subject || !message) {
      return res.status(400).json({ message: 'To Email, Subject, and Message are required' });
    }

    const htmlEmail = `
      <div style="font-family: 'Comic Sans MS', Arial, sans-serif; background-color: #fdf2f8; padding: 20px; color: #475569;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 2px solid #fce7f3;">
          <div style="background-color: #f472b6; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 1px;">A Message For You! 💌</h1>
          </div>
          
          <div style="padding: 30px; line-height: 1.8; font-size: 15px;">
            <p style="font-size: 18px; font-weight: bold; color: #f472b6; margin-top: 0;">Hello there! 👋</p>
            
            <p>Our admin team at <strong>W!FO MART</strong> wanted to reach out to you directly with a special message.</p>
            
            <div style="background: #f8fafc; border-left: 4px solid #f472b6; padding: 20px; border-radius: 12px 12px 12px 0; margin: 20px 0; font-weight: 500; white-space: pre-wrap;">${message}</div>
            
            ${req.file ? '<p style="color: #8b5cf6; font-weight: bold; font-size: 14px;">📎 <i>P.S. We attached a file for you to check out!</i></p>' : ''}
          </div>
          
          <div style="background: #fff1f2; padding: 20px; text-align: center; border-top: 2px dashed #fce7f3;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #64748b;">
              Sent with <span style="color: #f472b6; font-size: 18px;">❤️</span> from the W!FO MART Team!
            </p>
            <p style="margin: 5px 0 0; font-size: 12px; color: #94a3b8;">(You can reply directly to this email if you need anything!)</p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      email: toEmail,
      cc: ccEmail || undefined,
      subject: subject,
      text: message, // Plain text alternative helps bypass spam filters
      html: htmlEmail
    };

    if (req.file) {
      mailOptions.attachments = [
        {
          filename: req.file.originalname,
          content: req.file.buffer
        }
      ];
    }

    // Fire and forget to make the API response lightning fast
    (async () => {
      try {
        // Log to history first, so we don't lose the record if SMTP fails
        await EmailHistory.create({
          toEmail,
          ccEmail: ccEmail || null,
          subject,
          message,
          hasAttachment: !!req.file
        });

        await sendEmail(mailOptions);
      } catch (err) {
        console.error('Failed to send or log direct email:', err);
      }
    })();

    res.json({ message: 'Email queued successfully' });
  } catch (error) {
    console.error('Error in sendDirectEmail logic:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get sent direct email history
// @route   GET /api/support/history
// @access  Admin
const getEmailHistory = async (req, res) => {
  try {
    const history = await EmailHistory.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(history);
  } catch (error) {
    console.error('Error fetching email history:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get tickets for a specific order (for user panel)
// @route   GET /api/support/order/:orderId?email=...
// @access  Public
const getOrderTickets = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const tickets = await SupportTicket.findAll({
      where: {
        email,
        subject: `Issue with Order #${orderId}`
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching order tickets:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user's tickets
// @route   GET /api/support/my-tickets
// @access  Private
const getUserTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      where: { email: req.user.email },
      order: [['createdAt', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a ticket
// @route   DELETE /api/support/:id
// @access  Admin
const deleteTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (ticket.admin_attachment_url && ticket.admin_attachment_url.includes('cloudinary.com')) {
      try {
        const cloudinary = require('../config/cloudinary');
        const urlParts = ticket.admin_attachment_url.split('/');
        const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
        const publicId = folderAndFile.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Failed to delete Cloudinary attachment:', error);
      }
    }

    await ticket.destroy();
    res.json({ message: 'Ticket removed' });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Cannot delete this ticket because it is referenced by other data.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Bulk delete tickets
// @route   DELETE /api/support/bulk
// @access  Admin
const bulkDeleteTickets = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No ticket IDs provided' });
    }

    const tickets = await SupportTicket.findAll({ where: { id: ids } });
    const cloudinary = require('../config/cloudinary');

    const deletePromises = [];
    tickets.forEach((ticket) => {
      if (ticket.admin_attachment_url && ticket.admin_attachment_url.includes('cloudinary.com')) {
        try {
          const urlParts = ticket.admin_attachment_url.split('/');
          const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
          const publicId = folderAndFile.split('.')[0];
          if (publicId) {
            deletePromises.push(cloudinary.uploader.destroy(publicId));
          }
        } catch (error) {
          console.error(`Failed to queue Cloudinary attachment deletion:`, error);
        }
      }
    });

    if (deletePromises.length > 0) {
      await Promise.allSettled(deletePromises);
    }

    await SupportTicket.destroy({ where: { id: ids } });
    res.json({ message: `${ids.length} ticket(s) removed successfully` });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Cannot delete selected tickets because they are referenced by other data.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createTicket,
  getTickets,
  replyToTicket,
  sendDirectEmail,
  getEmailHistory,
  getOrderTickets,
  getUserTickets,
  deleteTicket,
  bulkDeleteTickets
};
