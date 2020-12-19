import Dialog from '/../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({

  data: {
    mode: 'scaleToFill', 
    isReady: false,
  },

  onLoad: function (options) {
    const {menuId} = options;
    console.log("menuId: " + menuId);
    this.setData({
      menuId: menuId
    });

    const {requestUrl} = getApp().globalData;
    wx.request({
      url: `${requestUrl}/menu/${menuId}`,
      method: "GET",
      success: (response) => {
        console.log("response: ");
        console.dir(response.data);
        const result = {
          menuId: response.data.menu.menu_id,
          menuImage: response.data.menu.menu_img,
          mainDish_kor: response.data.menu.MainDish.name_ko,
          mainDish_ch: response.data.menu.MainDish.name_ch,
          sideDishes: response.data.menu.SideDishes.map(sideDish => sideDish.name_ch).join(', '),
          price_cny: response.data.menu.price_cny,
          price_krw: response.data.menu.price_krw,
          salesDate: getApp().formatDate(response.data.menu.sales_date),
          cafeteriaId: response.data.menu.Cafeterium.cafeteria_id,
          cafeteria_name_ko: response.data.menu.Cafeterium.cafeteria_name_ko,
          cafeteria_name_ch: response.data.menu.Cafeterium.cafeteria_name_ch,
        };
        console.dir(result);
        this.setData({
          menu: result,
          isReady: true
        })
      }
    });
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

  addToCart: function (event) {
    console.log("this.data.menu: ");
    console.dir(this.data.menu);
    wx.getStorage({
      key: 'cartList',
      success: (res) => {
        const cartList = res.data;
        const menuIndex = cartList.findIndex(menu => menu.menuId === this.data.menu.menuId);
        if (menuIndex !== -1) {
          cartList[menuIndex] = {...cartList[menuIndex], quantity: cartList[menuIndex].quantity + 1};
          try {
            console.log("cartList: ");
            console.dir(cartList);
            wx.setStorageSync('cartList', cartList);
            wx.setStorageSync('cntOfCart', cartList.length);
            wx.navigateBack({
              delta: 1
            });
          } catch (error) {
            console.error(error);
            Dialog.alert({
              title: '添加购物车失败',  // 장바구니 담기 실패
              message: '请再试一次.',  // 다시 시도해주세요.
            }).then(() => {
              // on close
            });
          }
          
        } else {
          console.log("새로운 메뉴 저장");
          cartList.push({...this.data.menu, quantity: 1});
          try {
            wx.setStorageSync('cartList', cartList);
            wx.setStorageSync('cntOfCart', cartList.length);
            wx.navigateBack({
              delta: 1
            });
          } catch (error) {
            console.error(error);
            Dialog.alert({
              title: '添加购物车失败',  // 장바구니 담기 실패
              message: '请再试一次.',  // 다시 시도해주세요.
            }).then(() => {
              // on close
            });
          }
        }
      },
      fail: (error) => {  // 장바구니 내역이 없을 경우
        try {
          wx.setStorageSync('cartList', [{...this.data.menu, quantity: 1}]);
          wx.setStorageSync('cntOfCart', 1);
          wx.navigateBack({
            delta: 2
          });
        } catch (error) {
          Dialog.alert({
            title: '添加购物车失败',  // 장바구니 담기 실패
            message: '请再试一次.',  // 다시 시도해주세요.
          }).then(() => {
            // on close
          });
        }
      }
    });
  },

  returnCafeteria: function (event) {
    wx.navigateBack()
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