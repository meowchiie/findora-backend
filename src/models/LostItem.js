// models/LostItem.js

const { DataTypes } = require('sequelize');
const db = require('../../config/database');

const LostItem = db.define('LostItems', {

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    category: {
        type: DataTypes.STRING,
        allowNull: false
    },

    location: {
        type: DataTypes.STRING,
        allowNull: false
    },

    lost_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    lost_time: {
        type: DataTypes.TIME,
        allowNull: false
    },

    contact: {
        type: DataTypes.STRING,
        allowNull: false
    },

    photo_path: {
        type: DataTypes.STRING,
        allowNull: true
    }

}, {
    freezeTableName: true
});

module.exports = LostItem;