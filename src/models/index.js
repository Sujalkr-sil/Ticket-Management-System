const User = require('./User');
const Ticket = require('./Ticket');

// Relationships
Ticket.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
User.hasMany(Ticket, { foreignKey: 'creatorId' });

module.exports = {
  User,
  Ticket
};