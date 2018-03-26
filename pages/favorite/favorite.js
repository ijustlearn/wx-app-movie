var douban = require('../../comm/script/fetch')
var config = require('../../comm/script/config')
var filmNullTip = {
      tipText: '亲，找不到电影的收藏',
      actionText: '去逛逛',
      routeUrl: '../../pages/popular/popular'
    }
var personNullTip = {
      tipText: '亲，找不到人物的收藏',
      actionText: '去逛逛',
      routeUrl: '../../pages/popular/popular'
    }
Page({
  data:{
    films:[],
    film_favorite: [],
    person_favorite: [],
    show: 'films',
    nullTip: filmNullTip,
    hasMore: true,
    showLoading: true,
    start: 0
  },
  onLoad:function(options){
    var that = this
    // wx.getStorage({
    //   key: 'film_favorite',
    //   success: function(res){
    //     that.setData({
    //       film_favorite: res.data
    //     })
    //   }
    // })
    douban.fetchFilms.call(that, config.apiList.user.movies, that.data.start)
    wx.getStorage({
      key: 'person_favorite',
      success: function(res){
        that.setData({
          person_favorite: res.data
        })
      }
    })
    wx.stopPullDownRefresh()
  },
  onPullDownRefresh: function () {
    var that = this
    that.setData({
      films: [],
      hasMore: true,
      showLoading: true,
      start: 0
    })
    douban.fetchFilms.call(that, config.apiList.user.movies, that.data.start)
  },
  onReachBottom: function () {
    var that = this
    if (!that.data.showLoading) {
      douban.fetchFilms.call(that, config.apiList.user.movies, that.data.start)
    }
  },
  viewFilmDetail: function(e) {
		var data = e.currentTarget.dataset
		wx.redirectTo({
			url: "../filmDetail/filmDetail?id=" + data.id
		})
  },
  viewPersonDetail: function(e) {
		var data = e.currentTarget.dataset
		wx.redirectTo({
			url: "../personDetail/personDetail?id=" + data.id
		})
  },
  changeViewType: function(e) {
    var data = e.currentTarget.dataset
    this.setData({
      show: data.type,
      nullTip: data.type == 'films' ? filmNullTip : personNullTip
    })
  }
})