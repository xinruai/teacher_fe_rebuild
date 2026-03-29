import zhidingImg from '@/assets/images/order/zhiding.png'
import moneyImg from '@/assets/images/order/money.png'
import renImg from '@/assets/images/order/ren.png'
import shanchangImg from '@/assets/images/order/shanchang.png'
import shijianImg from '@/assets/images/order/shijian.png'

export const titleEnum: Record<number, string> = {
  0: '定制辅导',
  1: '考前突击',
  26: '包课辅导',
  65: '论文大礼包',
  67: '毕业大论文',
  71: '作业辅导',
}

export const tagConfig = [
  {
    label: '你的指定客户',
    value: 2,
    bgColor: '#F57278',
    icon: zhidingImg,
  },
  {
    label: '额外收入奖励',
    value: 11,
    bgColor: '#FF6D1F',
    icon: moneyImg,
  },
  {
    label: '高收入订单',
    value: 12,
    bgColor: '#FF6D1F',
    icon: moneyImg,
  },
  {
    label: '历史客户',
    value: 3,
    bgColor: '#5CBD78',
    icon: renImg,
  },
  {
    label: '擅长学科',
    value: 4,
    bgColor: '#6D99E6',
    icon: shanchangImg,
  },
  {
    label: '工作时间符合',
    value: 5,
    bgColor: '#EAAA34',
    icon: shijianImg,
  },
]
