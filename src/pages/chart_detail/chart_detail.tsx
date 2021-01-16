import * as React from 'react';
import { View, Picker, Text } from '@tarojs/components';
import Taro from '@tarojs/taro'
import { AtTabBar, AtCurtain, AtButton, AtDrawer, AtList, AtListItem }  from 'taro-ui'
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
    year: string
  }>
  yearPayArr: Array<{
    month: number
    outCome: number
    inCome: number
    year: string
  }>
  maxMonthOutcome: number
  maxMonthIncome: number
  maxYearOutCome: number
  maxYearIncome: number
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
  chooseDate: string
  chooseDayPayArr: Array<{pay_type: string,pay_num: number}>
  year_or_month: number
}
type AllMonthPayReqType = Array<{
  month: string
  outCome: number
  inCome: number
  year: string
}>
 
class ChartDetail extends React.Component<ChartDetailProps, ChartDetailState> {
  constructor(props: ChartDetailProps) {
    super(props);
    this.state = {
      come_type: 0,
      monthPayArr: [],
      yearPayArr: [],
      maxMonthOutcome: 0,
      maxMonthIncome: 0,
      maxYearOutCome: 0,
      maxYearIncome: 0,
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
      payNum: 0,
      chooseDate: '',
      chooseDayPayArr: [],
      year_or_month: 0,
    };
  }
  componentDidMount() {
    const userInfo = Taro.getStorageSync('userInfo') || ''
    const monthPay = (Taro.getStorageSync('monthPay') as {outCome: number, inCome: number})
    const date = new Date()
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().length == 1 ? `0${(date.getMonth() + 1).toString()}` : date.getMonth() + 1
    const day = (date.getDate()).toString().length == 1 ? `0${date.getDate()}` : date.getDate()
    const chooseDate = `${year}-${month}-${day}`
    this.setState({userInfo, monthPay, chooseDate})
    this.sureChooseType(userInfo)
    this.getOneDayPay(userInfo)
  }
  componentDidShow() {
    const { come_type } = this.state
    const userInfo = Taro.getStorageSync('userInfo') || ''
    come_type == 0 ? this.setState({choose_pay_type: '餐饮'}) : this.setState({choose_pay_type: '工资'})
    this.getAllMonthPay(userInfo)
  }
  // 月数组排序
  monthArrSort = (a,b) => a.month - b.month
  // 年数组排序
  yearArrSort = (a,b) => a.year - b.year
  // 获取消费记录
  async getAllMonthPay(userInfo) {
    const date = new Date()
    const thisYear = date.getFullYear()
    const res = await ajax({
      url: request_url.getAllMonthPay,
      data: {
        username: userInfo.nickName
      }
    });
    let maxMonthOutcome = 0, maxMonthIncome = 0, maxYearOutCome = 0, maxYearIncome = 0
    const resArr = res as AllMonthPayReqType
    const monthPayArr = resArr.filter(v => v.year == thisYear.toString())
    const monthPayArr1 = monthPayArr.map(v => {
      const monthPayObj = {
        month: parseInt(v.month),
        outCome: v.outCome,
        inCome: v.inCome,
        year: v.year
      }
      if(v.outCome > maxMonthOutcome)  maxMonthOutcome = v.outCome
      if(v.inCome > maxMonthIncome)  maxMonthIncome = v.inCome
      return monthPayObj
    });
    const yearPayArr = this.yearPayArr(resArr)
    yearPayArr.forEach(v => {
      if(v.outCome > maxYearOutCome)  maxYearOutCome = v.outCome
      if(v.inCome > maxYearIncome)  maxYearIncome = v.inCome
    });
    
    this.setState({
      monthPayArr: monthPayArr1.sort(this.monthArrSort),
      yearPayArr: yearPayArr.sort(this.yearArrSort),
      maxMonthOutcome,
      maxMonthIncome,
      maxYearOutCome,
      maxYearIncome
    })
  }
  handleClick = (e) => {
    const { userInfo } = this.state
    this.setState({
      come_type: e,
      choose_pay_type: e == 0 ? '餐饮' : '工资'
    },() => {
      this.sureChooseType(userInfo)
      this.getOneDayPay(userInfo)
      // this.getAllMonthPay(userInfo)
    })
  }
  handleYearMonthClick = (e) => {
    const { userInfo } = this.state
    this.setState({
      year_or_month: e
    },() => {
      this.sureChooseType(userInfo)
      // this.getAllMonthPay(userInfo)
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
  sureChooseType = async (userInfo) => {
    const { choose_pay_type, year_or_month } = this.state
    const date = new Date()
    const month = (date.getMonth()+1).toString().length == 1 ? `0${date.getMonth()+1}` : (date.getMonth()+1).toString()
    const year = date.getFullYear().toString()
    const data = {
      username: userInfo.nickName,
      pay_type: choose_pay_type,
      month: year_or_month == 0 ? month : '',
      year
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
        payNum += parseFloat(v.pay_num)
      });
      this.setState({payNum})
    }
  }
  handleChooseDate = (e) => {
    const userInfo = Taro.getStorageSync('userInfo') || ''
    this.setState({chooseDate: e.detail.value})
    this.getOneDayPay(userInfo)
  }
  async getOneDayPay(userInfo) {
    const { come_type, chooseDate } = this.state
    const date = new Date()
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().length == 1 ? `0${(date.getMonth() + 1).toString()}` : date.getMonth() + 1
    const day = (date.getDate()).toString().length == 1 ? `0${date.getDate()}` : date.getDate()
    const chooseDate1 = `${year}-${month}-${day}`
    const data = {
      username: userInfo.nickName,
      pay_date: chooseDate ? chooseDate : chooseDate1,
      come_type
    }
    const res = await ajax({
      url: request_url.getOneDayPay,
      data
    })
    const chooseDayPayArr = res as Array<{pay_type: string,pay_num: number}>
    if(chooseDayPayArr[0]){
      const chooseDayArr = chooseDayPayArr.map(v => ({
        pay_type: v.pay_type,
        pay_num: v.pay_num
      }))
      this.setState({
        chooseDayPayArr: this.chooseDayPayArr(chooseDayArr)
      })
    }else{
      this.setState({chooseDayPayArr: []})
    }
  }
  yearPayArr(resArr) {
    const resArr1 = resArr
    for (let i = 0; i < resArr1.length; i++) {
      for (let j = i+1; j < resArr1.length; j++) {
        if(resArr1[i].year == resArr1[j].year) {
          resArr1[i].inCome += resArr1[j].inCome
          resArr1[i].outCome += resArr1[j].outCome
          resArr1.splice(j, 1)
        }
      }
    }
    for (let i = 0; i < resArr1.length; i++) {
      for (let j = i+1; j < resArr1.length; j++) {
        if(resArr1[i].year == resArr1[j].year) {
          this.yearPayArr(resArr1)
        }
      }
    }
    return resArr1
  }
  chooseDayPayArr(chooseDayArr) {
    const chooseDayArr1 = chooseDayArr
    for (let i = 0; i < chooseDayArr1.length; i++) {
      for (let j = i+1; j < chooseDayArr1.length; j++) {
        if(chooseDayArr1[i].pay_type == chooseDayArr1[j].pay_type){
          chooseDayArr1[i].pay_num = parseFloat(chooseDayArr1[i].pay_num) + parseFloat(chooseDayArr1[j].pay_num)
          chooseDayArr1.splice(j,1)
        }
      }
    }
    for (let i = 0; i < chooseDayArr1.length; i++) {
      for (let j = i+1; j < chooseDayArr1.length; j++) {
        if(chooseDayArr1[i].pay_type == chooseDayArr1[j].pay_type){
          this.chooseDayPayArr(chooseDayArr1)
        }
      }
    }
    return chooseDayArr1
  }
  render() { 
    const { come_type, monthPayArr, yearPayArr, maxMonthOutcome, maxMonthIncome, maxYearOutCome, maxYearIncome,
       chartDetailMsg: { month, outCome, inCome }, isChoosePayTypeShow,
       choose_pay_type, userInfo, monthPay, payNum, chooseDate, chooseDayPayArr, year_or_month } = this.state
    const outcomeWidthRate = 470 / maxMonthOutcome
    const incomeWidthRate = 470 / maxMonthIncome
    const yearOutcomeWidthRate = 470 / maxYearOutCome
    const yearIncomeWidthRate = 470 / maxYearIncome
    const type_items_0 = ['餐饮', '交通', '购物', '居住', '娱乐', '医疗', '教育', '其他']
    const type_items_1 = ['工资', '红包', '生活费', '奖金',' 报销', '兼职', '投资', '其他']
    const type_items = come_type == 0 ? type_items_0 : type_items_1
    const year = new Date().getFullYear()
    const thisYearPay = yearPayArr.filter(v => v.year == year.toString())
    const thisYearPayOutCome = thisYearPay[0]?.outCome || 0
    const thisYearPayinCome = thisYearPay[0]?.inCome || 0
    const outComeValue = year_or_month==0 ? monthPay.outCome : thisYearPayOutCome
    const inComeValue = year_or_month==0 ? monthPay.inCome : thisYearPayinCome
    const typeRate = come_type == 0 ? (payNum==0 && outComeValue==0 ? 0 : payNum/outComeValue)*100 : (payNum==0 && inComeValue==0 ? 0 : payNum/inComeValue)*100    

    return ( 
      <View className="ChartDetail_page">
        {/* tabbar */}
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
        {/* 年月报表 */}
        <View className="year_month_tabbar">
          <AtTabBar
            tabList={[
              { title: '月报表' },
              { title: '年报表' }
            ]}
            onClick={this.handleYearMonthClick}
            current={year_or_month}
            selectedColor="#db3333"
          />
        </View>
        {/* 柱状图 */}
        <View className="title">{come_type == 0 ? `${year_or_month == 0 ? "本月" : "本年"}支出：${year_or_month == 0 ? monthPay.outCome : thisYearPay[0]?.outCome || 0}` : `${year_or_month == 0 ? "本月" : "年"}收入：${year_or_month == 0 ? monthPay.inCome : thisYearPay[0]?.inCome || 0}`}</View>
        <View className="barChartNav">
          <View className="bar_chart_line">
            {
              year_or_month == 0 ?
              monthPayArr.map(v => {
                return <View className="bar_chart_line_item">{v.month}月</View>
              }) : 
              yearPayArr.map(v => {
                return <View className="bar_chart_line_item">{v.year}年</View>
              })
            }
          </View>
          <View className="bar_chart_wrap">
            {
              year_or_month == 0 ?
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
              }) :
              yearPayArr.map((v)=>{
                return (
                  <View className="bar_chart_item_nav"
                    onClick={()=>this.showChartDetail(v.year,v.outCome,v.inCome)}>
                    <View className="bar_chart_item" 
                      style={{width: `${come_type==0?v.outCome*yearOutcomeWidthRate:v.inCome*yearIncomeWidthRate}rpx`}}
                      >
                      {
                        come_type==0?(v.outCome*yearOutcomeWidthRate > 70 && v.outCome):(v.inCome*yearIncomeWidthRate > 70 && v.inCome)
                      }
                    </View>
                  </View>
                )
              })
            }
          </View>
        </View>
        {/* 幕帘 */}
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
        {/* 饼图 */}
        <View className="title">{year_or_month == 0 ? "本月" : "本年"}{choose_pay_type}：{payNum}</View>
        <View className="select_type">
          <View className="loading">
            <View className="left" style={typeRate <= 50 ? {backgroundColor: '#DB3333'} : {backgroundColor: '#999999'}}>
              <View className="after" style={typeRate > 50 ? {backgroundColor: '#DB3333'} : {backgroundColor: '#999999'}}></View>
            </View>
            <View className="right" style={typeRate <= 50 ? {backgroundColor: '#DB3333'} : {backgroundColor: '#999999'}}>
              <View className="after" style={typeRate > 50 ? {backgroundColor: '#DB3333',transform: `rotateZ(${(typeRate/100)*360}deg)`} : {backgroundColor: '#999999',transform: `rotateZ(${(typeRate/100)*360}deg)`}}></View>
            </View>
            <View className="progress">{typeRate.toFixed(2)}%</View>
          </View>
        </View>
        <View className="select_type_btn">
          <AtButton type="primary" onClick={()=>this.setState({isChoosePayTypeShow: true})}>选择消费类别</AtButton>
        </View>
        {/* 左侧筛选 */}
        <AtDrawer show={isChoosePayTypeShow} mask onClose={()=>this.setState({isChoosePayTypeShow: false})}>
          <View className='drawer_title'>选择消费类别</View>
          <View className="drawer_item_wrap">
            {type_items.map(v => <View className="drawer_item" style={choose_pay_type == v ? {backgroundColor: '#DB3333',color: '#fff'} : ''} onClick={()=>this.setState({choose_pay_type: v})}>{v}</View>)}
          </View>
          <View className="sure_choose_btn">
            <View className="btn_wrap"><AtButton type="primary" onClick={()=>this.sureChooseType(userInfo)}>确认</AtButton></View>
          </View>
        </AtDrawer>
        {/* 搜索日期 */}
        <View className='choose_date_wrap'>
          <View className="title">{chooseDate} {come_type == 0 ? '支出' : '收入'}记录</View>
          <View className="choose_date_picker">
            <Picker mode='date' onChange={this.handleChooseDate} value={chooseDate}>
              <AtList>
                <AtListItem title='请选择日期' extraText={chooseDate} />
              </AtList>
            </Picker>
          </View>
          <View className="choose_day_item_wrap">
            {
              chooseDayPayArr.length > 0 ? chooseDayPayArr.map(v => <View className="choose_day_item" >
                <Text>{v.pay_type} ：</Text>
                <Text>{v.pay_num}</Text>
              </View>) : <View className="no_data">暂无数据</View>
            }
          </View>
          
        </View>
      </View>
    );
  }
}
 
export default ChartDetail;