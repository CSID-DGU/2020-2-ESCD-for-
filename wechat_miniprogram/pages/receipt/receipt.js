// pages/menu/menu.js
var app = getApp()

Page({

  /**
   * Page initial data
   * 이 페이지에 사용될 정보를 초기화
   */
  data: {
    buttonText : "나의 정보 가져오기",
    userInfo : null,
    btnSize:'default',
    disabled:false,
    plain:false,
    loading:false,
    isReady: false,
  },

  /**
   * Lifecycle function--Called when page load
   * 이 페이지가 처음 실행될 때 불러지는 함수
   */
  onLoad: function () {
    const {requestUrl} = getApp().globalData;
    wx.login({
      success: (res) => {
        // 위챗 로그인 증명서를 받은 후, 자신의 서버에 가서 자신의 로그인 증명서를 교환한다.
        console.dir(res);
        wx.request({
          url: `${requestUrl}/auth`,
          method: "POST",
          data: { code: res.code },
          success: (res) => {
            console.dir("login success: ");
            console.dir(res);

            const {openid} = res.data;
            wx.request({
              url: `${requestUrl}/order/${openid}`,
              method: 'GET',
              success: (res) => {
                const orderList = [];
                Object.keys(res.data).reverse().forEach(orderNumber => {
                  const orderItem = {};
                  if (res.data[orderNumber].length > 1) {
                    orderItem.mealTicketNumber = res.data[orderNumber][0].meal_ticket_number;
                    orderItem.orderNumber = orderNumber;
                    orderItem.cafeteria_name_ko = res.data[orderNumber][0].cafeteria_name_ko;
                    orderItem.cafeteria_name_ch = res.data[orderNumber][0].cafeteria_name_ch;
                    orderItem.orderDate = res.data[orderNumber][0].order_date;
                    orderItem.isReceived = res.data[orderNumber][0].is_received;
                    orderItem.menuImage = res.data[orderNumber][0].menu_img;
                    orderItem.openId = res.data[orderNumber][0].order_user_id;
                    orderItem.title = res.data[orderNumber][0].name_ch + " 外 " + (res.data[orderNumber].length - 1) + "个";
                    [orderItem.totalPriceKRW, orderItem.totalPriceCNY] = res.data[orderNumber].reduce((acc, cur) => {
                      return [acc[0] + (cur.quantity * cur.price_krw), acc[1] + (cur.quantity * cur.price_cny)];
                    }, [0, 0]);
                    orderItem.totalPriceCNY = orderItem.totalPriceCNY.toFixed(2);
                  } else {
                    orderItem.mealTicketNumber = res.data[orderNumber][0].meal_ticket_number;
                    orderItem.orderNumber = orderNumber;
                    orderItem.menuImage = res.data[orderNumber][0].menu_img;
                    orderItem.cafeteria_name_ko = res.data[orderNumber][0].cafeteria_name_ko;
                    orderItem.cafeteria_name_ch = res.data[orderNumber][0].cafeteria_name_ch;
                    orderItem.orderDate = res.data[orderNumber][0].order_date;
                    orderItem.isReceived = res.data[orderNumber][0].is_received;
                    orderItem.openId = res.data[orderNumber][0].order_user_id;
                    orderItem.title = res.data[orderNumber][0].name_ch;
                    orderItem.totalPriceKRW = res.data[orderNumber][0].price_krw;
                    orderItem.totalPriceCNY = res.data[orderNumber][0].price_cny;
                  }
                  orderList.push(orderItem);
                })
                console.dir(orderList);
                this.setData({
                  orderList: orderList,
                  isReady: true
                });
              },
              fail: function (error) {
                wx.reLaunch({
                  url: '/pages/index/index',
                });
              }
            })
          }
        });
      },
      fail: function (error) {
        wx.reLaunch({
          url: '/pages/index/index',
        });
      }
    });
  },

  myGetFunc:function(e){
    //console.log(e);
    this.setData({
      userInfo:e.detail.userInfo
    })
  },

  goOrderDetail: function (event) {
    const {orderNumber} = event.currentTarget.dataset;
    console.log(orderNumber);
    wx.navigateTo({
      url: `/pages/orderdetail/orderdetail?orderNumber=${orderNumber}`,
    });
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {
    console.log("app:onReady()")
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
    console.log("app:onShow()")
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {
    console.log("app:onHide()")
  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {
    console.log("app:onUnload()")
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  },
  goBack: function(event){
    wx.navigateBack({
      delta:2
    })
  },

  goHome(){
    wx.reLaunch({
      url: '/pages/index/index',
    })
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