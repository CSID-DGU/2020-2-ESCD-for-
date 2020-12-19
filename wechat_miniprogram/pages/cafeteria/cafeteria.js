// pages/cafeteria/cafeteria.js
Page({
  data: {
    btnSize: 'default',
    disabled: false,
    plain: false,
    loading: false,
    isReady: false
  },

  onLoad: function(options) {
    const that = this;
    this.setData({
      cafeteriaNameCny: options.nameCny,
      cafeteriaNameKor: options.nameKor
    });
    const {nameKor: cafeteriaName} = options;
    const {requestUrl} = getApp().globalData;
    let dateObj = new Date();
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const date = (dateObj.getDate() + "").length === 1 ? "0" + dateObj.getDate() : dateObj.getDate();
    const currentHour = dateObj.getHours();
    const timeClassification = currentHour < 15 ? '점심' : '저녁';
    console.log("currenHour: " + currentHour);
    console.dir(timeClassification);

    wx.request({
      url: `${requestUrl}/menu?cafeteriaName=${cafeteriaName}&date=${year}-${month}-${date}&timeClassification=${timeClassification}`,
      method: "GET",
      success: (response) => {
        if (!response.data.errors) {
          const menuOfCafeteria = response.data.cafeteria.map(cafeteriaInfo => {
            return {
              cafeteriaId: cafeteriaInfo.cafeteria_id,
              name: cafeteriaInfo.name_ch,
              location: cafeteriaInfo.location,
              businessStatus: cafeteriaInfo.business_status,
              menuList: cafeteriaInfo.Menus.map(menu => ({
                menuId: menu.menu_id,
                menuImage: menu.menu_img,
                mainDish: {mainDishId: menu.MainDish.id, mainDishName: menu.MainDish.name_ch},
                sideDishes: menu.SideDishes.map(sideDish => ({sideDishId: sideDish.id, name: sideDish.name_ch})),
                price_cny: menu.price_cny,
                price_krw: menu.price_krw,
                salesDate: getApp().formatDate(menu.sales_date),
                timeClassification: menu.time_classification,
              })),
            }
          });
          that.setData({
            menuOfCafeteria: menuOfCafeteria,
            isReady: true
          });
        };
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

  navigateToDetail: function(event) {
    const {id: menuId} = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?menuId=${menuId}`,
    });
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