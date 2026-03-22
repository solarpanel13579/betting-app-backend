const User=require("../models/User");
const bcrypt=require('bcryptjs');
const jwt= require("jsonwebtoken");
const Investment = require("../models/Investment")
const Transaction = require("../models/Transaction");


exports.register=async(req,res)=>{
    const{name,email,phone,password}=req.body;
    const hashedPassword= await bcrypt.hash(password,10);
    const user= new User({name,email,phone,password:hashedPassword});
    await user.save();
    res.json({message:"User Created"});

};

exports.login=async(req,res)=>{
    try{
        const{email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid Email or Password"});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid Email or Password"});
        }

        const token=jwt.sign(
            {id:user._id},
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        );
        res.json({
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                walletBalance:user.walletBalance
            }
        });

    }catch(error){
        res.status(500).json({message:"Server Error"})
    }
};

exports.recharge= async(req,res)=>{
    const{userId,amount}=req.body;
    const user=await User.findById(userId);
    user.walletBalance+=parseFloat(amount);
    await user.save();
    res.json({message:"Recharge Successfull",balance:user.walletBalance});

};
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(404).json({ message: "User not found" });
    }
};

// This mimics the "Investment" tab logic
exports.invest = async (req, res) => {
    try {
        const { userId, planName, amount, dailyIncome, durationDays } = req.body;
        const user = await User.findById(userId);

        if (user.walletBalance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // Deduct money
        user.walletBalance -= amount;
        await user.save();

        // Calculate maturity date
        const maturityDate = new Date();
        maturityDate.setDate(maturityDate.getDate() + parseInt(durationDays));

        // Record the investment (Assuming you have the Investment model)
        
        const newInvestment = new Investment({
            userId,
            planName,
            amountInvested: amount,
            dailyIncome,
            totalReturn: dailyIncome * durationDays,
            expiryDate: maturityDate
        });

        await newInvestment.save();
        res.json({ message: "Investment successful!", remainingBalance: user.walletBalance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.requestRecharge = async (req, res) => {
    try {
        const { userId, amount, transactionId } = req.body;
        const existing = await Transaction.findOne({ transactionId });
        if (existing) return res.status(400).json({ message: "Transaction ID already used" });

        const newTransaction = new Transaction({ userId, amount, transactionId });
        await newTransaction.save();
        res.json({ message: "Request submitted for verification" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPendingRecharges = async (req, res) => {
    try {
        const pending = await Transaction.find({ status: 'pending' }).populate('userId', 'name email');
        res.json(pending);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch requests" });
    }
};

exports.verifyTransaction = async (req, res) => {
    try {
        const { transactionId, status } = req.body;
        const trx = await Transaction.findOne({ transactionId });

        if (!trx || trx.status !== 'pending') return res.status(400).json({ message: "Invalid Request" });

        if (status === 'approved') {
            const user = await User.findById(trx.userId);
            user.walletBalance += parseFloat(trx.amount);
            await user.save();
            trx.status = 'approved';
        } else {
            trx.status = 'rejected';
        }

        await trx.save();
        res.json({ message: `Transaction ${status} successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyInvestments = async (req, res) => {
    try {
        const Investment = require('../models/Investment');
        // Finds all investments for this specific user
        const investments = await Investment.find({ userId: req.params.id }).sort({ createdAt: -1 });
        res.json(investments);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch investments" });
    }
};