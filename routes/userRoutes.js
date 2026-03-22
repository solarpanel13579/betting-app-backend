const express= require("express");
const router= express.Router();

const {register,recharge,login,getUserProfile,invest,getMyInvestments,requestRecharge,getPendingRecharges,verifyTransaction}=require('../controllers/userController');

router.post('/register',register);
router.post('/recharge',recharge);
router.post('/login',login);
router.post('/profile/:id',getUserProfile);
router.post('/invest', invest);
router.get('/my-investments/:id', require('../controllers/userController').getMyInvestments);
router.post('/request-recharge', requestRecharge);
router.get('/pending-recharges', getPendingRecharges);
router.post('/verify-recharge', verifyTransaction);

module.exports=router;