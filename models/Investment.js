const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    planName: String,
    amountInvested: Number,
    dailyIncome: Number,
    totalReturn: Number,
    expiryDate: { type: Date, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Investment', InvestmentSchema);