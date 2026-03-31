import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { HatchRouterPath, DissertationRouterPath, paperRouterPath } from '@/constants/enums'

const Layout = () => import('@/layout/LayoutDefault.vue')

// Hatch routes
const hatchRoutes: RouteRecordRaw[] = [
  { path: HatchRouterPath.REDIRECT, component: () => import('@/views/hatch/index.vue') },
  { path: HatchRouterPath.PLAN, component: () => import('@/views/newTrain/index.vue') },
  { path: HatchRouterPath.LETTER, component: () => import('@/views/hatch/letter/index.vue') },
  { path: HatchRouterPath.FAKE, component: () => import('@/views/hatch/fake/index.vue') },
  { path: HatchRouterPath.GROUND, component: () => import('@/views/hatch/trainingground/index.vue') },
  { path: HatchRouterPath.FAKE_CLASS, component: () => import('@/views/hatch/fakeclass/index.vue') },
  { path: HatchRouterPath.FAKE_CLASS_OLD, component: () => import('@/views/hatch/fakeclassold/index.vue') },
  { path: HatchRouterPath.ID_FORM, component: () => import('@/views/hatch/idform/index.vue') },
  { path: HatchRouterPath.CERT, component: () => import('@/views/hatch/certificate/index.vue') },
  { path: HatchRouterPath.INTENTION, component: () => import('@/views/hatch/intention/index.vue') },
  { path: HatchRouterPath.INTENTIONOLD, component: () => import('@/views/hatch/intentionold/index.vue') },
  { path: HatchRouterPath.CLASS_CARD, component: () => import('@/views/hatch/schedulecard/index.vue') },
  { path: HatchRouterPath.QR_CODE, component: () => import('@/views/hatch/qrCode/index.vue') },
]

// Dissertation routes
const dissertationRoutes: RouteRecordRaw[] = [
  { path: DissertationRouterPath.HOME, component: () => import('@/views/dissertation/index.vue') },
]

// Paper schedule routes
const paperRoutes: RouteRecordRaw[] = [
  { path: paperRouterPath.HOME, component: () => import('@/views/paperchedule/index.vue') },
]

export const constantRoutes: RouteRecordRaw[] = [
  // Standalone pages (no layout)
  {
    path: '/sellerDetail',
    name: 'SellerDetail',
    component: () => import('@/views/detail/seller_detail.vue'),
    meta: { hidden: true },
  },
  {
    path: '/sellerDetailWy',
    name: 'sellerDetailWy',
    component: () => import('@/views/detail/seller_detailWy.vue'),
    meta: { hidden: true },
  },
  {
    path: '/bigClassRoom',
    name: 'bigClassRoom',
    component: () => import('@/views/detail/bigClassRoom.vue'),
    meta: { hidden: true },
  },
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true, ignoreVisitRecord: true },
  },
  {
    path: '/404',
    component: () => import('@/views/404.vue'),
    meta: { hidden: true },
  },
  {
    path: '/redirect/:path(.*)',
    component: () => import('@/views/redirect/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/getOrderSchemePage',
    name: 'getOrderSchemePage',
    component: () => import('@/views/getOrderSchemePage/index.vue'),
    meta: { hidden: true },
  },
  {
    path: '/interviewFollow',
    name: 'interviewFollow',
    component: () => import('@/views/interviewFollow/index.vue'),
    meta: { title: '复试指引' },
  },
  {
    path: '/partTimeWeekSalary',
    name: 'partTimeWeekSalaryStandalone',
    component: () => import('@/views/newSalary/index.vue'),
    meta: { title: '兼职讲师工资记录' },
  },
  {
    path: '/smallQuestionBank',
    name: 'smallQuestionBank',
    component: () => import('@/views/smallQuestionBank/index.vue'),
    meta: { title: '小班题库' },
  },

  // Layout pages
  {
    path: '/orders',
    name: 'orders',
    component: Layout,
    redirect: '/orders/orderlist',
    meta: { title: '订单池', icon: 'table', alwaysShow: true },
    children: [
      {
        path: 'orderlist',
        name: 'orderlist',
        component: () => import('@/views/orders/orderList.vue'),
        meta: { title: '订单列表' },
      },
      {
        path: 'myorder',
        name: 'ordersMyorder',
        component: () => import('@/views/orders/orderList.vue'),
        meta: { title: '我的订单' },
      },
      {
        path: 'finishedcourse',
        name: 'finishedcourse',
        component: () => import('@/views/myorders/finishedCourse.vue'),
        meta: { title: '完成课堂' },
      },
    ],
  },
  {
    path: '/myorders',
    name: 'myorders',
    component: Layout,
    redirect: '/myorders/mycourse',
    meta: { title: '我的订单', icon: 'tree' },
    children: [
      {
        path: 'mycourse',
        name: 'mycourse',
        component: () => import('@/views/myorders/myCourse.vue'),
        meta: { title: '我的课程' },
      },
      {
        path: 'myorder',
        name: 'myordersMyorder',
        component: () => import('@/views/myorders/myorderNew.vue'),
        meta: { title: '我的订单2' },
      },
      {
        path: 'oncourse',
        name: 'oncourse',
        component: () => import('@/views/myorders/onCourse.vue'),
        meta: { title: '进行中课堂' },
      },
    ],
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: 'messages',
        name: 'messages',
        component: () => import('@/views/messages/messages.vue'),
        meta: { title: '通知列表' },
      },
    ],
  },
  {
    path: '/schooltimetable',
    name: 'schooltimetable',
    component: Layout,
    redirect: '/schooltimetable/cards',
    meta: { title: '课堂表', icon: 'card', alwaysShow: true },
    children: [
      {
        path: 'cards',
        name: 'cards',
        component: () => import('@/views/schooltimetable/cards.vue'),
        meta: { title: '表格' },
      },
    ],
  },
  {
    path: '/account',
    name: 'account',
    component: Layout,
    redirect: '/account/persondetail',
    meta: { title: '我的', icon: 'user' },
    children: [
      {
        path: 'myinforamtion',
        name: 'myinformation',
        component: () => import('@/views/account/myInformation.vue'),
        meta: { title: '个人资料' },
      },
      {
        path: 'medalWall',
        name: 'medalWall',
        component: () => import('@/views/account/medalWall.vue'),
        meta: { title: '勋章墙' },
      },
      {
        path: 'persondetail',
        name: 'persondetail',
        component: () => import('@/views/account/persondetail.vue'),
        meta: { title: '讲师个性页' },
      },
      {
        path: 'certificate',
        name: 'accountCertificate',
        component: () => import('@/views/hatch/certificate/index.vue'),
        meta: { title: '讲师证书' },
      },
      {
        path: 'historylessons',
        name: 'historylessons',
        component: () => import('@/views/account/historyLessons.vue'),
        meta: { title: '历史课程' },
      },
      {
        path: 'historyorder',
        name: 'historyorder',
        component: () => import('@/views/account/historyorder.vue'),
        meta: { title: '历史订单' },
      },
      {
        path: 'incomelist',
        name: 'incomelist',
        component: () => import('@/views/account/incomeList.vue'),
        meta: { title: '收入记录' },
      },
      {
        path: 'withdrawlist',
        name: 'withdrawlist',
        component: () => import('@/views/account/withdrawList.vue'),
        meta: { title: '工资记录' },
      },
      {
        path: 'givetimes',
        name: 'givetimes',
        component: () => import('@/views/account/giveTimes.vue'),
        meta: { title: '赠送时长' },
      },
      {
        path: 'helpCenter',
        name: 'helpCenter',
        component: () => import('@/views/help/index.vue'),
        meta: { title: '帮助中心' },
      },
      {
        path: 'finishCourse',
        name: 'finishCourse',
        component: () => import('@/views/myorders/finishedCourse.vue'),
        meta: { title: '完成课堂' },
      },
      {
        path: 'mkApp',
        name: 'mkApp',
        component: () => import('@/views/help/index.vue'),
        meta: { title: '课堂应用' },
      },
      {
        path: 'partTimeWeekSalary',
        name: 'partTimeWeekSalary',
        component: () => import('@/views/newSalary/index.vue'),
        meta: { title: '兼职讲师工资记录' },
      },
    ],
  },

  // Hatch, Dissertation, Paper routes
  ...hatchRoutes,
  ...dissertationRoutes,
  ...paperRoutes,

  // Default redirect
  {
    path: '/',
    redirect: '/login',
  },
  // Catch-all
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
    meta: { hidden: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 }),
})

export function resetRouter() {
  const currentRoutes = router.getRoutes()
  currentRoutes.forEach((route) => {
    if (route.name) {
      router.removeRoute(route.name)
    }
  })
  constantRoutes.forEach((route) => {
    router.addRoute(route)
  })
}

export default router
