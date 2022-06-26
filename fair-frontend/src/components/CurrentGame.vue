<template>
  <div class="page">
    <div class="game">
      <h1>START NEW GAME</h1>
      <div class="newgame">
        <div class="newgame-form">
          <div class="newgame-form-unit">
            <span>Guess a number</span><input v-model="startgamenumber" type="text"/>
          </div>
          <div class="newgame-form-unit">
            <span>Your bid</span><input v-model="startgamebid" type="text"/><span>ROSE</span>
          </div>
          <div class="newgame-form-unit">
            <span>Limit of players</span>
            <select v-model="startgameplayercount">
              <option value="0">Unlimited</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
            </select>
          </div>
        </div>
        <button @click="handleCreate()" class="newgame-start">
          PLAY
        </button>
      </div>
      <h2 @click="openRules()">Game rules</h2>
    </div>
    <div class="currentgames-wrapper">
      <h1>Current games</h1>
      <div id="currentGames" class="currentgames">
        <ActiveGame class="activegame" v-for="game in games" :key="game[3]"
        :bid="game[0]"
        :timestamp="game[1]"
        :participants="game[2]"
        :id="game[3]"
        :owner="game[4]"
        :joined="game[5]"
        :chosenNumber="game[6]"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ActiveGame from './ActiveGame.vue'
import {ethers, BigNumber} from 'ethers'
import store from '../store'

export default {
  name: 'CurrentGame',
  store,
  components: {
    ActiveGame
  },
  data () {
    return {
      abi: null,
      startgamenumber: '',
      startgamebid: '',
      startgameplayercount: ''
    }
  },
  computed: {
    balance: function() {
      return this.$store.state.balance;
    },
    web3: function() {
      return this.$store.state.web3;
    },
    contract: function() {
      return this.$store.state.fairContract;
    },
    address: function() {
      return this.$store.state.user;
    },
    games: function() {
      return this.$store.state.games;
    }
  },
  methods: {
    async handleCreate() {
      const contract = this.contract;
      const address = this.address;
      const number = this.startgamenumber;
      const limit = this.startgameplayercount;
      const bid = this.startgamebid
      if (window.ethereum && this.address 
          && (this.startgamenumber > 0 && this.startgamenumber < 101) 
          && (this.startgameplayercount > -1 && this.startgameplayercount < 11 && this.startgameplayercount !== 1)
       ) {
        try{
          await contract.methods.createGame(BigNumber.from(number), BigNumber.from(limit)).send({from: address, value: ethers.utils.parseEther((bid).toString())}, (err, transactionHash) => {
            if (err) {
              console.log(err);
            }
            if (transactionHash) {
              console.log(transactionHash);
            }
          });
        } catch(err) {
            console.log("error: ", err)
        }
      }
    },
    openRules() {
      this.$store.commit('SET_MODAL', true)
      this.$store.commit('SET_TITLE', 'Game rules')
      this.$store.commit('SET_TYPE', 'rules')
      this.$store.commit('SET_CAPTION', '')
    }
  },
  props: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

h2 {
  font-family: 'Orbitron';
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 23px;
  text-decoration-line: underline;
  color: #F27C2F;
  margin-bottom: 78px;
  cursor: pointer;
}
.page {
  width: 100%;
}
.game {
  padding-top: 68px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 3px solid #F27C2F;
  border-top: 0;
  box-sizing: border-box;
}

.newgame {
  background: #F27C2F;
  padding: 52px 62px;
  margin-top: 48px;
  -webkit-box-shadow: 17px 17px 0px 0px rgba(34, 60, 80, 0.2);
  -moz-box-shadow: 17px 17px 0px 0px rgba(34, 60, 80, 0.2);
  box-shadow: 17px 17px 0px 0px rgba(34, 60, 80, 0.2);
  margin-bottom: 68px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
}

.newgame-form {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

.newgame-form-unit {
  margin: 16px;
}

.newgame-form-unit span {
  font-family: 'Orbitron';
  font-style: normal;
  font-weight: 700;
  font-size: 15px;
  line-height: 19px;
  color: #2C2F33;
  margin: 8px;
}

.newgame-form-unit input {
  border: 1px solid #2C2F33;
  background: #F27C2F;
}

.newgame-form-unit select {
  border: 1px solid #2C2F33;
  background: #F27C2F;
}

.newgame-start {
  background: #F27C2F;
  border: 2px solid #FFFFFF;
  padding: 58px 28px;
  font-family: 'Press Start 2P';
  font-style: normal;
  font-weight: 400;
  font-size: 25px;
  line-height: 25px;
  color: #FFFFFF;
  cursor: pointer;
  -webkit-box-shadow: 4px 4px 0px 0px rgba(255, 255, 255, 0.9);
  -moz-box-shadow: 4px 4px 0px 0px rgba(255, 255, 255, 0.9);
  box-shadow: 4px 4px 0px 0px rgba(255, 255, 255, 0.9);
}

.currentgames-wrapper {
  margin-top: 36px;
  padding-top: 48px;
  border: 3px solid #F27C2F;
  display: flex;
  flex-direction: column;
  align-items: space-between;
  padding-bottom: 48px;
}

.currentgames-wrapper h1 {
  align-self: center;
}
.currentgames {
  margin-top: 48px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  row-gap: 48px;
  justify-items: center;
  align-items: center;
}
</style>
