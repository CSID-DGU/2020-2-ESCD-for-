//index.js
Page({
  data:{
    map_url: '/resource/image/caf1.png',
    url_num:'0',
    isShow: false,
    map_array: [
      '/resource/image/caf1.png',
      '/resource/image/caf2.png',
    ],
    mode: 'scaleToFill',
    cafeteria: [
      {
        icon: "/static/icon/cook.svg",
        name_kor: "가든쿡",
        name_cny: "花园厨师"
      },
      {
        icon: "/static/icon/dinner.svg",
        name_kor: "팬앤누들",
        name_cny: "锅和面"
      },
      {
        icon: "/static/icon/cook2.svg",
        name_kor: "그루터가",
        name_cny: "存根"
      },
      {
        icon: "/static/icon/noodle.svg",
        name_kor: "신공학관",
        name_cny: "新工程大楼"
      },
      {
        icon: "/static/icon/meat.svg",
        name_kor: "상록원",
        name_cny: "常绿"
      },
      {
        icon: "/static/icon/more.svg",
        name_kor: "전체보기",
        name_cny: "查看全部"
      }
    ]
  },

  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  goToMenu: function (event) {
    wx.navigateTo({
      url: '/pages/menu/menu',
    })
  },

  onShow: function() {
    try {
      const cntOfCart = wx.getStorageSync('cntOfCart');
      if (cntOfCart >= 1) {
        this.setData({
          cntOfCart: cntOfCart
        });
      } else {
        this.setData({
          cntOfCart: null
        })
      }
    } catch (error) {
      console.error(error);
    }
  },

  changeMapUrl_0 : function(e){
    this.setData({
      map_url: '/resource/image/caf1.png'
    })
  },
  changeMapUrl_1 : function(e){
    this.setData({
      map_url: '/resource/image/caf2.png'
    })
  },

  navigateToCafeterium: function (event) {
    const {nameKor, nameCny} = event.currentTarget.dataset;
    console.log(event.currentTarget.dataset);
    wx.navigateTo({
      url: `/pages/cafeteria/cafeteria?nameKor=${nameKor}&nameCny=${nameCny}`
    });
  },

  onSubscribe(e) {
    wx.requestSubscribeMessage({
      tmplIds: ['iaLbIzKnYfX8g8Ek03J3EgXyk8cbhJthYYylRYRpCMU'],
      success: (rse) => {
      },
      fail: (error) => {
      }
    });
  },

  goReceipt(){
    wx.reLaunch({
      url: '/pages/receipt/receipt',
    })
  },

  goCart(){
    wx.reLaunch({
      url: '/pages/cart/cart',
    })
  }

})
