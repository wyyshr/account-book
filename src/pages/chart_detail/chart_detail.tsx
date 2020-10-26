import * as React from 'react';
import { View,Text } from '@tarojs/components';
import Taro from '@tarojs/taro'
import { AtTabBar, AtCurtain, AtButton, AtDrawer }  from 'taro-ui'
import { ajax } from "../../util/ajax";
import { request_url } from "../../util/config";
import './chart_detail.scss'
export interface ChartDetailProps {
  
}
 
export interface ChartDetailState {
  come_type: number
  monthPayArr: Array<{
    month: number
    outCome: number
    inCome: number
  }>
  maxMonthOutcome: number
  maxMonthIncome: number
  isOpened: boolean
  chartDetailMsg: {
    month: number,
    outCome: number,
    inCome: number
  }
  isChoosePayTypeShow: boolean
  choose_pay_type: string
  userInfo: {} | unknown
  monthPay: {
    outCome: number
    inCome: number
  }
  payNum: number
}
type AllMonthPayReqType = Array<{
  month: string
  outCome: number
  inCome: number
}>
 
class ChartDetail extends React.Component<ChartDetailProps, ChartDetailState> {
  constructor(props: ChartDetailProps) {
    super(props);
    this.state = {
      come_type: 0,
      monthPayArr: [],
      maxMonthOutcome: 0,
      maxMonthIncome: 0,
      isOpened: false,
      chartDetailMsg: {
        month: 0,
        outCome: 0,
        inCome: 0
      },
      isChoosePayTypeShow: false,
      choose_pay_type: '餐饮',
      userInfo: {},
      monthPay: {
        outCome: 0,
        inCome: 0
      },
      payNum: 0
    };
  }
  componentDidMount() {
    const userInfo = Taro.getStorageSync('userInfo') || ''
    const monthPay = (Taro.getStorageSync('monthPay') as {outCome: number, inCome: number})
    this.setState({userInfo, monthPay})
    this.sureChooseType(userInfo)
  }
  componentDidShow() {
    const { come_type } = this.state
    const userInfo = Taro.getStorageSync('userInfo') || ''
    come_type == 0 ? this.setState({choose_pay_type: '餐饮'}) : this.setState({choose_pay_type: '工资'})
    this.getAllMonthPay(userInfo)
  }
  // 数组排序
  arrSort = (a,b) => a.month - b.month
  // 获取消费记录
  async getAllMonthPay(userInfo) {
    const res = await ajax({
      url: request_url.getAllMonthPay,
      data: {
        username: userInfo.nickName
      }
    });
    let maxMonthOutcome = 0
    let maxMonthIncome = 0
    const monthPayArr = (res as AllMonthPayReqType).map(v => {
      const monthPayObj = {
        month: parseInt(v.month),
        outCome: v.outCome,
        inCome: v.inCome
      }
        if(v.outCome > maxMonthOutcome)  maxMonthOutcome = v.outCome
        if(v.inCome > maxMonthIncome)  maxMonthIncome = v.inCome
      return monthPayObj
    });
    this.setState({
      monthPayArr: monthPayArr.sort(this.arrSort),
      maxMonthOutcome,
      maxMonthIncome
    })
  }
  handleClick = (e) => {
    const { userInfo } = this.state
    this.setState({
      come_type: e,
      choose_pay_type: e == 0 ? '餐饮' : '工资'
    })
    this.sureChooseType(userInfo)
  }
  showChartDetail = (month,outCome,inCome) => {
    this.setState({
      isOpened: true,
      chartDetailMsg: {
        month,
        outCome,
        inCome
      }
    })
  }
  onCloseChartDetail = () => {
    this.setState({
      isOpened: false
    })
  }
  sureChooseType = async (userInfo) => {
    const { choose_pay_type } = this.state
    const date = new Date()
    const month = (date.getMonth()+1).toString().length == 1 ? `0${date.getMonth()+1}` : (date.getMonth()+1).toString()
    const data = {
      username: userInfo.nickName,
      pay_type: choose_pay_type,
      month
    }
    const res = await ajax({
      url: request_url.getTypePay,
      data
    })
    this.setState({isChoosePayTypeShow: false})
    let payNum: number = 0
    if(res != 'error'){
      const payArr = res as Array<{pay_num:string}>
      payArr.forEach(v => {
        payNum += parseInt(v.pay_num)
      });
      this.setState({payNum})
    }
  }
  render() { 
    const { come_type, monthPayArr, maxMonthOutcome, maxMonthIncome,
       chartDetailMsg: { month, outCome, inCome }, isChoosePayTypeShow,
       choose_pay_type, userInfo, monthPay, payNum } = this.state
    const outcomeWidthRate = 500 / maxMonthOutcome
    const incomeWidthRate = 500 / maxMonthIncome
    const type_items_0 = ['餐饮', '交通', '购物', '居住', '娱乐', '医疗', '教育', '其他']
    const type_items_1 = ['工资', '红包', '生活费', '奖金',' 报销', '兼职', '投资', '其他']
    const type_items = come_type == 0 ? type_items_0 : type_items_1
    const typeRate = come_type == 0 ? (payNum/monthPay.outCome)*100 : (payNum/monthPay.inCome)*100

    return ( 
      <View className="ChartDetail_page">
        <View className="top_tabbar">
          <AtTabBar
            tabList={[
              { title: '支出账单' },
              { title: '收入账单' }
            ]}
            onClick={this.handleClick}
            current={come_type}
          />
        </View>
          <View className="title">{come_type == 0 ? `本月支出：${monthPay.outCome}` : `本月收入：${monthPay.inCome}`}</View>
        <View className="barChartNav">
          <View className="bar_chart_line">
            {
              monthPayArr.map(v => {
                return <View className="bar_chart_line_item">{v.month}月</View>
              })
            }
          </View>
          <View className="bar_chart_wrap">
            {
              monthPayArr.map((v)=>{
                return (
                  <View className="bar_chart_item_nav"
                    onClick={()=>this.showChartDetail(v.month,v.outCome,v.inCome)}>
                    <View className="bar_chart_item" 
                      style={{width: `${come_type==0?v.outCome*outcomeWidthRate:v.inCome*incomeWidthRate}rpx`}}
                      >
                      {
                        come_type==0?(v.outCome*outcomeWidthRate > 70 && v.outCome):(v.inCome*incomeWidthRate > 70 && v.inCome)
                      }
                    </View>
                  </View>
                )
              })
            }
          </View>
        </View>
        <AtCurtain
          isOpened={this.state.isOpened}
          onClose={this.onCloseChartDetail}
          closeBtnPosition="top-right"
        >
          <View className="chart_detail_msg">
          <View className="month">{month}月{come_type==0 ? '支出：': '收入：'}</View>
            {come_type==0 ? <View className="pay_msg">{outCome}</View> : <View className="pay_msg">{inCome}</View>}
          </View>
        </AtCurtain>
        <View className="title">本月{choose_pay_type}：{payNum}</View>
        <View className="select_type">
          <View className="loading">
            <View className="left" style={typeRate < 50 ? {backgroundColor: '#DB3333'} : {backgroundColor: '#999999'}}>
              <View className="after" style={typeRate > 50 ? {backgroundColor: '#DB3333'} : {backgroundColor: '#999999'}}></View>
            </View>
            <View className="right" style={typeRate < 50 ? {backgroundColor: '#DB3333'} : {backgroundColor: '#999999'}}>
              <View className="after" style={typeRate > 50 ? {backgroundColor: '#DB3333',transform: `rotateZ(${(typeRate/100)*360}deg)`} : {backgroundColor: '#999999',transform: `rotateZ(${(typeRate/100)*360}deg)`}}></View>
            </View>
            <View className="progress">{typeRate.toFixed(2)}%</View>
          </View>
        </View>
        <View className="select_type_btn">
          <AtButton type="primary" onClick={()=>this.setState({isChoosePayTypeShow: true})}>选择消费类别</AtButton>
        </View>
        <AtDrawer show={isChoosePayTypeShow} mask onClose={()=>this.setState({isChoosePayTypeShow: false})}>
          <View className='drawer_title'>选择消费类别</View>
          <View className="drawer_item_wrap">
            {type_items.map(v => <View className="drawer_item" style={choose_pay_type == v ? {backgroundColor: '#DB3333',color: '#fff'} : ''} onClick={()=>this.setState({choose_pay_type: v})}>{v}</View>)}
          </View>
          <View className="sure_choose_btn">
            <View className="btn_wrap"><AtButton type="primary" onClick={()=>this.sureChooseType(userInfo)}>确认</AtButton></View>
          </View>
        </AtDrawer>
      </View>
    );
  }
}
 
export default ChartDetail;