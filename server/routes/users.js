/**
 * Created by Administrator on 2017/12/22.
 */
var express = require('express')
var router = express.Router()
require('./../util/util')
var User = require('./../models/user')

router.post('/login', function (req, res, next) {
  var param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  User.findOne(param, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      if (doc) {
        res.cookie('userId', doc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60
        })
        res.cookie('userName', doc.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60
        })
        //req.session.user = doc;
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      }
    }
  })
})
router.post('/logout', function (req, res, next) {
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  })
  res.json({
    status: 0,
    msg: '',
    result: ''
  })
})

router.get('/getCartCount', function (req, res, next) {
  if (req.cookies && req.cookies.userId) {
    console.log('userId: ' + req.cookies.userId)
    var userId = req.cookies.userId
    User.findOne({'userId': userId}, function (err, doc) {
      if (err) {
        res.json({
          status: '0',
          msg: err.message
        })
      } else {
        let cartList = doc.cartList
        let cartCount = 0
        cartList.map(function (item) {
          cartCount += parseFloat(item.productNum)
        })
        res.json({
          status: '0',
          mgs: '',
          result: cartCount
        })
      }
    })
  }
})
//全选操作
router.post('/editCheckAll', function (req, res, next) {
  var userId = req.cookies.userId
  var checkAll = req.body.checkAll ? '1' : '0'
  User.findOne({userId: userId}, function (err, user) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (user) {
        user.cartList.forEach(item => {
          item.checked = checkAll
        })
        user.save(function (err1, doc) {
          if (err1) {
            res.json({
              status: '1',
              msg: err1, message,
              result: ''
            })
          } else {
            res.json({
              status: '0',
              msg: '',
              result: 'suc'
            })
          }
        })
      }
    }
  })
})

router.get('/cartList', function (req, res, next) {
  var userId = req.cookies.userId
  User.findOne({userId: userId}, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList
        })
      }
    }
  })
})

//修改商品数量 ++--操作
router.post('/cartEdit', function (req, res, next) {
  var userId = req.cookies.userId,
    productId = req.body.productId,
    productNum = req.body.productNum,
    checked = req.body.checked
  User.update({'userId': userId, 'cartList.productId': productId}, {
    'cartList.$.productNum': productNum,
    'cartList.$.checked': checked
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: 'suc'
      })
    }
  })
})

//购物车删除
router.post('/cartDel', function (req, res, next) {
  var userId = req.cookie.userId, productId = req.body.productId;

})

//获取地址
router.get('/addressList', function (req, res, next) {
  var userId = req.cookies.userId
  User.findOne({userId: userId}, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: doc.addressList
      })
    }
  })
})

router.post('/setDefault', function (req, res, next) {
  var userId = req.cookies.userId
  var addressId = req.body.addressId
  if (!addressId) {
    res.json({
      status: '1003',
      msg: 'addressId is null',
      result: ''
    })
  } else {
    User.findOne({userId: userId}, function (err, doc) {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      } else {
        var addressList = doc.addressList
        addressList.forEach(item => {
          if (item.addressId == addressId) {
            item.isDefault = true
          } else {
            item.isDefault = false
          }
        })

        doc.save(function (err1, doc1) {
          if (err1) {
            res.json({
              status: '1',
              msg: err.message,
              result: ''
            })
          } else {
            res.json({
              status: '0',
              msg: '',
              result: ''
            })
          }
        })
      }
    })
  }
})
//付款
router.post('/payMent', function (req, res, next) {
  var userId = req.cookies.userId
  var addressId = req.body.addressId
  var orderTotal = req.body.orderTotal
  User.findOne({userId: userId}, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      var address = '', goodsList = []
      doc.addressList.forEach(item => {
        if (item.addressId == addressId) {
          address = item
        }
      })

      doc.cartList.filter(item => {
        if (item.checked == '1') {
          goodsList.push(item)
        }
      })

      var platform = '622'
      var r1 = Math.floor(Math.random() * 10)
      var r2 = Math.floor(Math.random() * 10)

      var sysDate = new Date().Format('yyyyMMddhhmmss')
      var createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
      var orderId = platform + r1 + sysDate + r2
      var order = {
        orderId: orderId,
        orderTotal: orderTotal, // 总价
        addressInfo: address, // 地址信息
        goodsList: goodsList, //购买的商品
        orderStatus: '1',
        createDate: createDate
      }

      doc.orderList.push(order)
      doc.save(function (err1, doc1) {
        if(err1){
          res.json({
            status:"1",
            msg:err.message,
            result:''
          });
        }else{
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: order.orderId,
              orderTotal: order.orderTotal
            }
          })
        }
      })
    }
  })
})

module.exports = router