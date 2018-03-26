var config = require('comm/script/config')
App({
  globalData: {
    userInfo: null,
    sessionId : null
  },
  onLaunch: function() {
    // 获取用户信息
    this.getUserInfo()
    //初始化缓存
    this.initStorage()
  },
  getUserInfo:function(cb){
    var that = this
    wx.login({
      success: function (response) {
        wx.getStorage({
          key: 'sessionId',
          success: function (res) {
            console.log("获取到session")
            console.log(res.data)
            that.globalData.sessionId = res.data
            that.checkWxLogin(response.code)
          },
          fail: function (res) {
            that.getSession(response.code)
          }
        })

        wx.getUserInfo({
          success: function (res) {
            console.log(res)
            that.globalData.userInfo = res.userInfo
            typeof cb == "function" && cb(that.globalData.userInfo)
          }
        })
      }
    })
  },
  checkWxLogin:function(code){
    var that = this
    //检查是否已经登录,如果没有登录则进行登录
    wx.request({
      url: config.apiList.user.movies,
      method: 'GET',
      data: {},
      header: { 'content-type': 'application/json', 'sessionId': that.globalData.sessionId },
      success: function (res) {
        if(res['statusCode'] === 401) that.getSession(code)
      }
    })
  },
  getSession: function(code){
    console.log("从服务器获取session")
    var that = this
    //获取session的方法
    wx.request({
      url: config.apiList.loginUrl,
      method: 'POST',
      data: {
        code: code
      },
      success: function (res) {
        wx.setStorage({
          key: 'sessionId',
          data: res.data.obj,
        })
        that.globalData.sessionId = res.data.obj
      }
    })
  },
  getCity: function(cb) {
    var that = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        var locationParam = res.latitude + ',' + res.longitude + '1'
        wx.request({
          url: config.apiList.baiduMap,
          data: {
            ak: config.baiduAK,
            location: locationParam,
            output: 'json',
            pois: '1'
          },
          method: 'GET',
          success: function(res){
            config.city = res.data.result.addressComponent.city.slice(0,-1)
            typeof cb == "function" && cb(res.data.result.addressComponent.city.slice(0,-1))
          },
          fail: function(res) {
            config.city = 'unkown'
            typeof cb == "function" && cb('unkown')
            // 重新定位
            //that.getCity();
          }
        })
      }
    })
  },
  initStorage: function() {
    wx.getStorageInfo({
      success: function(res) {
        // 判断电影收藏是否存在，没有则创建
        // if (!('film_favorite' in res.keys)) {
        //   wx.setStorage({
        //     key: 'film_favorite',
        //     data: []
        //   })
        // }
        // 判断人物收藏是否存在，没有则创建
        if (!('person_favorite' in res.keys)) {
          wx.setStorage({
            key: 'person_favorite',
            data: []
          })
        }
        // 判断电影浏览记录是否存在，没有则创建
        if (!('film_history' in res.keys)) {
          wx.setStorage({
            key: 'film_history',
            data: []
          })
        }
        // 判断人物浏览记录是否存在，没有则创建
        if (!('person_history' in res.keys)) {
          wx.setStorage({
            key: 'person_history',
            data: []
          })
        }
        // 个人信息默认数据
        var personInfo = {
          name: '',
          nickName: '',
          gender: '',
          age: '',
          birthday: '',
          constellation: '',
          company: '',
          school: '',
          tel: '',
          email:'',
          intro: ''
        }
        // 判断个人信息是否存在，没有则创建
        if (!('person_info' in res.keys)) {
          wx.setStorage({
            key: 'person_info',
            data: personInfo
          })
        }
        // 判断相册数据是否存在，没有则创建
        // if (!('gallery' in res.keys)) {
        //   wx.setStorage({
        //     key: 'gallery',
        //     data: []
        //   })
        // }
        // 判断背景卡选择数据是否存在，没有则创建
        // if (!('skin' in res.keys)) {
        //   wx.setStorage({
        //     key: 'skin',
        //     data: ''
        //   })
        // }
      }
    })
  }
})