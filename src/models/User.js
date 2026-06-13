const { DataTypes } = require('sequelize');
const db = require('../../config/database');

const User = db.define('Users', {

    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },

    nim: {
        type: DataTypes.STRING
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    role: {
        type: DataTypes.STRING,
        defaultValue: 'Mahasiswa'
    }

}, {
    freezeTableName: true
});

module.exports = User;