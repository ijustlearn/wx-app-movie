var douban = require('../../comm/script/fetch')
var util = require('../../util/util')
var config = require('../../comm/script/config')
Page({
  data: {
    filmDetail: {},
    showLoading: true,
    showContent: false,
    dialogShow: false,
    loginShow: false,
    loginLoad: false,
    allowChange: false,// 允许绑定 防止重复提交
    ThunkerAccount: '',
    ThunkerPassword: '',
  },
  onLoad: function (options) {
    var that = this
    var id = options.id
    douban.fetchFilmDetail.call(that, config.apiList.filmDetail, id, function (data) {
      /// 判断是否收藏
      that.hasFilmFavorite()
      // wx.getStorage({
      // key: 'film_favorite',
      // 	success: function(res){
      // 		for (var i = 0; i < res.data.length; i++) {
      // 			if (res.data[i].id == data.id) {
      // 				that.setData({
      // 					isFilmFavorite: true
      // 				})
      // 			}
      // 		}
      // 	}
      // })
      // 存储浏览历史
      var date = util.getDate()
      var time = util.getTime()
      var film_history = []
      console.log('----进入----')
      wx.getStorage({
        key: 'film_history',
        success: function (res) {
          film_history = res.data
          console.log('----获取缓存----')
          console.log(res.data)
          // 当前的数据
          var now_data = {
            time: time,
            data: data
          }
          // 今天的数据，没有时插入
          var sub_data = {
            date: date,
            films: []
          }
          sub_data.films.push(now_data)
          if (film_history.length == 0) { // 判断是否为空
            console.log('----为空插入----')
            film_history.push(sub_data)
          } else if ((film_history[0].date = date)) { //判断第一个是否为今天
            console.log('----今日插入----')
            console.log(film_history[0].films.length)
            for (var i = 0; i < film_history[0].films.length; i++) {
              // 如果存在则删除，添加最新的
              if (film_history[0].films[i].data.id == data.id) {
                film_history[0].films.splice(i, 1)
              }
            }
            film_history[0].films.push(now_data)
          } else { // 不为今天(昨天)插入今天的数据
            console.log('----昨日插入今日----')
            film_history.push(sub_data)
          }
          wx.setStorage({
            key: 'film_history',
            data: film_history,
            success: function (res) {
              console.log(res)
              console.log('----设置成功----')
            }
          })
          console.log(film_history)
        },
        fail: function (res) {
          console.log('----获取失败----')
          console.log(res)
        }
      })
    })
  },
  viewPersonDetail: function (e) {
    var data = e.currentTarget.dataset;
    wx.redirectTo({
      url: '../personDetail/personDetail?id=' + data.id
    })
  },
  viewFilmByTag: function (e) {
    var data = e.currentTarget.dataset
    var keyword = data.tag
    wx.redirectTo({
      url: '../searchResult/searchResult?url=' + encodeURIComponent(config.apiList.search.byTag) + '&keyword=' + keyword
    })
  },
  onPullDownRefresh: function () {
    var data = {
      id: this.data.filmDetail.id
    }
    this.onLoad(data)
  },
  // 下载 || 绑定迅雷账号 弹窗
  showDownItem(e) {
    let that = this
    let data = e.currentTarget.dataset
    let keyword = data.tag
    douban.selfRequest({
      url: config.apiList.isThunkerLogin,
      data: {},
      success(res) {
        console.log(res)
        if (res.data.result === 200) {
          let _obj = res.data.obj;
          if (_obj) {
            that.setData({
              dialogShow: true,
              downUrl: keyword
            })
          } else {
            that.setData({
              loginShow: true,
              downUrl: keyword
            })
          }
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
        }
      },
      method: 'GET',
      error(err) {
        console.log(err)
      }
    })
  },
  // 下载弹窗隐藏
  cancelDownItem() {
    this.setData({
      dialogShow: false
    })
  },
  // 下载--下载
  downloadFn() {
    let that = this
    let _downUrl = this.data.downUrl
    douban.selfRequest({
      url: config.apiList.addThunkerTask,
      data: {
        url: _downUrl
      },
      success(res) {
        if (res.data.result === 200) {
          wx.showToast({
            title: '添加成功',
            icon: 'none',
            duration: 1000
          })
          that.cancelDownItem()
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      },
      method: 'POST',
      error(err) {
        console.log(err)
      }
    })
  },
  // 下载--复制下载链接
  copyFn() {
    let _downUrl = this.data.downUrl
    // 设置剪切板内容
    wx.setClipboardData({
      data: _downUrl,
      success: function (res) {
        console.log(res)
        // 获取剪切板内容
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data)
          }
        })
      }
    })
  },
  // 远程查看是否已经收藏
  hasFilmFavorite: function () {
    var that = this
    douban.selfRequest({
      url: config.apiList.user.checkFilmUrl,
      data: {
        movieId: that.data.filmDetail.id
      },
      success: function (res) {
        //设置是否收藏
        that.setData({
          isFilmFavorite: res.data.obj
        })
      }
    })
  },
  //更改收藏状态
  changeFilmStatus: function () {
    var that = this
    douban.selfRequest({
      url: config.apiList.user.changeFilmStatusUrl,
      data: {
        movieId: that.data.filmDetail.id
      },
      success: function (res) {
        var currentStatus = that.data.isFilmFavorite == true ? false : true
        that.setData({
          isFilmFavorite: currentStatus
        })
      }
    })
  },
  // 迅雷账号输入框绑定data数据
  ThunkerAccount(e) {
    this.setData({
      ThunkerAccount: e.detail.value
    })
  },
  // 迅雷密码输入框绑定data数据
  ThunkerPW(e) {
    this.setData({
      ThunkerPassword: e.detail.value
    })
  },
  // 清空迅雷账号密码
  clearThunkerAccount(e) {
    this.setData({
      ThunkerAccount: '',
      ThunkerPassword: ''
    })
  },
  // 账号绑定取消
  cancelLogin() {
    this.setData({
      loginShow: false,
      ThunkerAccount: '',
      ThunkerPassword: ''
    })
  },
  // 绑定迅雷账号
  loginThunker() {
    let that = this
    if (!this.data.ThunkerAccount) {
      wx.showToast({
        title: '请输入迅雷账号',
        icon: 'none',
        duration: 1000
      })
      return
    }
    if (!this.data.ThunkerPassword) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none',
        duration: 1000
      })
      return
    }
    this.setData({
      loginLoad: true,
      allowChange: true
    })
    if (this.data.allowChange) {
      douban.selfRequest({
        url: config.apiList.ThunkerLogin,
        data: {
          userXunleiAccount: this.data.ThunkerAccount,
          userXunleiPassword: this.data.ThunkerPassword
        },
        success(res) {
          console.log(res)
          if (res.data.result === 200) {
            that.cancelLogin()
            that.setData({
              loginLoad: false,
              allowChange: false
            })
            wx.showToast({
              title: '绑定成功',
              icon: 'none',
              duration: 1000
            })
          } else {
            wx.showToast({
              title: '绑定失败，请检查账号',
              icon: 'none',
              duration: 1500
            })
            that.setData({
              loginLoad: false,
              allowChange: false
            })
          }
        },
        method: 'POST',
        error(err) {
          console.log(err)
        }
      })
    }
  },
})