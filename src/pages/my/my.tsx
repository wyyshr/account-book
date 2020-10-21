import * as React from 'react';
import { View, Image, Text, Button } from '@tarojs/components';
import Taro from "@tarojs/taro";
import { AtIcon } from "taro-ui";
import { ajax } from "../../util/ajax";
import { request_url } from "../../util/config";
import './my.scss'
export interface MyProps {
  
}
 
export interface MyState {
  userInfo: {
    nickName?: string
    gender?: number
    language?: string
    city?: string
    province?: string
    country?: string
    avatarUrl?: string
  } 
}
 
class My extends React.Component<MyProps, MyState> {
  constructor(props: MyProps) {
    super(props);
    this.state = {
      userInfo: {}
    };
  }
  componentDidShow() {
    const userInfo = Taro.getStorageSync('userInfo') as object || ''
    this.setState({userInfo})
  }
  getUserInfo = () => {
    const that = this
    Taro.getUserInfo({
      success: ({ userInfo }) => {
        that.login(userInfo)
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
  total_pay_chart_click = () => {
    Taro.navigateTo({
      url: '/pages/chart_detail/chart_detail'
    })
  }
  render() { 
    const { userInfo: { nickName = '', gender = 0, avatarUrl = '' } } = this.state
    return (
      <View className="my_page">
        <View className="login_btn" style={nickName !== '' ? {display: 'none'} : {textAlign: 'center'}}>
          <View className="login_btn_text">
            <Button size="default" type="default" openType="getUserInfo" onGetUserInfo={this.getUserInfo}>一键登录</Button>
          </View>
        </View>
        <View style={nickName == '' ? {display: 'none'} : ''}>
          {/* 个人信息 */}
          <View className="userInfo">
            <View className="user_img">
              <Image src={avatarUrl} mode="aspectFit" />
            </View>
            <View className="username">{nickName}</View>
            <View className="user_gender">{gender == 1 ? '男' : '女'}</View>
          </View>
          {/* 报表 */}
          <View className="total_pay_chart" onClick={this.total_pay_chart_click}>
            <Text className="left_icon">
              <AtIcon value='calendar' />
            </Text>
            <View className="name">报表</View>
            <Text className="right_con">
              <AtIcon value='chevron-right' />
            </Text>
          </View>
        </View>
        
      </View>
    );
  }
}
 
export default My;