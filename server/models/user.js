/**
 * Created by Administrator on 2017/12/20.
 */
var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
  'userId': String,
  'userName': String,
  'userPwd': String,
  'orderList': Array,
  'cartList': [
    {
      "productId":String,
      "productName":String,
      "salePrice":String,
      "productImage":String,
      "checked":String,
      "productNum":String
    }
  ],
  'addressList': [
    {
      'addressId': String,
      'username': String,
      'streetName': String,
      'tel': Number,
      'isDefault': Boolean
    }
  ]
})

module.exports = mongoose.model('User', userSchema)
