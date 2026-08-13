import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, CheckCircle, Clock, Send, MessageSquare, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminDeleteModal from '../../components/admin/AdminDeleteModal';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  
  // Modals state
  const [activeTicket, setActiveTicket] = useState(null);
  const [activeHistory, setActiveHistory] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAttachment, setReplyAttachment] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  
  const [showDirectEmail, setShowDirectEmail] = useState(false);
  const [directEmailForm, setDirectEmailForm] = useState({ toEmail: '', ccEmail: '', subject: '', message: '', attachment: null });

  // Delete Modal State
  const [ticketToDelete, setTicketToDelete] = useState(null); // null | id | 'bulk'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const { data } = await axios.get('/api/support');
      setTickets(data);
    } catch (error) {
      toast.error('Failed to load tickets');
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get('/api/support/history');
      setHistory(data);
    } catch (error) {
      toast.error('Failed to load history');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTickets(), fetchHistory()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleDeleteClick = (id) => {
    setTicketToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (ticketToDelete === 'bulk') {
        await axios.delete('/api/support/bulk', { data: { ids: selectedTickets } });
        fetchTickets();
        setSelectedTickets([]);
      } else {
        await axios.delete(`/api/support/${ticketToDelete}`);
        fetchTickets();
      }
      setTicketToDelete(null);
      setShowDeleteModal(false);
      toast.success('Deleted successfully');
    } catch (error) {
      toast.error('Failed to delete ticket(s)');
      throw error;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTickets(tickets.map(t => t.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setIsReplying(true);
    try {
      let admin_attachment_url = null;
      if (replyAttachment) {
        const formData = new FormData();
        formData.append('image', replyAttachment); // backend uploadRoute expects 'image'
        const uploadRes = await axios.post('/api/upload', formData);
        admin_attachment_url = uploadRes.data.imageUrl;
      }

      await axios.post(`/api/support/${activeTicket.id}/reply`, { 
        replyMessage, 
        admin_attachment_url 
      });
      toast.success('Reply sent & ticket resolved!');
      setActiveTicket(null);
      setReplyMessage('');
      setReplyAttachment(null);
      fetchTickets();
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const handleDirectEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('toEmail', directEmailForm.toEmail);
      if (directEmailForm.ccEmail) formData.append('ccEmail', directEmailForm.ccEmail);
      formData.append('subject', directEmailForm.subject);
      formData.append('message', directEmailForm.message);
      if (directEmailForm.attachment) {
        formData.append('attachment', directEmailForm.attachment);
      }

      await axios.post('/api/support/direct-email', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Direct email sent successfully!');
      setShowDirectEmail(false);
      setDirectEmailForm({ toEmail: '', ccEmail: '', subject: '', message: '', attachment: null });
      fetchHistory(); // Refresh history table
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Support Tickets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Support</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage user inquiries and send direct emails.</p>
        </div>
        <button
          onClick={() => setShowDirectEmail(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-amber-600/20 transition-all"
        >
          <Mail className="w-5 h-5" /> Send Direct Email
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'tickets' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50 dark:bg-amber-900/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            Support Tickets
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeTab === 'history' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50 dark:bg-amber-900/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            Sent Email History
          </button>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'tickets' ? (
            <>
              {selectedTickets.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-3 border-b border-amber-100 dark:border-amber-900/50 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                      {selectedTickets.length} Selected
                    </div>
                    <button
                      onClick={() => setSelectedTickets([])}
                      className="text-sm text-amber-700 dark:text-amber-400 font-medium hover:underline"
                    >
                      Clear Selection
                    </button>
                  </div>
                  <button
                    onClick={() => { setTicketToDelete('bulk'); setShowDeleteModal(true); }}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium text-sm whitespace-nowrap hover:bg-red-700 shadow-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Selected
                  </button>
                </div>
              )}
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedTickets.length === tickets.length && tickets.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      No support tickets found.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => {
                    const isSelected = selectedTickets.includes(ticket.id);
                    return (
                    <tr key={ticket.id} className={`transition-colors ${isSelected ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTickets([...selectedTickets, ticket.id]);
                            } else {
                              setSelectedTickets(selectedTickets.filter(id => id !== ticket.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{ticket.name}</div>
                        <div className="text-xs text-slate-500">{ticket.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{ticket.subject}</td>
                      <td className="px-6 py-4">
                        {ticket.status === 'Resolved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" /> Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" /> {ticket.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActiveTicket(ticket)}
                            className="text-amber-600 hover:text-amber-700 font-medium"
                          >
                            {ticket.status === 'Resolved' ? 'View' : 'Reply'}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(ticket.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-4">To / CC</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Attachment</th>
                  <th className="px-6 py-4 whitespace-nowrap">Sent Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <Mail className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      No sent emails found.
                    </td>
                  </tr>
                ) : (
                  history.map((email) => (
                    <tr key={email.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{email.toEmail}</div>
                        {email.ccEmail && <div className="text-xs text-slate-500 mt-0.5">CC: {email.ccEmail}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{email.subject}</td>
                      <td className="px-6 py-4">
                        {email.hasAttachment ? (
                          <span className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium">
                            Yes
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(email.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setActiveHistory(email)}
                          className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                          View Message
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                Ticket #{activeTicket.id}
              </h2>
              <button onClick={() => setActiveTicket(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">From: <span className="font-normal text-slate-600 dark:text-slate-400">{activeTicket.name} ({activeTicket.email})</span></p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject: <span className="font-normal text-slate-600 dark:text-slate-400">{activeTicket.subject}</span></p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{activeTicket.message}</p>
              </div>

              {activeTicket.status === 'Resolved' ? (
                <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                  <h3 className="font-semibold text-emerald-600 flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" /> Your Reply
                  </h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 whitespace-pre-wrap">{activeTicket.admin_reply}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReplySubmit} className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Write Reply (will be emailed to customer):</label>
                  <textarea
                    required
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows="5"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm dark:text-white"
                    placeholder="Type your response here..."
                  ></textarea>

                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Attach File (optional)</label>
                    <input 
                      type="file" 
                      onChange={(e) => setReplyAttachment(e.target.files[0])}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setActiveTicket(null)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isReplying} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-xl font-medium shadow-lg shadow-amber-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                      {isReplying ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send className="w-4 h-4" />}
                      {isReplying ? 'Sending...' : 'Send Reply & Resolve'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History View Modal */}
      {activeHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-500" />
                Sent Message
              </h2>
              <button onClick={() => setActiveHistory(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">To: <span className="font-normal text-slate-600 dark:text-slate-400">{activeHistory.toEmail}</span></p>
                {activeHistory.ccEmail && (
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">CC: <span className="font-normal text-slate-600 dark:text-slate-400">{activeHistory.ccEmail}</span></p>
                )}
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject: <span className="font-normal text-slate-600 dark:text-slate-400">{activeHistory.subject}</span></p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date: <span className="font-normal text-slate-600 dark:text-slate-400">{new Date(activeHistory.createdAt).toLocaleString()}</span></p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{activeHistory.message}</p>
              </div>
              {activeHistory.hasAttachment && (
                <div className="flex items-center gap-2 text-sm font-medium text-amber-600 mt-2">
                  <span>📎 Included an attachment</span>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button onClick={() => setActiveHistory(null)} className="px-6 py-2 text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Email Modal */}
      {showDirectEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-500" /> Send Direct Email
              </h2>
              <button onClick={() => setShowDirectEmail(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleDirectEmailSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">To Email <span className="text-xs text-slate-500 font-normal">(Separate multiple with commas)</span></label>
                <input
                  type="text"
                  required
                  value={directEmailForm.toEmail}
                  onChange={(e) => setDirectEmailForm({...directEmailForm, toEmail: e.target.value})}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  placeholder="customer@example.com, another@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CC Email <span className="text-xs text-slate-500 font-normal">(Optional, separate multiple with commas)</span></label>
                <input
                  type="text"
                  value={directEmailForm.ccEmail}
                  onChange={(e) => setDirectEmailForm({...directEmailForm, ccEmail: e.target.value})}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  placeholder="boss@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={directEmailForm.subject}
                  onChange={(e) => setDirectEmailForm({...directEmailForm, subject: e.target.value})}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  placeholder="Important update about your account"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea
                  required
                  value={directEmailForm.message}
                  onChange={(e) => setDirectEmailForm({...directEmailForm, message: e.target.value})}
                  rows="5"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Attach File (Optional)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Mail className="w-6 h-6 mb-2 text-slate-500 dark:text-slate-400" />
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {directEmailForm.attachment ? directEmailForm.attachment.name : 'Click to upload a file'}
                      </p>
                      {directEmailForm.attachment && (
                        <p className="text-xs text-amber-600 mt-1">{(directEmailForm.attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                      )}
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setDirectEmailForm({...directEmailForm, attachment: e.target.files[0]})}
                    />
                  </label>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowDirectEmail(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-xl font-medium shadow-lg shadow-amber-600/20 transition-all">
                  <Send className="w-4 h-4" /> Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setTicketToDelete(null); }}
        onConfirm={handleConfirmDelete}
        itemName={ticketToDelete === 'bulk' ? `${selectedTickets.length} Ticket(s)` : 'Ticket'}
        isBulk={ticketToDelete === 'bulk'}
      />
    </div>
  );
};

export default AdminSupport;
