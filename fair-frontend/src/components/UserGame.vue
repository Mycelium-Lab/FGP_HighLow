<template>
  <div class="usergame">
    <div class="usergame_info">
        <div v-if="luckyNumber !== 0" class="usergame_info-row">
            <span class="info-row-title">Lucky number: </span><span class="info-row-value">{{luckyNumber}}</span>
        </div>
        <div class="usergame_info-row">
            <span class="info-row-title">Bid: </span><span class="info-row-value">{{bidInTokens}}</span>
        </div>
        <div class="usergame_info-row">
            <span class="info-row-title">Datetime: </span><span class="info-row-value">{{timestampAsDate}}</span>
        </div>
        <div class="usergame_info-row">
            <span class="info-row-title">Players: </span><span class="info-row-value">{{timestampAsDate}}</span>
        </div>
        <div class="usergame_info-row">
            <span class="info-row-title">Prize pool: </span><span class="info-row-value orange">{{wholePool}} ROSE</span>
        </div>
    </div>
    <div v-if="realStatus === 'finished'||realStatus === 'readyToFinish'" class="usergame-btn-wrapper">
        <button @click="handleFinishOrClaim()" class="usergame_btn">
            <span class="btn_title">{{ usergamebtn_txt }}</span>
            <span class="btn_caption">{{ usergamebtn_secondary }}</span>
        </button>
    </div>
  </div>
</template>

<script>
import {ethers} from 'ethers'
import store from '../store'

export default {
  name: 'UserGame',
  store,
  components: {
  },
  data () {
    return {
        realStatus: '',
        usergamebtn_txt: '',
        usergamebtn_secondary: ''
    }
  },
  created () {
    this.getStatus()
  },
  computed: {
    bidInTokens: function() {
        return ethers.utils.formatEther(this.bid)
    },
    timestampAsDate: function() {
        return new Date(this.timestamp * 1000).toLocaleString('en-US')
    },
    wholePool: function() {
        return this.bidInTokens * this.participants
    },
    contract: function() {
        return this.$store.state.fairContract
    },
    address: function() {
        return this.$store.state.user
    }
  },
  props: {
    bid: String,
    timestamp: String,
    participants: String,
    status: String,
    id: String,
    pool: String,
    luckyNumber: String
  },
  methods: {
    getStatus() {
        if (this.status == 0) {
            this.realStatus = 'claimed'
            console.log(this.status, this.luckyNumber)
        } else if (this.status == 1) {
            this.realStatus = 'finished'
            this.usergamebtn_txt = 'Claim'
            console.log(this.pool)
            this.usergamebtn_secondary = ethers.utils.formatEther((this.pool).toString()) + ' tokens'
        } else if (this.status == 2) {
            this.realStatus = 'readyToFinish'
            this.usergamebtn_txt = 'Finish'
        } else {
            this.realStatus = 'progress'
        }
    },
    async handleFinishOrClaim() {
        const contract = this.contract;
        const address = this.address;
        const id = this.id
        if (window.ethereum && address && contract
            && this.realStatus === 'readyToFinish'
        ) {
            try {
                await contract.methods.finishGame(id).send({from: address}, async (err, transactionHash) => {
                    if (err) {
                        console.log(err);
                    }
                    if (transactionHash) {
                        console.log(transactionHash);
                        try {
                            await contract.methods.claim(id).send({from: address}, (err, transactionHash) => {
                                if(err) {
                                    console.log(err);
                                }
                                if(transactionHash) {
                                    console.log(transactionHash)
                                }
                            })
                        } catch(err) {
                            console.log("error: ", err)
                        }
                    }
                });
            } catch(err) {
                console.log("error: ", err)
            }
        } else if (window.ethereum && address && contract
        && this.realStatus === 'finished'
        ) {
            try {
                await contract.methods.claim(id).send({from: address}, (err, transactionHash) => {
                    if(err) {
                        console.log(err);
                    }
                    if(transactionHash) {
                        console.log(transactionHash)
                    }
                })
            } catch(err) {
                console.log("error: ", err)
            }
        }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.usergame {
    max-width: 1010px;
    -webkit-box-shadow: 10px 10px 0px 0px rgba(0, 0, 0, 0.9);
    -moz-box-shadow: 10px 10px 0px 0px rgba(0, 0, 0, 0.9);
    box-shadow: 10px 10px 0px 0px rgba(0, 0, 0, 0.9);
    background: #EEEEEE;
    border: 8px solid #000000;
    display: flex;
    flex-direction: row;
    min-width: 80%;
    margin-bottom: 28px;
    padding: 40px 50px;
}

.usergame_info {
    width: 50%;
}

.usergame-btn-wrapper {
    width: 50%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}

.usergame_btn {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #699BF7;
    min-width: 96px;
    min-height: 96px;
    border: 0;
    -webkit-box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.9);
    -moz-box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.9);
    box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.9);
    padding: 12px 20px;
    cursor: pointer;
}

.usergame_info-row {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin: 9px;
}

.info-row-title {
    width: 35%;
    font-family: 'Orbitron';
    font-style: normal;
    font-weight: 700;
    font-size: 14px;
    line-height: 18px;
    color: #2C2F33;
}

.info-row-value {
    width: 65%;
    font-family: 'Orbitron';
    font-style: normal;
    font-weight: 800;
    font-size: 15px;
    line-height: 19px;
    color: #000000;
}

.btn_title {
    font-family: 'Press Start 2P';
    font-style: normal;
    font-weight: 400;
    font-size: 15px;
    line-height: 15px;
    color: #000000;
    margin-bottom: 8px;
}

.btn_caption {
    font-family: 'Press Start 2P';
    font-style: normal;
    font-weight: 400;
    font-size: 10px;
    line-height: 10px;
    color: #000000;
}

.orange {
    color: #F27C2F;
}
</style>
