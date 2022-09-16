<template>
    <div v-bind:class="{modalActive: active}" class="modal">
        <div v-if="active" class="modal-box">
            <div class="modal-header">
                <div></div>
                <img class="closebtn" @click="handleClose()" src="../assets/icons/x.png">
            </div>
            <div class="modal-body">
                <h1>{{ modalTitle }}</h1>
                <h2 v-if="modalType === 'info'||modalType === 'confirm'">{{ modalCaption }}</h2>
                <div v-if="modalType === 'rules'" class="modal-rules">
                    <span class="modal-rule">1. Any user can create a new game by placing a bet in tokens and choosing a random number from 0 to 100;</span>
                    <span class="modal-rule">2. The game is created. During 1 minutes other users can join this game by choosing their number (they can choose the same number as the game creator). In doing so, they will need to make the same bet as the creator of the game (because the creator of the game sets the bet for any players wishing to join it);</span>
                    <span class="modal-rule">3. The game creator can limit the number of participants in the game, if desired;</span>
                    <span class="modal-rule">4. After 5 minute the game starts and ends. The computer randomly chooses a number. Users, whose number was closest to the number selected by the computer - won. Users, whose figure was farthest from the number selected by the computer - lost;</span>
                    <span class="modal-rule modal-specialrule">The winners are 30% of users who made the closest bet to the number chosen by the computer (but not less than 1 person), the rest - lost.</span>
                    <span class="modal-rule">5. Bets made by users form a prize pool. At the end of the game the prize pool is distributed equally among the winners.</span>
                </div>
                <div id="gameover-win-base" v-if="modalType === 'gameover-win'">
                    <div class="gameover-win">
                        <div class="gameover-win-elem" id="gameover-win-elem-text">
                            <p id="gameover-win-text">You WIN!</p>
                            <p id="gameover-win-second-text">You <span id="gameover-win-tokens">won {{modalAmount}} Tokens</span></p>
                        </div>
                        <div class="gameover-win-elem">
                            <img class="maskot" src="../assets/maskot.png">
                        </div>
                    </div>
                    <button @click="handleClaim()" id="claim">CLAIM</button>
                </div>
                <div id="gameover-win-lose" v-if="modalType === 'gameover-lose'">
                    <img class="maskot" src="../assets/maskot.png">
                    <p id="gameover-lose-text">You LOSE!</p>
                </div>
                <img class="maskot" v-if="modalType === 'rules'||(modalType === 'info' && this.inProgress === false)" src="../assets/maskot.png">
                <img class="load" v-else-if="modalType === 'info' && this.inProgress === true" src="../assets/icons/time.png">
                <div v-if="modalType === 'confirm'" class="button-wrapper">
                    <button @click="handleClose()" class="modalbtn">NO</button>
                    <button @click="confirmNewBet()" class="modalbtn orange">YES</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import store from '../store'
import emitter from '../main'

export default {
    name: 'CustomModal',
    store,
    data () {
        return {
            inProgress: false
        }
    },
    created() {
        emitter.on('animateProgressBar', () => {
            this.progress()
        })
        emitter.on('finishProgress', () => {
            this.endProgress()
        })
    },
    computed: {
        modalTitle: function() {
            return this.$store.state.modalTitle
        },
        modalType: function() {
            return this.$store.state.modalType
        },
        modalAmount: function() {
            return this.$store.state.modalAmount
        },
        modalCaption: function() {
            return this.$store.state.modalCaption
        },
        active: function() {
            return this.$store.state.modal
        },
        contract: function() {
            return this.$store.state.fairContract
        },
        address: function() {
            return this.$store.state.user
        },
        id: function() {
            return this.$store.state.modalFinishID
        },
    },
    methods: {
        handleClose() {
            this.$store.commit('SET_MODAL', false)
            this.$store.commit('SET_TITLE', '')
            this.$store.commit('SET_TYPE', '')
            this.$store.commit('SET_CAPTION', '')
            this.$store.commit('SET_AMOUNT', '')
            this.$store.commit('SET_FINISH_ID', '')
        },
        confirmNewBet() {
            emitter.emit('confirmNewGame')
        },
        progress() {
            console.log(this.inProgress)
            this.inProgress = true
            console.log(this.inProgress)
        },
        endProgress() {
            this.inProgress = false
        },
        async handleClaim() {
            this.$store.commit('SET_MODAL', true)
            this.$store.commit('SET_TITLE', 'Bid information')
            this.$store.commit('SET_TYPE', 'info')
            this.$store.commit('SET_CAPTION', 'Confirm this transaction in your wallet')
            const contract = this.contract;
            const address = this.address;
            const id = this.id
            try {
                await contract.methods.claim(id).send({from: address}, (err, transactionHash) => {
                    if(err) {
                        console.log(err);
                        this.$store.commit('SET_MODAL', false)
                        this.$store.commit('SET_TITLE', '')
                        this.$store.commit('SET_TYPE', '')
                        this.$store.commit('SET_CAPTION', '')
                        this.$store.commit('SET_FINISH_ID', '')
                    }
                    if(transactionHash) {
                        emitter.emit('animateProgressBar')
                        console.log(transactionHash)
                    }
                }).then(() => {
                    this.$store.commit('SET_MODAL', false)
                    this.$store.commit('SET_TITLE', '')
                    this.$store.commit('SET_TYPE', '')
                    this.$store.commit('SET_CAPTION', '')
                    this.$store.commit('SET_FINISH_ID', '')
                    emitter.emit('finishProgress')
                })
            } catch(err) {
                this.$store.commit('SET_MODAL', false)
                this.$store.commit('SET_TITLE', '')
                this.$store.commit('SET_TYPE', '')
                this.$store.commit('SET_CAPTION', '')
                this.$store.commit('SET_FINISH_ID', '')
                console.log("error: ", err)
            }
        }
    }
}
</script>

<style scoped>
#gameover-win-base {
    margin-bottom: 30px;
    
}

#gameover-win-lose {
    margin:auto;
    text-align: center;
}

.gameover-win {
    overflow: hidden;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
}

.gameover-win-elem {
    /* width: 150px;
    height: 120px; */
    display: inline-block;
    text-align: left;
    padding: 10px;
    font-family: 'Press Start 2P';
    font-style: normal;
}

#gameover-win-elem-text{
    margin: auto;
    max-width: 500px
}

#gameover-win-elem-text p {
    margin: 25px;
}

#gameover-win-text {
    color: #84D06E;
    font-size: 32px;
    font-weight: 500;
}

#gameover-lose-text {
    color: #F27C2F;
    font-size: larger;
    font-family: 'Press Start 2P';
    font-style: normal;
    margin-bottom: 10px;
}

#gameover-win-second-text {
    font-family: 'Orbitron';
    font-size: 30px;
    font-weight: 700;
}

#gameover-win-tokens {
    color: #F27C2F;
}

#claim {
    background-color: #F27C2F;
    margin: auto;
    height: 40px;
    width: 25%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-family: 'Press Start 2P';
    font-style: normal;
    font-weight: 200;
    font-size: 20px;
    -webkit-box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
    -moz-box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
    box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.9);
    background: #F27C2F;
}

#claim:hover {
    transition: 0.2s;
    -webkit-box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
    -moz-box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
    box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
}

h1 {
    margin-top: 32px;
    margin-bottom: 32px;
    text-align: center;
}
h2 {
    font-family: 'Orbitron';
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 25px;
    color: #2C2F33;
    text-align: center;
}
.modal {
    display: none;
    overflow-y: scroll;
    z-index: 1000;
}
.modalActive {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    position: fixed;
    width: 100%;
    min-height: 100vh;
    height: 100%;
    background-color: rgba(0,0,0,0.3)
}
.modal-box {
    z-index: 1050;
    max-width: 1010px;
    margin-top: 128px;
    margin-bottom: 128px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 75%;
    background: #ffffff;
    min-height: 300px;
    border: 8px solid #000000;}

.modal-header {
    padding: 14px;
    padding-top: 6px;
    padding-left: 6px;
    padding-right: 6px;
    box-sizing: border-box;
    width: 100%;
    background: #000000;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.modal-body {
    padding-left: 5%;
    padding-right: 5%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.modal-rules {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.modal-rule {
    margin: 24px;
    font-family: 'Orbitron';
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 25px;
    text-align: center;
    color: #2C2F33;
}

.modal-specialrule {
    color: #F27C2F !important;
}

.modal-rule::first-letter {
    color: #F27C2F;
}

.load {
    margin-top: 32px;
    animation: spin 1s infinite ease-in-out;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    50% {
        transform: rotate(180deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.maskot {
    margin-top: 32px;
    margin-bottom: 64px;
    width: 100px;
    min-width: 150px;
}

.closebtn {
    cursor: pointer;
}

.button-wrapper {
    margin-top: 16px;
}

.modalbtn {
    font-family: 'Press Start 2P';
    font-style: normal;
    font-weight: 400;
    font-size: 15px;
    line-height: 15px;
    color: #000000;
    padding: 13px 20px;
    border: 0;
    margin: 6px;
    -webkit-box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.9);
    -moz-box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.9);
    box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.9);
    cursor: pointer;
    transition: 0.4s;
}

.modalbtn:hover {
    transition: 0.4s;
    background: #F27C2F;
    transform: scale(1.1);
    -webkit-box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
    -moz-box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
    box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.9);
}

.orange {
    background: #F27C2F;
}


@media screen and (max-width: 1000px) {
    h1 {
        font-size: 16px !important;
    }

    h2 {
        font-size: 14px !important;
    }

    .modal-box {
        max-width: 90%;
    }

    .maskot {
        width: 50%;
    }

    .modal-rule {
        font-size: 13px;
        line-height: 16px;
        margin: 14px;
    }
}
</style>