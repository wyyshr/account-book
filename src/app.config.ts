export default {
  pages: [
    'pages/account/account',
    'pages/index/index',
    'pages/my/my',
    'pages/home/home',
    'pages/chart_detail/chart_detail',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: "#8a8a8a",
    selectedColor: "#ff8776",
    list: [{
      pagePath: "pages/index/index",
      text: "资产",
      iconPath: "assets/img/money.png",
      selectedIconPath: "assets/img/money_selected.png"
    },{
      pagePath: "pages/account/account",
      text: "记账",
      iconPath: "assets/img/account.png",
      selectedIconPath: "assets/img/account_selected.png"
    },{
      pagePath: "pages/my/my",
      text: "我的",
      iconPath: "assets/img/my.png",
      selectedIconPath: "assets/img/my_selected.png"
    }]
  }
}
