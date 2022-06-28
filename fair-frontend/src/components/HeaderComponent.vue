<template>
  <header>
    <nav>
        <router-link class="header-link" to="/">Game</router-link>
        <router-link class="header-link" to="/past">Past games</router-link>
        <router-link class="header-link" to="/current">Current games</router-link>
    </nav>
    <div class="filler">
    </div>
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
    padding-top: 2.5px;
    margin-top: 36px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 54px;
    box-sizing: border-box;
    position: relative;
    /*border: 3px solid #F27C2F;*/
}
header::before {
    content: "";
    position: absolute;
    width: calc(100% - 96px);
    border-top: 3px solid #F27C2F;
    height: 100%;
    left: 96px;
}
nav {
    padding-left: 6px;
    width: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    height: 100%;
}
.header-link {
    height: 100%;
    padding: 14px;
    padding-left: 28px;
    text-decoration: none;
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    font-size: 18px;
    box-sizing: border-box;
    position: relative;
    display: inline-block;
}
.header-link:first-child::after{
    right: -12% !important;
}
.header-link:after {
    border: 3px solid #F27C2F;
	position: absolute;
	z-index: -1;
	content: "";
	right: -9%;
	top: -5%;
	height: 100%;
	width: 100%;
	background-color: inherit;
	-webkit-transform: skewX(-25deg);
	-moz-transform: skewX(-25deg);
	-ms-transform: skewX(-25deg);
	transform: skewX(-25deg);
}
.connect-btn {
    height: 100%;
    padding: 18px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border: 3px solid #F27C2F;
    border-top: 0;
    box-sizing: border-box;
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

@media screen and (max-width: 800px) {
    .header-link:nth-child(3) {
        display: none;
    }
}

@media screen and (max-width: 650px) {
    .header-link {
        font-size: 14px;
        line-height: 18px;
        padding: 16px;
        padding-left: 20px;
    }

    .header-link:first-child::after{
        right: -15% !important;
    }

    .header-link:after {
        right: -11%;
    }

    .connect-btn {
        padding: 12px;
    }

    .connect-btn span{
        font-size: 12px;
    }
}

@media screen and (max-width: 530px) {
    .connect-btn span {
        margin: 0;
    }
    .chainName, .connect-btn img {
        display: none;
    }
}

@media screen and (max-width: 400px) {
    .header-link {
        font-size: 12px;
        line-height: 18px;
        padding: 16px;
        padding-left: 20px;
    }
}
</style>
