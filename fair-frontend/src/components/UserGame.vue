<template>
  <div class="usergame">
    {{status}}
    <div class="usergame_info">
        <div v-if="luckyNumber != 0" class="usergame_info-row">
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
        <div v-if="winners[0]" class="usergame_info-row playersrow">
            <div class="info-row-title"></div>
            <div class="playersrow_table">
                <div class="table-winners">
                    <div class="table-title">Winners: </div>
                    <div class="player winner" v-for="winner in winners" :key="winner.account">
                        <span class="account">{{winner.account}}: </span><span class="bet">bet on {{winner.bet}},</span><span class="reward"> won {{winner.reward}} tokens</span>
                    </div>
                </div>
                <div class="table-losers">
                    <div class="table-title">Losers: </div>
                    <div class="player loser" v-for="loser in losers" :key="loser.account">
                        <span class="account">{{loser.account}}: </span><span class="bet">bet on {{loser.bet}},</span><span class="reward"> won {{loser.reward}} tokens</span>
                    </div>
                </div>
            </div>
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
        usergamebtn_secondary: '',
        playersData: [],
        winners: [],
        losers: []
    }
  },
  created () {
    this.getStatus()
    console.log(this.status);
    this.getPrizes()
  },
  computed: {
    bidInTokens: function() {
        return ethers.utils.formatEther(this.bid)
    },
    timestampAsDate: function() {
        return new Date(this.timestamp * 1000).toLocaleString('en-US')
    },
    wholePool: function() {
        return Number(this.bidInTokens * this.participants).toFixed(2)
    },
    contract: function() {
        return this.$store.state.fairContract
    },
    address: function() {
        return this.$store.state.user
    },
    prizeInTokens: function() {
        return ethers.utils.formatEther((this.prize).toString())
    }
  },
  props: {
    bid: String,
    timestamp: String,
    participants: String,
    status: String,
    id: String,
    pool: String,
    luckyNumber: String,
    prize: String
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
            this.usergamebtn_secondary = Number(this.prizeInTokens).toFixed(2) + ' tokens'
        } else if (this.status == 2) {
            this.realStatus = 'readyToFinish'
            this.usergamebtn_txt = 'Finish'
        } else {
            this.realStatus = 'progress'
        }
    },
    async getPrizes() {
        const contract = this.contract;
        // const address = this.address;
        const id = this.id;
        console.log('101');
        console.log(id);
        console.log(contract.methods.getPrizes(id).call());
        let prizesList = await contract.methods.getPrizes(id).call();
        console.log(prizesList);
        const winnersInfo = [];
        const losersInfo = [];
        console.log(prizesList['0']);
        for (let i = 0; i < prizesList['0'].length; i++) {
            if (prizesList['0'][i] > 0) {
                winnersInfo.push({
                    reward: Number(ethers.utils.formatEther((prizesList['0'][i]).toString())).toFixed(2),
                    account: prizesList['1'][i].slice(0, 6) + '...' + prizesList['1'][i].slice(prizesList['1'][i].length - 4, prizesList['1'][i].length),
                    bet: prizesList['2'][i]
                })
            }
            else {
                losersInfo.push({
                    reward: 0,
                    account: prizesList['1'][i].slice(0, 6) + '...' + prizesList['1'][i].slice(prizesList['1'][i].length - 4, prizesList['1'][i].length),
                    bet: prizesList['2'][i],
                })
            }
        }
        let sortedWinners = winnersInfo.sort(({reward:a}, {reward:b}) => b-a);
        this.winners = sortedWinners;
        this.losers = losersInfo;
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
    width: 65%;
}

.usergame-btn-wrapper {
    width: 35%;
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
    margin: 17px;
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

.playersrow_table {
    width: 65%;
}

.player {
    position: relative;
    padding-left: 14px;
}

.player::before {
    position: absolute;
    content: '·';
    left: 0;
}
.player, .table-title {
    font-family: 'Orbitron';
    font-style: normal;
    font-weight: 800;
    font-size: 15px;
    line-height: 19px;
    color: #000000;
}

.table-winners .table-title {
    color: #84D06E;
    margin-bottom: 4px;
}

.table-losers .table-title {
    margin-top: 18px;
    color: #FF5C5C;
    margin-bottom: 4px;
}

@media screen and (max-width: 1000px) {
    .usergame {
        flex-direction: column;
        align-items: center;
    }

    .usergame_info {
        width: 100%;
    }

    .usergame-btn-wrapper {
        width: 100%;
        justify-content: center;
    }

    .usergame_btn {
        width: 100%;
    }
}

@media screen and (max-width: 500px) {
    .usergame_info-row {
        margin-left: 0;
    }

    .info-row-title {
        font-size: 10px;
        line-height: 13px;
    }

    .info-row-value {
        font-size: 10px;
        line-height: 13px;
    }

    .usergame {
        padding: 20px 21px;
    }

    .usergame_btn {
        padding: 14px;
        min-height: 40px;
    }

    .btn_title {
        font-size: 14px;
        line-height: 14px;
    }

    .btn_caption {
        font-size: 10px;
        line-height: 10px;
    }
}
</style>
