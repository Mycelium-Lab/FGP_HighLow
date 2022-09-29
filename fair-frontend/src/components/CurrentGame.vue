<template>
  <div class="page">
    <div class="game">
      <h1>START NEW GAME</h1>
      <div class="gameContainer">
        <div>
          <img class="gameContainer__img" src="../../public/Gif/runnig_chip.gif" alt="">
        </div>
        <div class="newgame">
          <div class="newgame-form">
            <div class="newgame-form-unit">
              <span>Guess a number</span><input pattern="[0,9]{1,3}" v-model="startgamenumber" min="1" max="100"
                type="number" />
            </div>
            <div class="newgame-form-unit">
              <span>Your bid</span><input v-model="startgamebid" min="0" type="number" /><span>ROSE</span>
            </div>
            <div class="newgame-form-unit">
              <span>Limit of players</span>
              <select v-model="startgameplayercount">
                <option selected="selected" value="0">Unlimited</option>
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
          <button @click="promptCreate()" class="newgame-start">
            PLAY
          </button>
        </div>
        <div>
          <img class="gameContainer__img" style="transform: scaleX(-1)" src="../../public/Gif/singign_card.gif" alt="">
        </div>
      </div>
      <h2 @click="openRules()">Game rules</h2>
    </div>
    <div id="#current" v-if="games[0]" class="currentgames-wrapper">
      <h1>Current games</h1>
      <div id="currentGames" class="currentgames">
        <ActiveGame class="activegame" v-for="game in games" :key="game[3]" :bid="game[0]" :timestamp="game[1]"
          :participants="game[2]" :id="game[3]" :limit="game[4]" :owner="game[5]" :joined="game[6]"
          :chosenNumber="game[7]" />
      </div>
    </div>
  </div>
</template>

<script>
import { BigNumber, ethers } from 'ethers'
import emitter from '../main'
import store from '../store'
import ActiveGame from './ActiveGame.vue'

export default {
  name: 'CurrentGame',
  store,
  components: {
    ActiveGame
  },
  data() {
    return {
      abi: null,
      startgamenumber: '',
      startgamebid: '',
      startgameplayercount: 0
    }
  },
  computed: {
    balance: function () {
      return this.$store.state.balance;
    },
    web3: function () {
      return this.$store.state.web3;
    },
    contract: function () {
      return this.$store.state.fairContract;
    },
    address: function () {
      return this.$store.state.user;
    },
    games: function () {
      return this.$store.state.games;
    }
  },
  created() {
    emitter.on('confirmNewGame', () => {
      this.handleCreate();
    })
  },
  methods: {
    async promptCreate() {
      if (window.ethereum && this.address
        && (this.startgamebid != 0)
        && (this.startgamenumber > 0 && this.startgamenumber < 101)
        && (Number.isInteger(this.startgamenumber))
        && (this.startgameplayercount > -1 && this.startgameplayercount < 11 && this.startgameplayercount !== 1)
      ) {
        this.$store.commit('SET_MODAL', true)
        this.$store.commit('SET_TITLE', 'Bid')
        this.$store.commit('SET_TYPE', 'confirm')
        this.$store.commit('SET_CAPTION', 'Your bid ' + this.startgamebid + ' tokens. Would you like to proceed?')
      } else if (this.startgamebid == 0) {
        this.$store.commit('SET_MODAL', true)
        this.$store.commit('SET_TITLE', 'Error')
        this.$store.commit('SET_TYPE', 'info')
        this.$store.commit('SET_CAPTION', 'Bid cant be 0')
      } else if (!(this.startgamenumber > 0 && this.startgamenumber < 101) || (!(Number.isInteger(this.startgamenumber)))) {
        this.$store.commit('SET_MODAL', true)
        this.$store.commit('SET_TITLE', 'Error')
        this.$store.commit('SET_TYPE', 'info')
        this.$store.commit('SET_CAPTION', 'Wrong bet: "' + this.startgamenumber + '", choose a number in range 1-100')
      } else if (!(this.startgameplayercount > -1 && this.startgameplayercount < 11 && this.startgameplayercount !== 1)) {
        this.$store.commit('SET_MODAL', true)
        this.$store.commit('SET_TITLE', 'Error')
        this.$store.commit('SET_TYPE', 'info')
        this.$store.commit('SET_CAPTION', 'Wrong participants limit')
      }
    },
    async handleCreate() {
      this.$store.commit('SET_MODAL', true)
      this.$store.commit('SET_TITLE', 'Bid information')
      this.$store.commit('SET_TYPE', 'info')
      this.$store.commit('SET_CAPTION', 'Confirm this transaction in your wallet')
      const contract = this.contract;
      const address = this.address;
      const number = this.startgamenumber;
      const limit = this.startgameplayercount;
      const bid = this.startgamebid
      if (window.ethereum && this.address
        && (bid != 0)
        && (number > 0 && number < 101)
        && (Number.isInteger(number))
        && (limit > -1 && limit < 11 && limit !== 1)
      ) {
        try {
          await contract.methods.createGame(BigNumber.from(number), BigNumber.from(limit)).send({ from: address, value: ethers.utils.parseEther((bid).toString()) }, (err, transactionHash) => {
            if (err) {
              this.$store.commit('SET_MODAL', false)
              this.$store.commit('SET_TITLE', '')
              this.$store.commit('SET_TYPE', '')
              this.$store.commit('SET_CAPTION', '')
              console.log(err);
            }
            if (transactionHash) {
              emitter.emit('animateProgressBar')
              console.log(transactionHash);
            }
            this.startgamenumber = '';
            this.startgameplayercount = 0;
            this.startgamebid = '';
          }).then(() => {
            this.$store.commit('SET_MODAL', false)
            this.$store.commit('SET_TITLE', '')
            this.$store.commit('SET_TYPE', '')
            this.$store.commit('SET_CAPTION', '')
            emitter.emit('finishProgress')
          });
        } catch (err) {
          this.$store.commit('SET_MODAL', false)
          this.$store.commit('SET_TITLE', '')
          this.$store.commit('SET_TYPE', '')
          this.$store.commit('SET_CAPTION', '')
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
  transition: 0.2s;
  color: #F27C2F;
  margin-bottom: 78px;
  cursor: pointer;
}

h2:hover {
  transition: 0.2s;
  color: #000000;
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

.gameContainer {
  display: flex;
  flex-direction: row;
  align-items: center
}

@media screen and (max-width: 969px) {
  .gameContainer__img {
    display: none;
  }
}

.gameContainer__img {
  width: 100%;
  height: fit-content;
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
  margin-right: 16px;
}

.newgame-form-unit {
  margin: 14px;
  margin-left: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  max-height: 21px;
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
  font-family: 'Orbitron';
  font-weight: 600;
  font-size: 15px;
  color: #2C2F33;
  max-width: 96px;
  min-width: 96px;
}

.newgame-form-unit select {
  border: 1px solid #2C2F33;
  background: #F27C2F;
  font-family: 'Orbitron';
  font-weight: 600;
  font-size: 15px;
  color: #2C2F33;
  max-width: 102px;
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
  text-shadow: 2px 3px 0px #000000;
  -webkit-box-shadow: 4px 4px 0px 0px rgba(255, 255, 255, 0.9);
  -moz-box-shadow: 4px 4px 0px 0px rgba(255, 255, 255, 0.9);
  box-shadow: 4px 4px 0px 0px rgba(255, 255, 255, 0.9);
}

.newgame-start:hover {
  transition: 0.2s;
  border: 2px solid black;
  color: #000000;
  text-shadow: 2px 3px 0px #F2C94C;
  -webkit-box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
  -moz-box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
  box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
}



.newgame-start:active {
  transition: 0.1s;
  color: black;
  text-shadow: 2px 3px 0px #F2C94C;
  border: 2px solid #000000;
  -webkit-box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
  -moz-box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
  box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
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

@media screen and (max-width: 1000px) {
  .currentgames {
    display: flex;
    flex-direction: column;
  }
}

@media screen and (max-width: 700px) {
  .newgame {
    flex-direction: column;
    align-items: center;
    padding: 26px;
  }

  .newgame-form-unit {
    margin-right: 0;
  }

  .newgame-start {
    padding: 25px 78px;
  }

  .currentgames-wrapper {
    padding: 14px;
  }
}

@media screen and (max-width: 450px) {
  .newgame {
    padding: 20px;
  }

  .newgame-form-unit {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .newgame-form-unit span {
    font-size: 10px;
  }

  .newgame-form-unit input {
    font-size: 10px;
  }

  .newgame-form-unit select {
    font-size: 12px;
  }

  .newgame-start {
    margin-top: 24px;
    padding: 25px 54px;
  }
}

@media screen and (max-width: 400px) {
  h1 {
    font-size: 14px;
  }
}
</style>
