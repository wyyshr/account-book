import * as React from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro'
import { AtTabBar, AtCurtain }  from 'taro-ui'
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
      }
    };
  }
  componentDidShow() {
    const userInfo = Taro.getStorageSync('userInfo') || ''
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
    this.setState({
      come_type: e
    })
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
  render() { 
    const { come_type, monthPayArr, maxMonthOutcome, maxMonthIncome, chartDetailMsg: { month, outCome, inCome } } = this.state
    const outcomeWidthRate = 500 / maxMonthOutcome
    const incomeWidthRate = 500 / maxMonthIncome
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
      </View>
    );
  }
}
 
export default ChartDetail;