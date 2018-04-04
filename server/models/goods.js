/**
 * Created by Administrator on 2017/10/23.
 */
var mongoose = require('mongoose')
var produtSchema =  new mongoose.Schema({
  'productId': {
    type: String
  },
  'productName': String,
  'salePrice': Number,
  'checked': String,
  'productNum': Number,
  'productImage': String
})

module.exports = mongoose.model('Good', produtSchema)
