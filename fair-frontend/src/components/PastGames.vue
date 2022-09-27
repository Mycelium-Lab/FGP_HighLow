<template>
  <div class="page">
    <h1>Past games</h1>
    <UserGame v-for="game in pastGames.slice().reverse()" :key="game[4]"
    :bid="game[0]"
    :timestamp="game[1]"
    :participants="game[2]"
    :status="game[3]"
    :id="game[4]"
    :pool="game[5]"
    :luckyNumber="game[6]"
    :prize="game[7]"
    />
  </div>
</template>

<script>
import UserGame from './UserGame.vue'
import store from '../store'

export default {
  name: 'PastGames',
  store,
  components: {
    UserGame
  },
  computed: {
    pastGames: function() {
        return this.$store.state.pastGames;
    },
    contract: function() {
        return this.$store.state.fairContract;
    },
    address: function() {
        return this.$store.state.user;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.page {
    border: 3px solid #F27C2F;
    border-top: 0;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
}

h1 {
    margin-top: 36px;
    margin-bottom: 36px;
}

@media screen and (max-width: 1000px) {
  .page {
    padding-left: 36px;
    padding-right: 36px;
  }
}
</style>
