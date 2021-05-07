const {RFID,Transaction}  = require('../model/rfid_card.model')

exports.getAllTransactions = async(req, res) =>{
    try{
        const transactions = await Transaction.find({}).populate("transactions");
        if(!transactions){return res.send({message:'Transactions not found'}).status(400)}
        // return res.send(transactions).status(200);
        return transactions;
    }catch(e){return res.send({message:e.message}).status(400)}
   
}
exports.AllCards = async(req, res) =>{
    try{
    const cards = await RFID.find({});
    return res.send(cards);
    }catch(e){
        return res.send({message:e.message}).status(400);
    }
}
exports.loadAllCards = async(req, res) =>{
    try{
    const cards = await RFID.find({});
    return cards;
    }catch(e){
        return res.send({message:e.message}).status(400);
    }
}
exports.checkCard = async(req, res) =>{
    const card = await RFID.find({uuid:req.params.uuid});
    if(card){
        return res.send({card,success:true});
    }
    return res.send({success:false});
}
exports.getRFIDTransactions = async(req, res) =>{
    const transactions = await Transaction.find({card_id:req.params.uuid});
    return res.send(transactions).status(200);
}

exports.newTransaction = async(req, res)=>{
    try{
      
    const rfid = await RFID.findOne({uuid:req.body.uuid});
    if(!rfid){
        return res.status(404).send({message: 'RFID not found'})
    }
    if(!req.body.transaction_fare){
        return res.status(404).send({message: 'Transaction fare required'})
    }
    if(req.body.type != 'deposit' && (rfid.current_balance < req.body.transaction_fare)){
        return res.status(404).send({message: 'Insufficient balance'});
    }
    if(req.body.type === 'deposit'){
        rfid.current_balance = rfid.current_balance + parseInt(req.body.transaction_fare); 
    }else  rfid.current_balance = rfid.current_balance - parseInt(req.body.transaction_fare);

    const updated = await rfid.save();
        const transaction = new Transaction({
            card_id: updated._id,
            transactions_fare: parseInt(req.body.transaction_fare),
            new_balance: updated.current_balance,
            transaction_type:req.body.type
        })
    
    
    const saved = await transaction.save();
    console.log(saved)
    return res.status(200).send({saved});

}catch(e){return res.send({message:e.message}).status(400)}
}

exports.newCard = async(req, res) =>{
  
    try{
    const no_card = await RFID.findOne({uuid: req.body.uuid});
    if(no_card){
        return res.send({message: 'RFID already exists, can not be duplicated'}).status(400);
    }
    if(!req.body.uuid){
        return res.send({message: 'RFID UUID required'}).status(400);
    }
    if(!req.body.owner){
        return res.send({message: 'Owner required'}).status(400);
    }
    const card = new RFID({
        uuid: req.body.uuid,
        current_balance: parseInt(req.body.current_balance || 0),
        owner: req.body.owner,
    })
    const saved = await card.save();
    return res.send(saved).status(200);
}catch(e){
    return res.send({message:e.message}).status(400);
}
}