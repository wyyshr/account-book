import Taro from "@tarojs/taro";

const HOSTURL = "http://127.0.0.1:3000"
// const HOSTURL = "https://322b074517.eicp.vip"
export const ajax = async (params) => {
  return new Promise((resolve, reject) => {
    Taro.request({
      ...params,
      url: HOSTURL + params.url,
      success: (res)=>{
        resolve(res.data)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}