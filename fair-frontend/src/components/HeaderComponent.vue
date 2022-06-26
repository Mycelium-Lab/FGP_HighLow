<template>
  <header>
    <nav>
        <router-link class="header-link" to="/">Game</router-link>
        <router-link class="header-link" to="/past">Past games</router-link>
        <router-link class="header-link" to="/current">Current games</router-link>
    </nav>
    <div class="connect-btn">
        <span v-if="shorted === null">Connect wallet</span>
        <span v-else>{{ this.shorted }}</span>
        <span class="chainName" v-if="currentChain === '0xa515'">Oasis</span>
        <img src="../assets/icons/loader.png">
    </div>
  </header>
</template>

<script>
import store from '../store'

export default {
  name: 'HeaderComponent',
  store,
  computed: {
    shorted: function() {
        return this.$store.state.accountShorted
    },
    currentChain: function() {
      return this.$store.state.web3.currentProvider.chainId;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
header {
    margin-top: 36px;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border: 3px solid #F27C2F;
}
nav {
    width: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    height: 100%;
}
.header-link {
    padding: 10px;
    border-left: 0px solid #F27C2F;
    border-right: 3px solid #F27C2F;
    text-decoration: none;
    font-family: 'Orbitron', sans-serif;
    font-weight: 700px;
    font-size: 18px;
    box-sizing: border-box;
}
.connect-btn {
    height: 100%;
    padding: 18px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-left: 3px solid #F27C2F;
    cursor: pointer;
}
.connect-btn img {
    animation: spin 4s infinite;
}
@keyframes spin {
    0% {
        transform: rotateZ(0deg);
    }
    50% {
        transform: rotateZ(180deg);
    }
    100% {
        transform: rotateZ(360deg);
    }
}
.connect-btn span {
    margin-right: 16px;
    font-family: 'Orbitron';
    font-style: normal;
    font-weight: 700;
    font-size: 15px;
    line-height: 19px;
    color: #000000;
}
.header-link:visited, .header-link:hover {
    color: #2C2F33;
}
.router-link-active {
    color: #DF7F31 !important;
}
.chainName {
    font-family: 'Orbitron';
    font-style: normal;
    font-weight: 700;
    font-size: 15px;
    line-height: 19px;
    color: #E47047 !important;
}
</style>
