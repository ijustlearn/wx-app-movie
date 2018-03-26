var config = require('./config.js')
var message = require('../../component/message/message')

// 获取电影列表
function fetchFilms(url, start, count, cb, fail_cb) {
  console.log("进入获取电影列表方法")
  console.log(url)
  var that = this
  console.log(that)
  message.hide.call(that)
  let sessionId = wx.getStorageSync('sessionId')
  if (sessionId != "" && sessionId != null) {
    var header = { 'content-type': 'application/json', 'sessionId': sessionId };
  } else {
    var header = { 'content-type': 'application/json' };
  }
  if (that.data.hasMore) {
    wx.request({
      url: url,
      data: {
        city: config.city,
        pageNum: start+1,
        count: config.count
      },
      method: 'GET', 
      header: header,
      success: function(res){
        console.log(res.data)
        if (res.data.obj.list.length === 0){
          that.setData({
            hasMore: false,
          })
        }else{
          that.setData({
            films: that.data.films.concat(res.data.obj.list),
            start: that.data.start + 1,
            showLoading: false
          })
          console.log(that.data.start);
        }
        wx.stopPullDownRefresh()
        typeof cb == 'function' && cb(res.data)
      },
      fail: function() {
        that.setData({
            showLoading: false
        })
        message.show.call(that,{
          content: '网络开小差了',
          icon: 'offline',
          duration: 3000
        })
        wx.stopPullDownRefresh()
        typeof fail_cb == 'function' && fail_cb()
      }
    })
  }
}

// 获取电影详情
function fetchFilmDetail(url, id, cb) {
  var that = this;
  message.hide.call(that)
  wx.request({
    url: url + id,
    method: 'GET',
    header: {
      "Content-Type": "application/json"
    },
    success: function(res){
      that.setData({
        filmDetail: res.data.obj,
        showLoading: false,
        showContent: true
      })
      wx.setNavigationBarTitle({
        title: res.data.obj.movieName
      })
      wx.stopPullDownRefresh()
      typeof cb == 'function' && cb(res.data)
    },
    fail: function() {
      that.setData({
          showLoading: false
      })
      message.show.call(that,{
        content: '网络开小差了',
        icon: 'offline',
        duration: 3000
      })
    }
  })
}

// 获取人物详情
function fetchPersonDetail(url, id, cb) {
  var that = this;
  message.hide.call(that)
  wx.request({
    url: url + id,
    method: 'GET', 
    header: {
      "Content-Type": "application/json"
    },
    success: function(res){
      that.setData({
        personDetail: res.data,
        showLoading: false,
        showContent: true
      })
      wx.setNavigationBarTitle({
          title: res.data.name
      })
      wx.stopPullDownRefresh()
      typeof cb == 'function' && cb(res.data)
    },
    fail: function() {
      that.setData({
          showLoading: false
      })
      message.show.call(that,{
        content: '网络开小差了',
        icon: 'offline',
        duration: 3000
      })
    }
  })
}

// 搜索（关键词或者类型）
function search(url, keyword, start, count, cb){
  var that = this
  message.hide.call(that)
  var url = decodeURIComponent(url)
  if (that.data.hasMore) {
    wx.request({
      url: url + keyword,
      data: {
        start: start,
        count: count
      },
      method: 'GET',
      header: {
        "Content-Type": "application/json"
      },
      success: function(res){
        if(res.data.subjects.length === 0){
          that.setData({
            hasMore: false,
            showLoading: false
          })
        }else{
          that.setData({
            films: that.data.films.concat(res.data.subjects),
            start: that.data.start + res.data.subjects.length,
            showLoading: false
          })
          wx.setNavigationBarTitle({
              title: keyword
          })
        }
        wx.stopPullDownRefresh()
        typeof cb == 'function' && cb(res.data)
      },
      fail: function() {
        that.setData({
            showLoading: false
        })
        message.show.call(that,{
          content: '网络开小差了',
          icon: 'offline',
          duration: 3000
        })
      }
    })
  }
}

//  公用请求方法
function selfRequest({ url, data, success, method = "GET" ,fail}) {
  console.log("自定义的请求方法")
  //let server = 'https://xxx.xxxxxxxx.cn';//正式域名
  // let server = 'http://dxxx.xxxxxxxxxx.cn';//测试域名
  // 本地取存储的 sessionID
  let sessionId = wx.getStorageSync('sessionId'),
    that = this;

  if (sessionId != "" && sessionId != null) {
    var header = { 'content-type': 'application/json', 'sessionId':  sessionId };
  } else {
    var header = { 'content-type': 'application/json' };
  }
  wx.request({
    url: url,
    method: method,
    data: data,
    header: header,
    success: (res) => {
      success(res);
    },
    fail: function (res) {
      wx.hideLoading();
      wx.showToast({
        title: '请求超时',
        icon: 'loading',
        duration: 2000
      })
    },
    complete: function () {
      wx.hideLoading();
    }
  });
}
module.exports = {
  fetchFilms: fetchFilms,
  fetchFilmDetail: fetchFilmDetail,
  fetchPersonDetail: fetchPersonDetail,
  search: search,
  selfRequest:selfRequest
}