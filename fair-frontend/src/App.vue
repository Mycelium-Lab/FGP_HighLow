<template>
  <div class="fair-home-wrapper">
    <div class="fair-home">
      <HeaderComponent></HeaderComponent>
      <router-view/>
    </div>
    <CustomModal></CustomModal>
  </div>
</template>

<script>
import HeaderComponent from './components/HeaderComponent.vue'
import CustomModal from './components/CustomModal.vue'
import {ethers} from 'ethers'
import store from './store/index.js'
import Web3 from 'web3'
import network from './constants/chainId.json'
import Web3Modal, { connectors } from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Fair from './abis/Fair.json'


export default {
  name: 'App',
  store,
  components: {
    HeaderComponent,
    CustomModal
  },
  data () {
    return {
      accountShorted: '',
      account: '',
      subscribed: false
    }
  },
  computed: {
    balance: function () {
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
    },
    pastGames: function() {
      return this.$store.state.pastGames;
    },
    currentChain: function() {
      return this.$store.state.web3.currentProvider.chainId;
    }
  },
  async created() {
    this.launchApp()
  },
  methods: {
    async launchApp() {
      const web3 = new Web3(window.ethereum);
      this.$store.commit('SET_WEB3', web3);
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider
        },
        'custom-injected': {
          display: {
            logo: 'https://cdn.bitkeep.vip/u_b_69b66a00-a046-11ec-a3eb-f758fa002ae8.png',
            name: 'BitKeep',
            description: 'Connect to your BitKeep Wallet'
          },
          package: connectors.injected,
          connector: async (ProviderPackage, options) => {
            const provider = new ProviderPackage(options)
            return provider
          }
        }
      }

      this.web3Modal = new Web3Modal({
        providerOptions,
        cacheProvider: true,
        theme: 'dark'
      })
      let provider
      provider = await this.web3Modal.connect()
      this.metamaskProvider = new ethers.providers.Web3Provider(provider)
      await this.$store.dispatch('fetchFairContract', store.state)
      await this.checkMetamaskConnect().then(() => {
        this.fairApp()
      });
    },
    async checkMetamaskConnect() {
      if (window.ethereum) {
        if (this.currentChain === network.chainId) {
        // if (this.currentChain === network.chainIdTestnet) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const isMetaMaskConnected = async () => {
            let accounts = await provider.listAccounts();
            if(accounts.length> 0)
            {
              this.account = accounts[0]
              this.$store.commit('SET_USER', accounts[0])
              this.accountShorted = accounts[0].slice(0, 6) + '...' + accounts[0].slice(accounts[0].length - 4, accounts[0].length)
              this.$store.commit('SET_SHORTED', this.accountShorted)
            }
            else {
              this.connectWallet();
            }
            return accounts.length > 0;
          }
          await isMetaMaskConnected().then((connected) => {
            if (connected) {
              this.isMetaMaskConnected = true;
            } else {
              this.isMetaMaskConnected = false;
            }
          })
        } else {
          try {
            await this.web3.currentProvider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: network.chainId }]
            }).then(() => {
              location.reload()
            });
          } catch (error) {
            if (typeof window !== 'undefined') {
                window.ethereum.request({
                    jsonrpc: '2.0',
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: network.chainId,
                            chainName: 'Emerald Paratime Mainnet',
                            rpcUrls: ['https://emerald.oasis.dev'],
                            nativeCurrency: {
                                name: 'ROSE',
                                symbol: 'ROSE',
                                decimals: 18
                            },
                            blockExplorerUrls: ['https://explorer.emerald.oasis.dev']
                        }
                    ],
                    id: 0
                }).then(() => {
                  location.reload()
                });
                // window.ethereum.request({
                //     jsonrpc: '2.0',
                //     method: 'wallet_addEthereumChain',
                //     params: [
                //         {
                //             chainId: network.chainIdTest,
                //             chainName: 'Emerald Paratime Testnet',
                //             rpcUrls: ['https://testnet.emerald.oasis.dev'],
                //             nativeCurrency: {
                //                 name: 'ROSE',
                //                 symbol: 'ROSE',
                //                 decimals: 18
                //             },
                //             blockExplorerUrls: ['https://testnet.explorer.emerald.oasis.dev']
                //         }
                //     ],
                //     id: 0
                // }).then(() => {
                //   location.reload()
                // });
            }
            // alert(error.message);
          }
        }
      } else {
        this.$store.commit('SET_MODAL', true)
        this.$store.commit('SET_TITLE', 'Alert')
        this.$store.commit('SET_TYPE', 'info')
        this.$store.commit('SET_CAPTION', 'Please, connect your wallet')
      }
    },

    async fairApp() {
      const web3 = this.web3;
      const contract = this.contract;
      const address = this.address;

      if (contract === null || address === null) {
        await this.reconnect()
        await this.checkMetamaskConnect()
        return
      }
      else {
        await this.listenForGameEnd()
        await this.displayBalance(web3, address);
        await this.getUserGames(contract, address)
        this.getActualGames(contract, address)
        if (this.subscribed !== true) {
          this.getGamesInfinitely(contract, address)
        }
      }
      return
    },

    async reconnect() {
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider
        },
        'custom-injected': {
          display: {
            logo: 'https://cdn.bitkeep.vip/u_b_69b66a00-a046-11ec-a3eb-f758fa002ae8.png',
            name: 'BitKeep',
            description: 'Connect to your BitKeep Wallet'
          },
          package: connectors.injected,
          connector: async (ProviderPackage, options) => {
            const provider = new ProviderPackage(options)
            return provider
          }
        }
      }
      this.web3Modal = new Web3Modal({
        providerOptions,
        cacheProvider: true,
        theme: 'dark'
      })
      let provider
      provider = await this.web3Modal.connect()
      this.metamaskProvider = new ethers.providers.Web3Provider(provider)
    },

    async getGamesInfinitely() {
      this.subscribed = true
      const contract = this.contract
      const address = this.address
      setTimeout(async () => {
        this.getGamesInfinitely()
        await this.getUserGames(contract, address)
        this.getActualGames(contract, address)
      }, 5000)
    },

    async displayBalance(web3, address) {
        try {
            web3.eth.getBalance(address).then((balanceInWei) => {
                const balance = web3.utils.fromWei(balanceInWei);
                this.$store.commit('SET_BALANCE', balance)
            });
        }
        catch (error) {
            console.log(error);
        }
    },

    async getActualGames(contract, address) {
      const games = await contract.methods.getActualGames().call();
      const actualGamesList = [];
      const chunkSize = 5;
      for (let i = 0; i < games.length; i += chunkSize) {
        const chunk = games.slice(i, i + chunkSize);
        chunk[5] = await contract.methods.getOwner(chunk[3]).call();
        const index = this.pastGames.findIndex(obj => {return obj[4] === chunk[3]})
        if (index !== -1) {
          chunk[6] = true
          const res = await contract.methods.getBet(chunk[3], address).call();
          chunk[7] = res
        } else {
          chunk[6] = false
        }
        if (Number(chunk[1]) !== 0) {
            actualGamesList.push(chunk);
        }
      }
      const emptiedGamesList = [];
      for (let i = 0; i < actualGamesList.length; i++) {
        const arr = []
        emptiedGamesList.push(arr)
      }
      await this.$store.commit('SET_GAMES', emptiedGamesList);
      await this.$store.commit('SET_GAMES', actualGamesList);
    },

    async getUserGames (contract, address) {
      let result = await contract.methods.getUserGames(address).call();
      const pastGamesList = [];
      const chunkSize = 8;
      for (let i = 0; i < result.length; i += chunkSize) {
          const chunk = result.slice(i, i + chunkSize);
          pastGamesList.push(chunk);
      }
      const emptiedGamesList = [];
      for (let i = 0; i < pastGamesList.length; i++) {
        const arr = []
        emptiedGamesList.push(arr)
      }
      await this.$store.commit('SET_PAST_GAMES', emptiedGamesList)
      await this.$store.commit('SET_PAST_GAMES', pastGamesList);
    },

    async connectWallet() {
      if (this.metamaskProvider.provider._events.accountsChanged === undefined) {
        this.metamaskProvider.provider.on('accountsChanged', (accounts) => {
          this.$store.commit('SET_USER', accounts[0])
        })
      }
      const address = (await this.metamaskProvider.listAccounts())[0]
      if (address !== null && address !== undefined) {
        this.$store.commit('SET_USER', address)
      }
    },

    async listenForGameEnd() {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner()
      const _contract = new ethers.Contract(this.$store.state.fairAddress, Fair.abi, signer)
      _contract.on("FinishGame", async (gameId, winners, prizes) => {
        const gameParticipatedFlag = (await _contract.biddersList(gameId.toString(), signer.getAddress())).participatedFlag
        if (gameParticipatedFlag) {
          const address = await signer.getAddress()
          const winnerClaimed = await _contract.prizeList(address, gameId.toString())
          if (winnerClaimed.isClaimed == false) {
              if (winners.includes(address)) {
                const index = winners.indexOf(address)
                const prize = prizes[index].toString()
                this.$store.commit('SET_MODAL', true)
                this.$store.commit('SET_TITLE', 'Game over')
                this.$store.commit('SET_TYPE', 'gameover-win')
                this.$store.commit('SET_AMOUNT', ethers.utils.formatEther(prize))
                this.$store.commit('SET_FINISH_ID', gameId.toString())
                // this.$store.commit('SET_AMOUNT', ethers.utils.formatEther('10700000000000000000'))
                // this.$store.commit('SET_FINISH_ID', '0')
              } else {
                this.$store.commit('SET_MODAL', true)
                this.$store.commit('SET_TITLE', 'Game over')
                this.$store.commit('SET_TYPE', 'gameover-lose')
              }
          }
        }
      })
     
    }
  }
}
</script>

<style>
a {
  color: unset;
}
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Press+Start+2P&display=swap');
* {
  margin: 0;
  padding: 0;
  /*scrollbar-width: none;*/
}

*::-webkit-scrollbar {
  display: none;
}

h1 {
  font-family: 'Press Start 2P';
  font-style: normal;
  font-weight: 400;
  font-size: 25px;
  line-height: 25px;
  color: #000000;
}
body {
  background: #F5F5F5;
}

#app {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.fair-home-wrapper {
  width: calc(100vw - 70px);
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fair-home {
  position: relative;
  display: flex;
  flex-direction: column;
  width: calc(100% - 70px);
  max-width: 1400px;
  height: auto;
  justify-content: flex-start;
  align-items: center;
}

@media screen and (max-width: 600px) {
  .fair-home {
    width: calc(100% - 16px)
  }

  h1 {
    font-size: 18px;
  }
}
</style>
