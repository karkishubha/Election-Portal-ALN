/**
 * Admin User Model - Sequelize
 * Nepal Election Portal
 * 
 * Stores admin credentials for protected operations.
 * No public user accounts - admin only system.
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const AdminUser = sequelize.define('AdminUser', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  hashedPassword: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'hashed_password',
  },
  role: {
    type: DataTypes.ENUM('admin'),
    defaultValue: 'admin',
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'admin_users',
  timestamps: true,
  underscored: true,
  hooks: {
    // Hash password before saving - only if it's not already hashed
    beforeCreate: async (user) => {
      if (user.hashedPassword && !user.hashedPassword.startsWith('$2a$') && !user.hashedPassword.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(12);
        user.hashedPassword = await bcrypt.hash(user.hashedPassword, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('hashedPassword')) {
        const password = user.hashedPassword;
        if (password && !password.startsWith('$2a$') && !password.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(12);
          user.hashedPassword = await bcrypt.hash(password, salt);
        }
      }
    },
  },
});

// Instance method to compare password
AdminUser.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.hashedPassword);
};

// Instance method to remove sensitive data
AdminUser.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.hashedPassword;
  return values;
};

module.exports = AdminUser;
