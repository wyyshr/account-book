import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from "@tarojs/taro";
import { AtIcon, AtCurtain, AtButton, AtInput, AtMessage, AtModal } from "taro-ui";
import { ajax } from "../../util/ajax";
import { request_url } from "../../util/config";
import './index.scss'

export interface IndexProps {
  
}
 
export interface IndexState {
  // allMoney: number
  allAccounts: Array<{
    name: string
    value: string
    backgroundColor: string
  }>
  isOpenModal: boolean  // 是否打开弹框
  money_accout_card: {
    name: string
    value: string
    backgroundColor: string
  },
  chooseColorIndex: number
  isShowDeleteModal: boolean
  accountCardName: string
}

type AccountArr = Array<{
  id: number
  username: string
  accountCardName: string
  accountCardValue: string
  color: string
}>
 
class Index extends React.Component<IndexProps, IndexState> {
  constructor(props: IndexProps) {
    super(props);
    this.state = {
      // allMoney: 0,
      allAccounts: [],
      isOpenModal: false,
      money_accout_card: {
        name: '',
        value: '',
        backgroundColor: '#F5A623'
      },
      chooseColorIndex: 0,
      isShowDeleteModal: false,
      accountCardName: ''
    };
  }
  // const colors = ['#F5A623','#84BC3C','#7687F1','#F9939C']
  componentDidShow() {
    const userInfo = Taro.getStorageSync('userInfo') || ''
    this.getAccount(userInfo)
  }
  // 获取资产
  async getAccount(userinfo){
    // const {  allAccounts } = this.state
    const allAccounts: Array<{
      name: string,
      value: string,
      backgroundColor: string
    }> = []
    const res = await ajax({
      url: request_url.getAccount,
      data: {
        username: userinfo.nickName
      }
    });
    (res as AccountArr).forEach(v => {
      const money_accout_card = {
        name: v.accountCardName,
        value: v.accountCardValue,
        backgroundColor: v.color
      }
      allAccounts.push(money_accout_card)
    });
    this.setState({
      allAccounts: [
        ...allAccounts
      ]
    })
  }
  // 打开弹框
  add_account_card = () => {
    this.setState({
      isOpenModal: true
    })
  }
  // 资产名称
  moneyNameChange = (e) => {
    const { money_accout_card } = this.state
    this.setState({
      money_accout_card: {
        ...money_accout_card,
        name: e
      }
    })
  }
  // 资产余额
  moneyAccountChange = (e) => {
    const { money_accout_card } = this.state
    this.setState({
      money_accout_card: {
        ...money_accout_card,
        value: e
      }
    })
  }
  handleColorClick=(v,i) => {
    const { money_accout_card } = this.state
    this.setState({
      chooseColorIndex: i,
      money_accout_card: {
        ...money_accout_card,
        backgroundColor: v
      }
    })
  }
  handleCancleClick = () => {
    this.setState({
      isOpenModal: false,
      chooseColorIndex: 0,
      money_accout_card: {
        name: '',
        value: '',
        backgroundColor: '#F5A623'
      }
    })
  }
  handleSureClick = () => {
    const { money_accout_card, allAccounts } = this.state
    const userInfo = Taro.getStorageSync('userInfo') || ''
    if(money_accout_card.name!=='' && money_accout_card.value!=='') {
      this.addAccount(userInfo,
        money_accout_card.name,
        money_accout_card.value,
        money_accout_card.backgroundColor)
      const accountCardArr: string[] = []
      allAccounts.forEach(v => {accountCardArr.push(v.name)});
      const isUpdateAccountMsg = accountCardArr.includes(money_accout_card.name)
      if(isUpdateAccountMsg){
        allAccounts.forEach((v,i) => {
          if(v.name==money_accout_card.name){
            allAccounts[i].value = money_accout_card.value
            allAccounts[i].backgroundColor = money_accout_card.backgroundColor
          }
        });
      }else{
        allAccounts.push(money_accout_card)
      }
      this.setState({
        isOpenModal: false,
        allAccounts,
        chooseColorIndex: 0,
        money_accout_card: {
          name: '',
          value: '',
          backgroundColor: '#F5A623'
        }
      })
    }else{
      Taro.atMessage({
        'message': '请输入完整信息',
        'type': 'error',
      })
    }
  }
  // 添加账户
  async addAccount(userinfo,accountCardName,accountCardValue,color) {
    const res = await ajax({
      url: request_url.addAccount,
      data: {
        username: userinfo.nickName,
        accountCardName,
        accountCardValue,
        color
      }
    })
    if(res == 'success'){
      Taro.atMessage({
        'message': '设置成功',
        'type': 'success'
      })
    }
  }
  showDeleteModal = (name) => {
    this.setState({
      isShowDeleteModal: true,
      accountCardName: name
    })
  }
  handleCancelDelete = () => {
    this.setState({
      isShowDeleteModal: false
    })
  }
  handleConfirmDelete = () => {
    const { accountCardName } = this.state
    const userInfo = Taro.getStorageSync('userInfo') || ''
    this.deleteAccount(userInfo, accountCardName)
  }
  // 删除账户
  async deleteAccount(userInfo,accountCardName) {
    const { allAccounts } = this.state
    const res = await ajax({
      url: request_url.deleteAccount,
      data: {
        username: userInfo.nickName,
        accountCardName
      }
    })
    if(res == 'success'){
      Taro.atMessage({
        'message': '删除成功',
        'type': 'success'
      })
      allAccounts.forEach((v,i) => {
        v.name == accountCardName && allAccounts.splice(i, 1)
      });
      this.setState({ 
        allAccounts,
        isShowDeleteModal: false
      })
    }
  }

  render() { 
    const { allAccounts, isOpenModal, money_accout_card: { name, value }, chooseColorIndex, isShowDeleteModal } = this.state
    const colors = ['#F5A623','#84BC3C','#7687F1','#F9939C']
    const all_money = allAccounts.reduce((preVal,n) => {
      return preVal + parseInt(n.value)
    },0);
    
    return ( 
      <View className='index_page'>
        <View className="all_money">
          <View className="all_money_text">
            <Text className="money">{all_money.toFixed(2)}</Text>
            <Text className="all_money_text_dw">总资产</Text>
          </View>
          <Text className="add_account_btn" onClick={this.add_account_card}>
            <AtIcon value="add" />
          </Text>
        </View>
        <View className="all_accounts">
          <Text className="title">全部账户({allAccounts.length})</Text>
          <View className="account_cards">
            {
              allAccounts.map(({ name, value, backgroundColor },i)=>{
                return (
                  <View className="all_account_item" key={i} style={{backgroundColor}}>
                    <Text className="card_name">{name}</Text>
                    <Text className="card_value">{parseInt(value).toFixed(2)}</Text>
                    <Text className="card_close_icon" onClick={()=>this.showDeleteModal(name)}>
                      <AtIcon value="close" size={15} />
                    </Text>
                  </View>
                )
              })
            }
          </View>
        </View>
        {/* 添加资产弹框 */}
        <AtCurtain 
          isOpened={isOpenModal}
          closeBtnPosition="top-right"
          onClose={this.handleCancleClick} >
            <View className="add_money_input_view">
              <AtInput
                name='moneyName'
                title='资产名称'
                type='text'
                placeholder='请输入资产名称'
                value={name}
                onChange={this.moneyNameChange}
              />
              <AtInput
                name='moneyAccount'
                title='资产余额'
                type='number'
                placeholder='请输入资产余额'
                value={value.toString()}
                onChange={this.moneyAccountChange}
              />
              <View className="choose_color">
                <View className="choose_color_text">选择颜色</View>
                <View className="colors_wrap">
                  {
                    colors.map((v,i)=>{
                      return (
                        <View className="color_items"
                          style={chooseColorIndex==i ? {border: `5rpx solid ${v}`} : ''}
                          onClick={()=>this.handleColorClick(v,i)}>
                          <View className="color_items_detail" style={{backgroundColor: v}} />
                        </View>
                      )
                    })
                  }
                </View>
              </View>
              <View className="sure_btn">
                <AtButton type='secondary' size='small' onClick={this.handleCancleClick}>取消</AtButton>
                <AtButton type='primary' size='small' onClick={this.handleSureClick}>确认</AtButton>
              </View>
            </View>
        </AtCurtain >
        <AtMessage />
        <AtModal 
          isOpened={isShowDeleteModal}
          title='删除账户'
          cancelText='取消'
          confirmText='确认'
          onClose={ this.handleCancelDelete }
          onCancel={ this.handleCancelDelete }
          onConfirm={ this.handleConfirmDelete }
          content='确定删除该账户？' />
      </View>
    );
  }
}
 
export default Index;
