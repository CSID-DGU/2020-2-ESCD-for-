//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    active: 0,
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
      wx.removeStorageSync('cntOfCart');
      const curDate = new Date();
      const dateStr = getApp().formatDate(curDate);
      let cartList = wx.getStorageSync('cartList');
      cartList = cartList.filter(item => item.salesDate === dateStr);
      wx.setStorageSync("cartList", cartList);
      console.dir(cartList);
      this.setData({
        cartList: cartList
      });
    } catch (error) {
      console.error(error);
      this.setData({
        cartList: []
      });
    }
  }, 

  stepperChange(event) {
    const menuId = event.currentTarget.dataset.menuId;
    const index = this.data.cartList.findIndex(menu => menu.menuId === menuId);
    this.data.cartList[index] = {...this.data.cartList[index], quantity: event.detail};
    try {
      wx.setStorageSync('cartList', this.data.cartList);
    } catch (error) {
      console.log("에러 발생: ");
      console.error(error);
    }
  },

  goPayment(){
    wx.navigateTo({
      url: '/pages/payment/payment',
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

  onDelete(event) {
    const {menuId} = event.currentTarget.dataset;
    let cartList = this.data.cartList;
    console.log(menuId);
    try {
      cartList = cartList.filter(item => item.menuId !== menuId);
      this.setData({
        cartList: cartList
      });
      wx.setStorageSync('cartList', cartList);
    } catch (error) {
      console.error(error);
    }
  }
  
})
