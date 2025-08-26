const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// GET /contact - Get user's support tickets
router.get('/contact', async (req, res) => {
  try {
    // Check if user is logged in
    const username = req.cookies.username;
    if (!username) {
      return res.status(401).send('Not logged in');
    }

    // Load user's tickets from their personal file
    const userTickets = await persist.readUserFile(username, 'tickets.json');
    if (!userTickets || !Array.isArray(userTickets.items)) {
      // Return empty array if no tickets exist yet
      return res.json([]);
    }

    // Sort by date (newest first)
    const sortedTickets = userTickets.items.sort((a, b) => 
      new Date(b.created) - new Date(a.created)
    );

    res.json(sortedTickets);

  } catch (error) {
    console.error('Error loading tickets:', error);
    res.status(500).send('Error loading tickets');
  }
});

// POST /contact - Submit a new support ticket
router.post('/contact', async (req, res) => {
  try {
    // Check if user is logged in
    const username = req.cookies.username;
    if (!username) {
      return res.status(401).send('Not logged in');
    }

    const { category, subject, priority, message } = req.body;

    // Validate required fields
    if (!category || !subject || !priority || !message) {
      return res.status(400).send('All fields are required');
    }

    // Validate field lengths
    if (subject.length > 100) {
      return res.status(400).send('Subject must be 100 characters or less');
    }

    if (message.length > 1000) {
      return res.status(400).send('Message must be 1000 characters or less');
    }

    // Validate category
    const validCategories = ['order', 'account', 'technical', 'billing', 'return', 'general'];
    if (!validCategories.includes(category)) {
      return res.status(400).send('Invalid category');
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).send('Invalid priority');
    }

    // Generate ticket ID
    const ticketId = `T${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Create new ticket
    const newTicket = {
      id: ticketId,
      username: username,
      category: category,
      subject: subject.trim(),
      priority: priority,
      message: message.trim(),
      status: 'open', // open, in-progress, resolved
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    // Save to user's personal tickets file
    const userTickets = await persist.readUserFile(username, 'tickets.json');
    // Ensure the structure exists
    if (!userTickets.items || !Array.isArray(userTickets.items)) {
      userTickets.items = [];
    }
    userTickets.items.push(newTicket);
    await persist.writeUserFile(username, 'tickets.json', userTickets);

    // Also save to global tickets file for admin access
    const globalTickets = await persist.readJSON('tickets.json');
    // Ensure globalTickets is an object, not an array
    if (!globalTickets || typeof globalTickets !== 'object') {
      globalTickets = {};
    }
    globalTickets[ticketId] = newTicket;
    await persist.writeJSON('tickets.json', globalTickets);

    // Log activity
    await persist.appendActivity({ username, type: 'ticket-submit' });

    console.log(`New support ticket submitted: ${ticketId} by user ${username}`);

    res.json({ 
      success: true, 
      ticketId: ticketId,
      message: 'Support ticket submitted successfully'
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).send('Error creating ticket');
  }
});

// GET /admin/tickets - Admin view of all tickets with filtering
router.get('/admin/tickets', async (req, res) => {
  try {
    // Load all tickets from global file
    const globalTickets = await persist.readJSON('tickets.json');
    
    // Handle both empty file and ensure it's an object
    if (!globalTickets || typeof globalTickets !== 'object') {
      return res.json([]);
    }

    let ticketsArray = Object.values(globalTickets);
    
    // Apply filters from query parameters
    const { status, priority } = req.query;
    
    if (status) {
      ticketsArray = ticketsArray.filter(ticket => ticket.status === status);
    }
    
    if (priority) {
      ticketsArray = ticketsArray.filter(ticket => ticket.priority === priority);
    }
    
    // Sort by priority (high first) then by date (newest first)
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    ticketsArray.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.created) - new Date(a.created);
    });

    res.json(ticketsArray);

  } catch (error) {
    console.error('Error loading admin tickets:', error);
    res.status(500).send('Error loading tickets');
  }
});

// PUT /admin/tickets/:ticketId - Update ticket status (admin only)
router.put('/admin/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['open', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Load tickets from global file
    const globalTickets = await persist.readJSON('tickets.json');
    
    // Ensure globalTickets is an object
    if (!globalTickets || typeof globalTickets !== 'object') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    if (!globalTickets[ticketId]) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = globalTickets[ticketId];
    const oldStatus = ticket.status;
    ticket.status = status;
    ticket.updated = new Date().toISOString();

    // Update global tickets
    await persist.writeJSON('tickets.json', globalTickets);

    // Update user's personal tickets file
    try {
      const userTickets = await persist.readUserFile(ticket.username, 'tickets.json');
      if (userTickets && userTickets.items && Array.isArray(userTickets.items)) {
        const ticketIndex = userTickets.items.findIndex(t => t.id === ticketId);
        if (ticketIndex !== -1) {
          userTickets.items[ticketIndex].status = status;
          userTickets.items[ticketIndex].updated = ticket.updated;
          await persist.writeUserFile(ticket.username, 'tickets.json', userTickets);
        }
      }
    } catch (userFileError) {
      // Log error but don't fail the request if user file can't be updated
      console.error('Error updating user ticket file:', userFileError);
    }

    console.log(`Ticket ${ticketId} status updated from ${oldStatus} to ${status}`);

    res.json({ 
      success: true, 
      message: 'Ticket status updated successfully',
      ticketId: ticketId,
      oldStatus: oldStatus,
      newStatus: status
    });

  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Error updating ticket' });
  }
});

module.exports = router;