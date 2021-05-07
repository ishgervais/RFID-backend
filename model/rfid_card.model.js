const mongoose = require("mongoose");
const RFID_Schema = new mongoose.Schema(
  {
    uuid: { 
        type: String,
        required: true,
        unique: true,
    },
    Owner: {
      type: String,
      required:false
    },
    current_balance: {
      type: Number,
      required: true
    }
  },
);
const Transaction_Schema = new mongoose.Schema(
    {
      card_id: {
          type: mongoose.Schema.ObjectId,
          ref:"RFID",
          required: true,
      },
      transactions_fare: {
        type: Number,
        required: true
      },
      new_balance: {
        type: Number,
        required: true
      }
    },
    {
        timestamps: true,
    },
    {
      toJSON:{
        virtuals:true
      },
      toVirtual:{
        virtuals:true
      }
    }
  );

  Transaction_Schema.virtual("transactions",{
    ref:"RFID",
    localField:"card_id",
    foreignField:"_id",
    justOne:false
});


  exports.RFID = mongoose.model("RFID", RFID_Schema);
exports.Transaction = mongoose.model("Transaction", Transaction_Schema);
