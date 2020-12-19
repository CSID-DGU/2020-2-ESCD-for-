Page({

  data: {
    isReady: false
  },

  onLoad: function (options) {
    const {requestUrl} = getApp().globalData;
    const {orderNumber} = options;
    console.dir(options);
    wx.login({
      success: (res) => {
        wx.request({
          url: `${requestUrl}/auth`,
          method: "POST",
          data: {
           code:  res.code
          },
          success: (res) => {
            const {openid} = res.data;
            wx.request({
              url: `${requestUrl}/order/detail/${orderNumber}?openid=${openid}`,
              method: 'GET',
              success: (res) => {
                let totalPriceKor = 0, totalPriceCny = 0;
                const orderDetails = res.data.result.map(od => {
                  totalPriceKor += (od.price_krw * od.quantity);
                  totalPriceCny += (od.price_cny * od.quantity);
                  return ({
                  ticketNumber: od.meal_ticket_number,
                  cafeteriaNameKor: od.cafeteria_name_ko,
                  cafeteriaNameCny: od.cafeteria_name_ch,
                  menuNameKor: od.name_ko,
                  menuNameCny: od.name_ch,
                  quantity: od.quantity,
                  isReceived: od.is_received,
                  menuImage: od.menu_img,
                  orderDate: od.order_date,
                  priceKor: od.price_krw,
                  priceCny: od.price_cny,
                });
                });
                totalPriceCny = totalPriceCny.toFixed(2);
                console.log("orderDetails: ");
                console.dir(orderDetails);
                this.setData({
                  resultMessage: orderDetails[0].isReceived === 0 ? '正在烹饪' : orderDetails[0].isReceived === 1 ? '已收到' : '取消订单',
                  orderDetails: orderDetails,
                  totalPriceKor: totalPriceKor,
                  totalPriceCny: totalPriceCny,
                  isReady: true
                });
              },
              fail: (error) => {
                throw new Error(error.message);
              }
            })
          },
          fail: (error) => {
            throw new Error(error.message);
          }
        })
      },
      fail: (error) => {  // login failed
        console.dir(error);
      }
    })
    // wx.request({
    //   url: `${requestUrl}/auth`,
    //   method: "POST",
    //   data: code
    // })
  },

  goPaymentNow: function (event) {
    wx.navigateTo({
      url: '/pages/paymentNow/paymentNow',
    })
  },

  returnCafeteria: function (event) {
    wx.navigateBack()
  },

  goHome(){
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  goMenu(){
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