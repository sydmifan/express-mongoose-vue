import API from '@/common/api'
import Axios from 'axios'
import { Message } from 'element-ui';
import store from '../'
import Vue from 'vue'

const state = {
  userList: Object,
  nowChater: {username: 'all', nickname: '所有人'},
  systemNotice: [],   // 系统信息
  chatRecord: {}        // 聊天记录
}
const getters = {

}
const mutations = {
  getUserList (state, list) {               // 获取用户列表
    state.userList = list;
  },
  setNowChater (state, params) {            // 设置当前聊天对象
    state.nowChater = params;
  },
  addChatRecord (state, params) {           // 添加聊天记录
    if (!state.chatRecord[params.messager]) Vue.set(state.chatRecord, params.messager, []);
    state.chatRecord[params.messager].push(params.data);
  },
  addFriend (state, targetUser) {           // 添加好友
    let json = {
      Initiator: store.state.user.username,
      targetUser: targetUser.username
    }
    Axios.post(API.ADD_FRIEND, json)
    .then(data => {
      if (data.data.isSuccess) {
        Message.success('已发送添加好友请求');
        targetUser.status = 'wait';
      } else {
        Message.error(data.data.msg);
      }
    })
  },
  getSystemNotice (state) {             // 获取系统信息
    Axios.post(API.GET_SYSTEM_NOTICE, {username: store.state.user.username})
    .then(data => {
      if (data.data.isSuccess) {
        state.systemNotice = data.data.data;
      } else {
        Message.error(data.data.msg);
      }
    })
  },
  verification (state, params) {           // 验证好友
    let json = {
      username: store.state.user.username,
      status: params.status,
      targetUser: params.initiator,
      msgId: params._id
    }
    Axios.post(API.VERIFICATION, json)
    .then(data => {
      if (data.data.isSuccess) {
        Message.success('设置成功');
        store.commit('getSystemNotice');
      } else {
        Message.error('设置失败');
      }
    })
  },
  clearSystemNotice (state) {              // 清空系统消息
    Axios.post(API.CLEAR_SYSTEM_NOTICE, {username: store.state.user.username})
  }
}

export default {
  state: state,
  getters: getters,
  mutations: mutations
}
