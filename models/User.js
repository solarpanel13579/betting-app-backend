const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    password: { type: String, required: true },
    walletBalance: { type: Number, default: 0 },
    
    // --- REFERRAL SYSTEM FIELDS ---
    
    
    myReferralCode: { 
        type: String, 
        unique: true 
    },
    
   
    referredBy: { 
        type: String, 
        default: null 
    },
    
    
    referralCount: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });


UserSchema.pre('save', function(next) {
    if (!this.myReferralCode) {
      
        const namePart = (this.name || "USER").substring(0, 3).toUpperCase();
        const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
        this.myReferralCode = `${namePart}-${randomStr}`;
    }
});

module.exports = mongoose.model('User', UserSchema);
