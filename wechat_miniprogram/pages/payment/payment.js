Page({
  data: {
    active: 1,
    steps: [
      {
        text: '   step 1',
        desc: '菜篮子确认'
      },
      {
        text: 'step 2',
        desc: ' 结清账'
      },
      {
        text: ' step 3',
        desc: '结算完毕'
      }
    ]
  },

  onLoad: function(options) {
    try {
      const cartList = wx.getStorageSync('cartList');
      if (cartList) {
        const payList = {};
        let totalPriceKRW = 0;
        cartList.forEach(item => {
          if (payList[item.cafeteria_name_ko]) {
            payList[item.cafeteria_name_ko].push(item);
          } else {
            payList[item.cafeteria_name_ko] = [item];
          }
        });
        const showList = Object.keys(payList).map(cafeterium => {
          const showItem = {};
          if (payList[cafeterium].length > 1) {
            showItem.thumb = payList[cafeterium][0].menuImage;
            showItem.cafeterium_name_ch = payList[cafeterium][0].cafeteria_name_ch;
            showItem.cafeterium_name_ko = payList[cafeterium][0].cafeteria_name_ko;
            showItem.title = payList[cafeterium][0].mainDish_ch + " 外 " + (payList[cafeterium].length - 1) + "个";
            [showItem.totalPriceKRW, showItem.totalPriceCNY] = payList[cafeterium].reduce((acc, cur) => {
              return [acc[0] + (cur.quantity * cur.price_krw), acc[1] + (cur.quantity * cur.price_cny)];
            }, [0, 0]);
            totalPriceKRW += showItem.totalPriceKRW;
            showItem.totalPriceCNY = showItem.totalPriceCNY.toFixed(2);
          } else {
            showItem.title = payList[cafeterium][0].mainDish_ch;
            showItem.thumb = payList[cafeterium][0].menuImage;
            showItem.cafeterium_name_ch = payList[cafeterium][0].cafeteria_name_ch;
            showItem.cafeterium_name_ko = payList[cafeterium][0].cafeteria_name_ko;
            [showItem.totalPriceKRW, showItem.totalPriceCNY] = [(payList[cafeterium][0].quantity * payList[cafeterium][0].price_krw), (payList[cafeterium][0].quantity * payList[cafeterium][0].price_cny)];
            totalPriceKRW += showItem.totalPriceKRW;
          }
          return showItem;
        });
        this.setData({
          cartList: cartList,
          showList: showList,
          totalPriceKRW: totalPriceKRW
        });
      } else {
        throw new Error('장바구니 목록 없음');
      }
    } catch (error) {
      console.error(error);
      console.log("장바구니 목록 없음");
      this.setData({
        cartList: []
      });
    }
  },

  pay(event) {
    const {requestUrl} = getApp().globalData;
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: `${requestUrl}/payment`,
            method: 'POST',
            data: {
              code: res.code,
              amount: this.data.totalPriceKRW
            },
            success: (response) => {
              const {openid, result} = response.data;
              wx.requestPayment({...result,
              fail: (event) => {
                wx.request({
                  url: `${requestUrl}/order`,
                  method: 'POST',
                  data: {
                    cartList: this.data.cartList,
                    openid: openid,
                    amount: this.data.totalPriceKRW
                  },
                  success: (response) => {
                    this.data.cartList.forEach(item => {
                      item.ticketNumber = response.data.orderResult[item.cafeteriaId].ticketNumber;
                      item.orderDateTime = response.data.orderResult[item.cafeteriaId].orderDateTime;
                    });
                    try {
                      wx.setStorageSync('orderList', this.data.cartList);
                      wx.removeStorageSync('cartList');
                      wx.navigateTo({
                        url: '/pages/complete/complete',
                      })
                    } catch (error) {
                      console.log("장바구니 remove error");
                    }
                  },
                  fail: (response) => {
                    console.dir(rseponse);
                  }
                })
              }});
            }
          })
        }
      },
      fail: (response) => {
        console.log("로그인 실패: ");
        console.dir(response);
      }
    });
  },

  
  goComplete(){
    wx.navigateTo({
      url: '/pages/complete/complete',
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