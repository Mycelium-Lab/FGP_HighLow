<template>
    <div v-if="timeToFinish > 0 || joined === true" class="currentgame">
        <div class="currentgame_info">
            <div class="info_row">
                <span class="info_row-title">Bid: </span><span class="info_row-value">{{bidInTokens}} ROSE</span>
            </div>
            <div class="info_row">
                <span class="info_row-title">Before the start: </span><span class="info_row-value">{{timeToFinish}}</span>
            </div>
            <div class="info_row">
                <span class="info_row-title">Number of players: </span><span class="info_row-value">{{participants}} / {{processedLimit}}</span>
            </div>
            <div v-if="joined === false && participants != limit" class="info_row">
                <span class="info_row-title">Your number: </span><input class="info_row-input" type="text" v-model="number"/>
            </div>
            <div v-else-if="participants != limit" class="info_row">
                <span class="info_row-title">Your number: </span><span class="info_row-value">{{chosenNumber}}</span>
            </div>
            <div v-if="bets[0]" class="info_row">
                <span class="info_row-title">Current bets: </span><span class="info_row-value">{{bets}}</span>
            </div>
        </div>
        <div class="button-wrapper">
            <button v-bind:class="{joinbtndisabled: ownedGame === true || participants == limit, joinbtnwaiting: ownedGame === false && joined === true}" @click="handleJoin()" class="join_btn">{{joinbtn_text}}</button>
        </div>
    </div>
</template>

<script>
import {BigNumber, ethers} from 'ethers'
import emitter from '../main'

export default {
    name: 'ActiveGame',
    data () {
        return {
            currentTime: Date.now(),
            number: '',
            joinbtn_text: '',
            ownedGame: false,
            bets: []
        }
    },
    props: {
        bid: String,
        timestamp: String,
        participants: String,
        id: String,
        owner: String,
        joined: Boolean,
        chosenNumber: String,
        limit: String
    },
    created() {
        this.setJoinBtnText();
        this.getBets();
    },
    computed: {
        web3: function() {
            return this.$store.state.web3;
        },
        processedLimit: function() {
            if (this.limit != 0) {
                return this.limit
            } else {
                return '~'
            }
        },
        contract: function() {
            return this.$store.state.fairContract;
        },
        address: function() {
            return this.$store.state.user;
        },
        bidInTokens: function() {
            return ethers.utils.formatEther(this.bid)
        },
        currentTimestamp: function() {
            return Math.round(this.currentTime / 1000);
        },
        timeToFinish: function() {
            const time = Number(this.timestamp) + 300 - this.currentTimestamp
            if (time > 0) {
                return time
            } else {
                return 0
            }
        }
    },
    methods: {
        handleJoin: async function() {
            const contract = this.contract;
            const address = this.address;
            const number = this.number;
            const id = this.id
            const bid = this.bidInTokens;
            if (window.ethereum && address && contract
                && (number > 0 && number < 101)
                && this.joined === false
                && this.bets.indexOf(number) === -1
            ) {
                this.$store.commit('SET_MODAL', true)
                this.$store.commit('SET_TITLE', 'Bid information')
                this.$store.commit('SET_TYPE', 'info')
                this.$store.commit('SET_CAPTION', 'Confirm this transaction in your wallet')
                try{
                await contract.methods.joinGame(id, BigNumber.from(number)).send({from: address, value: ethers.utils.parseEther((bid).toString())}, (err, transactionHash) => {
                    if (err) {
                    console.log(err);
                    }
                    if (transactionHash) {
                    emitter.emit('animateProgressBar')
                    console.log(transactionHash);
                    }
                }).then(() => {
                    this.$store.commit('SET_MODAL', false)
                    this.$store.commit('SET_TITLE', '')
                    this.$store.commit('SET_TYPE', '')
                    this.$store.commit('SET_CAPTION', '')
                });
                } catch(err) {
                    console.log("error: ", err)
                }
            }
        },
        setJoinBtnText: function () {
            if (this.owner === this.address) {
                this.joinbtn_text = 'Your game';
                this.ownedGame = true;
            } else if (this.joined === false && this.timeToFinish > 0) {
                this.joinbtn_text = 'Join'
            } else if (this.joined === true) {
                this.joinbtn_text = 'Waiting'
            }
        },
        getBets: async function() {
            const contract = this.contract;
            const id = this.id;
            let bets = await contract.methods.getNumbers(id).call();
            this.bets = bets;
        }
    }
}
</script>

<style scoped>
.currentgame {
    display: flex;
    flex-direction: row;
    background: #EEEEEE;
    border: 8px solid #000000;
    -webkit-box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 0.9);
    -moz-box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 0.9);
    box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 0.9);
    padding: 42px 46px;
    max-width: 500px;
    width: 100%;
    min-height: 295px;
    box-sizing: border-box;
}

.currentgame_info {
    width: 66%;
}

.join_btn {
    height: 89px;
    background: 0;
    padding: 12px 24px;
    width: 153px;
    background-image: url('../assets/icons/join.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    border: 0;
    cursor: pointer;
    font-family: 'Press Start 2P';
    font-style: normal;
    font-weight: 400;
    font-size: 15px;
    line-height: 15px;
    color: #000000;
}

.join_btn:hover {
    animation: blink 2s infinite ease-in-out;
}

.joinbtndisabled {
    background-image: url('../assets/icons/your.png');
}

.joinbtnwaiting {
    background-image: url('../assets/icons/wait.png');
}

@keyframes blink {
    0% {
        transform: scale(1);
    }
    25% {
       transform: scale(1.1); 
    }
    100% {
        transform: scale(1);
    }
}

.info_row {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    width: 100%;
}

.info_row-title {
    width: 60%;
    font-family: 'Orbitron';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 18px;
    color: #2C2F33;
    margin-right: 12px;
}

.info_row-value {
    width: 40%;
    font-family: 'Orbitron';
    font-style: normal;
    font-weight: 800;
    font-size: 15px;
    line-height: 19px;
    color: #000000;
}

.info_row-input {
    width: 35%;
    background-color: #EEEEEE;
    border: 1px solid #000000;
    margin-right: 5%;
    font-family: 'Orbitron';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 18px;
    color: #000000;
    margin-right: 12px;
}

.button-wrapper {
    margin-left: 5%;
    width: 28%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

@media screen and (max-width: 600px) {
    .currentgame {
        padding: 16px 24px;
        min-height: 166px;
    }

    .join_btn {
        height: 55px;
        width: auto;
        max-width: 100px;
        font-size: 12px;
        line-height: 12px;
        padding: 10px;
    }

    .info_row {
        padding: 4px;
    }

    .info_row-title {
        font-size: 10px;
        line-height: 13px;
    }

    .info_row-value {
        font-size: 10px;
        line-height: 13px;
    }
}
</style>