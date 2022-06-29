import { createStore } from 'vuex'
import Fair from '../abis/Fair.json'

export default createStore({
  state: {
    user: null,
    web3: null,
    balance: null,
    fairAddress: "0x57789Cc8BF478F06a87fD90Ec0CE892BF54b29B2",
    fairContract: null,
    pastGames: [],
    games: [],
    modal: false,
    modalTitle: null,
    modalType: null,
    modalCaption: null,
    accountShorted: null
  },
  getters: {
  },
  mutations: {
    SET_USER(state, user)
    {
      state.user = user
    },
    SET_WEB3(state, web3) 
    {
      state.web3 = web3
    },
    SET_BALANCE(state, balance)
    {
      state.balance = balance
    },
    SET_GAMES(state, games)
    {
      state.games = games
    },
    SET_PAST_GAMES(state, games)
    {
      state.pastGames = games
    },
    SET_MODAL(state, modal){
      state.modal = modal
    },
    SET_TITLE(state, title) {
      state.modalTitle = title
    },
    SET_TYPE(state, type) {
      state.modalType = type
    },
    SET_CAPTION(state, caption) {
      state.modalCaption = caption
    },
    SET_SHORTED(state, shorted) {
      state.accountShorted = shorted
    }
  },
  actions: {
    async fetchFairContract ({state}) {
      const fairAddress = state.fairAddress;
      const fairContract = new state.web3.eth.Contract(Fair.abi, fairAddress);
      state.fairContract = fairContract;
    },
    // async fetchPastEvents ({state}) {
    //   if (state.fairContract) {
    //     const options = {
    //       fromBlock: 0,
    //       toBlock: 'latest'
    //     }
    //     console.log('weird')
    //     state.fairContract.getPastEvents('GameCreated', options, function (error, events){console.log(events, error)})
    //       .then(results => console.log(results))
    //       //.catch(err => console.log(err));
    //   }
    // }
  },
  modules: {
  }
})