import * as React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from "@tarojs/taro";
import { AtCurtain , AtInput, AtButton, AtTabBar, AtMessage } from "taro-ui";
import { ajax } from "../../util/ajax";
import { request_url } from "../../util/config";
import './account.scss'

export interface AccountProps {
  
}
 
export interface AccountState {
  inCome: number      // 收入
  outCome: number     // 支出
  userInfo: {
    nickName: string
    gender: number
    language: string
    city: string
    province: string
    country: string
    avatarUrl: string
  } | string | unknown
  isOpenModal: boolean  // 是否打开弹框
  budgetCount: {
    first: string,
    second: string
  }   // 预算
  current_index: number // tabbar index
}

type BudgetArray = Array<{
  id: number,
  username: string
  accountBook: number
  budge: string
}>
type GetMonthResType = { type: string, all_pay:{
  inCome: number
  outCome: number
} }
 
class Account extends React.Component<AccountProps, AccountState> {
  constructor(props: AccountProps) {
    super(props);
    this.state = {
      inCome: 0,
      outCome: 0,
      userInfo: '',
      isOpenModal: false,
      budgetCount: {
        first: '',
        second: ''
      },
      current_index: 0
    };
  }

  componentDidMount() {
    const userInfo = Taro.getStorageSync('userInfo') || ''
    if(userInfo !== '') this.login(userInfo)
  }
  componentDidShow() {
    const userInfo = Taro.getStorageSync('userInfo') || ''
    this.getMonthPay(userInfo)
    this.getBudget(userInfo)
    this.setState({userInfo})
  }
  // 获取每月支出
  async getMonthPay(userInfo) {
    const date = new Date()
    const month =  date.getMonth()+1
    const res = await ajax({
      url: request_url.getMonthPay,
      data: {
        username: userInfo.nickName,
        month: month.toString()
      }
    });
    (res as GetMonthResType).type == "success" &&
    this.setState({ 
      inCome: (res as GetMonthResType).all_pay.inCome,
      outCome: (res as GetMonthResType).all_pay.outCome
    })
  }
  // 获取预算
  async getBudget(userInfo) {
    const { budgetCount } = this.state
    const res = await ajax({
      url: request_url.getBudget,
      data: {
        username: userInfo.nickName
      }
    })
    
    if((res as BudgetArray).length>=1){
      (res as BudgetArray).forEach(v => {
        if(v.accountBook == 0){
          budgetCount.first = v.budge
        }else{
          budgetCount.second = v.budge
        }
      });
      this.setState({
        budgetCount: {
          ...budgetCount
        }
      })
    }
    
  }
  // 获取信息
  getUserInfo = () => {
    Taro.getUserInfo({
      success: ({ userInfo }) => {
        this.login(userInfo)
      }
    })
  }
  // 登录
  async login(userInfo) {
    const res = await ajax({
      url: request_url.login,
      data: {
        username: userInfo.nickName
      }
    })
    if(res == 'success'){
      this.setState({userInfo})
      Taro.setStorageSync('userInfo',userInfo)
    }
  }
  // 打开弹框
  addBudgetClick = () => {
    this.setState({
      isOpenModal: true
    })
  }
  // 输入预算
  budgetCountChange = (e) => {
    const { budgetCount, current_index } = this.state
    // 生活账本
    if(current_index == 0){
      this.setState({
        budgetCount: {
          ...budgetCount,
          first: e
        }
      })
    }else{
      // 工作账本
      this.setState({
        budgetCount: {
          ...budgetCount,
          second: e
        }
      })
    }
    
  }
  handleCancleClick = () => {
    const { budgetCount } = this.state
    this.setState({
      isOpenModal: false,
      budgetCount: {
        ...budgetCount
      }
    })
  }
  handleSureClick = () => {
    const { userInfo, current_index, budgetCount:{first,second} } = this.state
    this.setState({
      isOpenModal: false
    })
    current_index == 0 && this.setBudget(userInfo, current_index, first)
    current_index == 1 && this.setBudget(userInfo, current_index, second)
  }
  // 设置预算
  async setBudget(userInfo,accountBook,budge) {
    const res = await ajax({
      url: request_url.setBudget,
      data: {
        username: userInfo.nickName,
        accountBook,
        budge
      }
    })
    if(res == 'success'){
      Taro.atMessage({
        'message': '设置成功',
        'type': 'success'
      })
    }
  }

  // 记一笔
  accountClick = () => {
    const { current_index } = this.state
    Taro.navigateTo({
      url: `/pages/home/home?account_index=${current_index}`
    })
  }
  tabClick = (e) => {
    this.setState({
      current_index: e
    })
  }
  render() { 
    const month = new Date()
    const {inCome, outCome, userInfo, isOpenModal, budgetCount: {first, second}, current_index} = this.state
    return ( 
      <View className="account_page">
        <AtMessage />
        <View className="login_btn" style={userInfo !== ''?{display:'none'}:''}>
          <View className="login_btn_text">
            <Button size="default" type="default" openType="getUserInfo" onGetUserInfo={this.getUserInfo}>一键登录</Button>
          </View>
        </View>
        <View style={userInfo == ''?{display:'none'}:''} >
          {/* 导航栏 */}
          <View className="top_tabbar">
            <AtTabBar
              current={current_index}
              tabList={[
                {title: '生活账本'},
                {title: '工作账本'}
              ]}
              onClick={this.tabClick} />
          </View>
          {/* 添加预算 */}
          <View className="add_budget">
            <View className="add_budget_view" onClick={this.addBudgetClick}>
              <Text className="add_budget_text" style={current_index!==0?{display: 'none'}:''}>{first==''?'添加预算':`预算：${first}`}</Text>
              <Text className="add_budget_text" style={current_index==0?{display: 'none'}:''}>{second==''?'添加预算':`预算：${second}`}</Text>
            </View>
          </View>
          {/* 收入支出 */}
          <View className="account_view">
            <View className="left_inCome">
              <Text className="inCome_text">{month.getMonth()+1}月收入</Text>
              <Text className="inCome_money">{inCome.toFixed(2)}</Text>
            </View>
            <View className="right_outCome">
              <Text className="outCome_text">{month.getMonth()+1}月支出</Text>
              <Text className="outCome_money">{outCome.toFixed(2)}</Text>
            </View>
          </View>
          {/* 记一笔 */}
          <View className="account_btn_view">
            <View className="account_btn" onClick={this.accountClick}>记一笔</View>
          </View>
          {/* 添加预算弹框 */}
          <AtCurtain 
            isOpened={isOpenModal}
            closeBtnPosition="top-right"
            onClose={this.handleCancleClick} >
              <View className="budget_input_view">
                <AtInput
                  name='value'
                  title={`${current_index==0?'生活':'工作'}预算`}
                  type='number'
                  placeholder='请输入预算'
                  value={current_index==0?first:second}
                  onChange={this.budgetCountChange}
                />
                <View className="sure_btn">
                  <AtButton type='secondary' size='small' onClick={this.handleCancleClick}>取消</AtButton>
                  <AtButton type='primary' size='small' onClick={this.handleSureClick}>确认</AtButton>
                </View>
              </View>
          </AtCurtain >
        </View>
      </View>
     );
  }
}
 
export default Account;