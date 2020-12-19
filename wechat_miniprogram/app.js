//app.js
App({
  onShow: function(){
  },
  onHide: function(){
  },
  onError: function(){
  },
  onLaunch: function (options) {

    // var sessionId = wx.getStorageSync('SESSIONID')

    // var expiredTime = wx.getStorageSync('EXPIREDTIME')

    // var now = +new Date()

    // if (now - expiredTime <= 1 * 24 * 60 * 60 * 1000) {

    //   this.globalData.sessionId = sessionId

    //   this.globalData.expiredTime = expiredTime

    // }

  },

  globalData: {
    requestUrl: 'http://localhost:8005/api/wechat',
    sessionId: null,
    expiredTime: 0

  },
  
  onLaunch: function () {
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
  },

  formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  }

})