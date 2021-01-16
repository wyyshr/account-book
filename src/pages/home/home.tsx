import * as React from 'react';
import { View, Text, Input, Image } from '@tarojs/components';
import { getCurrentInstance } from '@tarojs/taro'
import Navbar from './cps/navbar/navbar';
import { AtButton, AtCurtain, AtCalendar, AtMessage, AtActionSheet, AtActionSheetItem } from "taro-ui"
import Taro from "@tarojs/taro";
import { ajax } from "../../util/ajax";
import { request_url } from "../../util/config";
import './home.scss'
import {  type_1, type_2, type_3, type_4, type_5, type_6, type_7, type_8,
  type_1_1, type_1_2, type_1_3, type_1_4, type_1_5, type_1_6, type_1_7, type_1_8,
} from '../../assets';
export interface HomeProps {
  
}
 
export interface HomeState {
  select_item: number           // tabbar
  pay_type: string              // 消费类型
  pay_num: string               // 花费
  type_color: string            // 消费类型颜色
  isOpendate: boolean           // 打开日期弹框
  date: string                  // 日期
  account_index: string         // 账本种类    0 - 生活; 1 - 工作
  isChoosePayCardShow: boolean  // 打开支付方式
  allAccounts: Array<{          // 账户信息
    name: string
    value: string
    backgroundColor: string
  }>
  payCardName: string           // 支付账户名
}
interface Routerprops{
  app: object
  router: {
    params: {
      account_index: string
    }
  }
  page: object
}
type Accountreq = {type:'error' | 'success', msg:string}
type AccountArr = Array<{
  id: number
  username: string
  accountCardName: string
  accountCardValue: string
  color: string
}>
 
class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      select_item: 0,
      pay_type: '餐饮',
      pay_num: '',
      type_color: '#F5A623',
      isOpendate: false,
      date: '',
      account_index: '',
      isChoosePayCardShow: false,
      allAccounts: [],
      payCardName: ''
    };
  }
  componentDidMount() {
    const routers = getCurrentInstance() as unknown as Routerprops
    const account_index = routers.router.params.account_index
    const date = new Date()
    const year = date.getFullYear()
    const month = (date.getMonth()+1).toString().length==1 ? `0${date.getMonth()+1}` : date.getMonth()+1
    const day = (date.getDate()).toString().length==1 ? `0${date.getDate()}` : date.getDate()
    this.setState({
      date: `${year}-${month}-${day}`,
      account_index
    })
    const userInfo = Taro.getStorageSync('userInfo') || ''
    this.getAccount(userInfo)
  }
  // 获取资产
  async getAccount(userinfo){
    const {  allAccounts } = this.state
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
      ],
      payCardName: allAccounts[0]?.name || ''
    })
  }
  inputPayNum = (e) => {
    this.setState({
      pay_num: e.detail.value
    })
  }
  selectItem = (id) => {
    this.setState({
      select_item: id
    })
    id == 0 
    ? this.setState({pay_type: '餐饮',type_color: '#F5A623'})
    : this.setState({pay_type: '工资',type_color: '#FF8965'})
  }
  typeSelectClick = (type_name, color) => {
    this.setState({
      pay_type: type_name,
      type_color: color
    })
  }
  onDayClick = (e) => {
    this.setState({
      date: e.value,
      isOpendate: false
    })
  }
  // 打开弹框
  showModal = () => {
    this.setState({
      isOpendate: true
    })
  }
  // 关闭弹框
  handleCloseModal = () => {
    this.setState({
      isOpendate: false
    })
  }
  // 确认提交
  submitDetail = async () => {
    const { select_item, account_index, pay_num, date, pay_type, payCardName, allAccounts } = this.state
    if(allAccounts.length == 0) return Taro.atMessage({
      'message': '暂无账户，请先去添加账户',
      'type': 'error'
    })
    const {nickName=''} = Taro.getStorageSync('userInfo') || ''
    const data = {
      username: nickName,
      pay_num,
      pay_type,
      pay_date: date,
      account_book: account_index,
      come_type: select_item,
      pay_card: payCardName
    }
    const res = await ajax({
      url: request_url.setAccount,
      data
    })
    if(res){
      Taro.atMessage({
        'message': (res as Accountreq).msg,
        'type': (res as Accountreq).type
      });
      (res as Accountreq).type !== 'error' && setTimeout(() => {Taro.navigateBack({delta: 1})}, 1800);
    }
  }
  showPayCard = () => {
    this.setState({
      isChoosePayCardShow: true
    })
  }
  choosePayCard = (payCardName) => {
    this.setState({
      isChoosePayCardShow: false,
      payCardName
    })
  }
  render() { 
    const items = [
      {
        title: '支出'
      },
      {
        title: '收入'
      }
    ]
    const { pay_type, type_color, select_item, isOpendate, date, pay_num, isChoosePayCardShow, allAccounts, payCardName } = this.state
    const type_items_0 = [
      {
        type_name: '餐饮',
        icon: type_1,
        color: '#F5A623'
      },
      {
        type_name: '交通',
        icon: type_2,
        color: '#84BC3C'
      },
      {
        type_name: '购物',
        icon: type_3,
        color: '#7687F1'
      },
      {
        type_name: '居住',
        icon: type_4,
        color: '#F9939C'
      },
      {
        type_name: '娱乐',
        icon: type_5,
        color: '#8DD365'
      },
      {
        type_name: '医疗',
        icon: type_6,
        color: '#D81E06'
      },
      {
        type_name: '教育',
        icon: type_7,
        color: '#F5BF0F'
      },
      {
        type_name: '其他',
        icon: type_8,
        color: '#15C1A9'
      }
    ]
    const type_items_1 = [
      {
        type_name: '工资',
        icon: type_1_1,
        color: '#FF8965'
      },
      {
        type_name: '红包',
        icon: type_1_2,
        color: '#D81E06'
      },
      {
        type_name: '生活费',
        icon: type_1_3,
        color: '#F8D02D'
      },
      {
        type_name: '奖金',
        icon: type_1_4,
        color: '#F8D02D'
      },
      {
        type_name: '报销',
        icon: type_1_5,
        color: '#3DA8F5'
      },
      {
        type_name: '兼职',
        icon: type_1_6,
        color: '#FF7B22'
      },
      {
        type_name: '投资',
        icon: type_1_7,
        color: '#4387DD'
      },
      {
        type_name: '其他',
        icon: type_1_8,
        color: '#000000'
      }
    ]
    const type_items = select_item == 0 ? type_items_0 : type_items_1
    return (
      <View className="home_page">
        {/* 顶部导航栏 */}
        <View className="navbar_components">
          <Navbar items={items} selectItem={this.selectItem} style={{backgroundColor: '#fff'}} />
        </View>
        <View className="count_detail" style={{backgroundColor: type_color}}>
          <Text className="pay_type">{pay_type}</Text>
          <View className="pay_num">
            <Input type="number" placeholder="0" placeholderStyle='color: #fff;' value={pay_num} onInput={this.inputPayNum}/>
          </View>
        </View>
        {/* 选择日期 */}
        <View className="choose_btn">
          <AtButton type="secondary" size='small' onClick={this.showModal}>选择日期</AtButton>
          <Text className="date" style={{color: `${type_color}`}}>{date}</Text>
        </View>
        {
          allAccounts.length > 0 && <View className="choose_pay_card">
            <AtButton type="secondary" size='small' onClick={this.showPayCard}>选择账户</AtButton>
            <Text className="pay_card_name" style={{color: `${type_color}`}}>{payCardName}</Text>
          </View>
        }
        
        {/* 消费类型 */}
        <View className="pay_type_wrap">
          {
            type_items.map(({ type_name, icon, color }) => {
              return (
                <View className="select_type_item" onClick={()=>this.typeSelectClick(type_name,color)} key={type_name}>
                  <View className="img_wrap" style={pay_type==type_name?{border: `2rpx solid ${color}`}:''}>
                    <Image src={icon} mode="aspectFill" />
                  </View>
                  <Text className='type_name' style={pay_type==type_name?{color:`${color}`}:''}>{type_name}</Text>
                </View>
              )
            })
          }
        </View>
        <View className="submit_btn">
          <View style={{backgroundColor: `${type_color}`}} onClick={this.submitDetail}>确 定</View>
        </View>
        <AtCurtain 
          isOpened={isOpendate}
          closeBtnPosition="top-right"
          onClose={this.handleCloseModal} >
          <View className="choose_date">
            <AtCalendar onDayClick={this.onDayClick} />
          </View>
          </AtCurtain>
          <AtMessage />
          <AtActionSheet isOpened={isChoosePayCardShow}
            onClose={()=>this.setState({isChoosePayCardShow: false})}
            onCancel={()=>this.setState({isChoosePayCardShow: false})}>
            {
              allAccounts.map((v) => {
                return (
                  <AtActionSheetItem onClick={()=>this.choosePayCard(v.name)}>
                    <View className="pay_card_items" style={{backgroundColor: v.backgroundColor}}>
                      <View className="pay_card_name">{v.name}</View>
                      <View className="pay_card_value">余额：{v.value}</View>
                    </View>
                  </AtActionSheetItem>
                )
              })
            }
          </AtActionSheet>
      </View>
    );
  }
}
 
export default Home;