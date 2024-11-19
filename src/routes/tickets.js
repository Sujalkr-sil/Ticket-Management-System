const express = require('express');
const { Ticket, User } = require('../models');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Create ticket
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { title, description } = req.body;
    const ticket = await Ticket.create({
      title,
      description,
      creatorId: req.session.userId
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tickets
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const where = req.session.isAdmin ? {} : { creatorId: req.session.userId };
    const tickets = await Ticket.findAll({
      where,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['username']
      }]
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update ticket (user can update description/title)
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      where: {
        id: req.params.id,
        creatorId: req.session.userId
      }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const { title, description } = req.body;
    await ticket.update({
      title: title || ticket.title,
      description: description || ticket.description
    });
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update ticket status (admin only)
router.patch('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!['pending', 'ongoing', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await ticket.update({ status });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;