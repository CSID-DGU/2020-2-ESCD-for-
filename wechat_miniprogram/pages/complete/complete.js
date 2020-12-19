Page({
  data: {
    active: 2,
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
      const orderList = wx.getStorageSync('orderList');
      wx.removeStorageSync('orderList');
      const orderResult = {};

      orderList.forEach(item => {
        if (orderResult[item.cafeteriaId]) {
          orderResult[item.cafeteriaId].push(item);
        } else {
          orderResult[item.cafeteriaId] = [item];
        }
      });
      const paymentResult = [];
      Object.keys(orderResult).forEach(cafeteriaId => {
        const info = {};
        info.cafeteria_name_ch = orderResult[cafeteriaId][0].cafeteria_name_ch;
        info.cafeteria_name_ko = orderResult[cafeteriaId][0].cafeteria_name_ko;
        info.title = orderResult[cafeteriaId].length > 1 ? 
                      orderResult[cafeteriaId][0].mainDish_ch + ' 外 ' + (orderResult[cafeteriaId].length - 1) + '个' : 
                      orderResult[cafeteriaId][0].mainDish_ch;
        info.thumb = orderResult[cafeteriaId][0].menuImage;
        info.orderDate = orderResult[cafeteriaId][0].orderDateTime;
        [info.price_cny, info.price_kor] = orderResult[cafeteriaId].reduce((acc, cur) => {
          return [acc[0] + (cur.quantity * cur.price_cny), acc[1] + (cur.quantity * cur.price_krw)];
        }, [0, 0]);
        info.price_cny = info.price_cny.toFixed(2);
        info.ticketNumber = orderResult[cafeteriaId][0].ticketNumber;
        paymentResult.push(info);
      });
      console.dir(paymentResult);
      this.setData({
        paymentResult: paymentResult
      });
    } catch (error) {
      console.error(error);
    }
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