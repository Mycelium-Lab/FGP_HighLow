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
    margin-bottom: 2px;
    margin-top: 36px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 54px;
    box-sizing: border-box;
    position: relative;
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
    height: 51.5px;
    max-height: 51.5px;
    padding: 14px;
    padding-left: 46px;
    padding-right: 0;
    text-decoration: none;
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    font-size: 18px;
    box-sizing: border-box;
    position: relative;
    display: inline-block;
    transition: 0.2s;
}
.header-link:hover {
    transition: 0.2s;
    color: #DF7F31 !important;
}
.header-link:first-child::after{
    right: -26% !important;
}
.header-link:nth-child(2)::after{
    right: -19% !important;
}
.header-link:after {
    border: 3px solid #F27C2F;
	position: absolute;
    max-height: 51.5px;
	z-index: -1;
	content: "";
    right: -17%;
    top: -5%;
	height: 100%;
	width: 100%;
	background-color: inherit;
	-webkit-transform: skewX(-45deg);
	-moz-transform: skewX(-45deg);
	-ms-transform: skewX(-45deg);
	transform: skewX(-45deg);
}
.connect-btn {
    height: 100%;
    height: 57px;
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
    transition: 0.2s;
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
        padding-top: 16px;
        padding-right: 8px;
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

@media screen and (max-width: 460px) {
    .header-link {
        font-size: 10px;
        line-height: 18px;
        padding: 15px;
        padding-right: 14px;
        padding-left: 26px;
    }

    .nav, header {
        height: 31.5px;
    }

    header {
        background-color: #F5F5F5;
        z-index: 1001;
        margin-bottom: 0;
    }

    .header-link:first-child::after{
        right: -12% !important;
    }
    .header-link:nth-child(2)::after{
        right: -10% !important;
    }
    .header-link:after {
        border: 3px solid #F27C2F;
        position: absolute;
        max-height: 28.5px;
        z-index: -1;
        content: "";
        right: -17%;
        top: 17%;
        height: 100%;
        width: 100%;
        background-color: inherit;
        -webkit-transform: skewX(-30deg);
        -moz-transform: skewX(-30deg);
        -ms-transform: skewX(-30deg);
        transform: skewX(-30deg);
    }

    .connect-btn {
        max-height: 17.5px;
        padding: 6px 4px;
        box-sizing: content-box;
        height: 25.5px !important;
    }
}
</style>
