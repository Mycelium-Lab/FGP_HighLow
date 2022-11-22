const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const assert = require("assert");
  
  describe("FairHighlow", function () {
  
      let acc1;
      let acc2;
      let acc3;
      let acc4;
      let acc5;
      let acc6;
      let acc7;
      let acc8;
      let acc9;
      let fair;
      let usdt;
      let usdc;
      const feePercent = 100 //1%
  
      beforeEach(async function() {
            [acc1, acc2, acc3, acc4, acc5, acc6, acc7, acc8, acc9] = await ethers.getSigners();
            const Fair = await ethers.getContractFactory("FairHighlow", acc1);
            const TokenForTests = await ethers.getContractFactory("TokenForTests", acc1)
            fair = await Fair.deploy(acc6.address, feePercent, 300, 30);
            usdt = await TokenForTests.deploy('Tether Like', "USDTTokenForTests", 18);
            usdc = await TokenForTests.deploy('USD Coin Like', "USDTCokenForTests", 6);
            await fair.deployed();
            await usdt.deployed();
            await usdc.deployed();
      })
  
      it("should be deployed", async function() {
            expect(fair.address).to.be.properAddress
      })
  
      it("create game. positive ", async function() {
            const amountToPlay = 100
            await usdc.increaseAllowance(fair.address, amountToPlay)
            const userBalanceBefore = await usdc.balanceOf(acc1.address)
            await fair.createGame(12, 1, amountToPlay, usdc.address)
            const tokenBalance = await usdc.balanceOf(fair.address)
            const userBalanceAfter = await usdc.balanceOf(acc1.address)
            expect(tokenBalance).to.be.eq(amountToPlay)
            expect(userBalanceBefore - userBalanceAfter).to.be.eq(amountToPlay)
      })

      it("create game. negative. err - allowance", async () => {
            const amountToPlay = 100
            await expect(
                  fair.createGame(12, 1, amountToPlay, usdc.address)
            ).to.be.revertedWith('ERC20: insufficient allowance')
      })

      it("create game. negative. err - balance", async () => {
            const amountToPlay = 100
            await usdc.connect(acc2).increaseAllowance(fair.address, amountToPlay)
            await expect(
                  fair.connect(acc2).createGame(12, 1, amountToPlay, usdc.address)
            ).to.be.revertedWith('ERC20: transfer amount exceeds balance')
      })

      it("create game. negative. err - zero amount to play", async () => {
            const amountToPlay = 0
            await expect(
                  fair.createGame(12, 1, amountToPlay, usdc.address)
            ).to.be.revertedWith(`FairHighlow: amount can't be 0`)
      })

      it('join game. positive', async () => {
            const amountToPlay = 100
            await usdc.increaseAllowance(fair.address, amountToPlay)
            await usdc.connect(acc1).transfer(acc2.address, amountToPlay)
            await fair.createGame(12, 2, amountToPlay, usdc.address)
            await usdc.connect(acc2).increaseAllowance(fair.address, amountToPlay)
            await fair.connect(acc2).joinGame(0, 99)
            const contractBalance = await usdc.balanceOf(fair.address)
            assert(contractBalance == amountToPlay * 2, 'Sended two times')
            const userGames = await fair.getUserGames(acc2.address)
            assert(userGames.length >= 1, 'Add new game to players list')
      })

      it('join game. negative. err - balance', async () => {
            const amountToPlay = 100
            await usdc.increaseAllowance(fair.address, amountToPlay)
            await fair.createGame(12, 2, amountToPlay, usdc.address)
            await usdc.connect(acc2).increaseAllowance(fair.address, amountToPlay)
            await expect(
                  fair.connect(acc2).joinGame(0, 99)
            ).to.be.revertedWith('ERC20: transfer amount exceeds balance')  
      })

      it('join game. negative. err - allowance', async () => {
            const amountToPlay = 100
            await usdc.increaseAllowance(fair.address, amountToPlay)
            await fair.createGame(12, 2, amountToPlay, usdc.address)
            await usdc.connect(acc1).transfer(acc2.address, amountToPlay)
            await expect(
                  fair.connect(acc2).joinGame(0, 99)
            ).to.be.revertedWith('ERC20: insufficient allowance')  
      })

      it('join game. negative. err - owner', async () => {
            const amountToPlay = 100
            await usdc.increaseAllowance(fair.address, amountToPlay * 2)
            await fair.createGame(12, 2, amountToPlay, usdc.address)
            await expect(
                  fair.joinGame(0, 99)
            ).to.be.revertedWith('FairHighlow: Owner is already in participants list')  
      })

      it('join game. negative. err - already existed number', async () => {
            const amountToPlay = 100
            await usdc.increaseAllowance(fair.address, amountToPlay)
            await usdc.connect(acc1).transfer(acc2.address, amountToPlay)
            await fair.createGame(12, 2, amountToPlay, usdc.address)
            await usdc.connect(acc2).increaseAllowance(fair.address, amountToPlay)
            await expect(
                  fair.connect(acc2).joinGame(0, 12)
            ).to.be.revertedWith('FairHighlow: Already existed number')
      })

      it('join game. negative. err - join twice', async () => {
            const amountToPlay = 100
            await usdc.increaseAllowance(fair.address, amountToPlay)
            await usdc.connect(acc1).transfer(acc2.address, amountToPlay * 2)
            await fair.createGame(12, 2, amountToPlay, usdc.address)
            await usdc.connect(acc2).increaseAllowance(fair.address, amountToPlay * 2)
            await fair.connect(acc2).joinGame(0, 14)
            await expect(
                  fair.connect(acc2).joinGame(0, 13)
            ).to.be.revertedWith('FairHighlow: You can not join twice')
      })
      
      it('join game. negative. err - participants limit', async () => {
            const amountToPlay = 100
            await usdc.increaseAllowance(fair.address, amountToPlay)
            await usdc.connect(acc1).transfer(acc2.address, amountToPlay)
            await fair.createGame(12, 1, amountToPlay, usdc.address)
            await usdc.connect(acc2).increaseAllowance(fair.address, amountToPlay)
            await expect(
                  fair.connect(acc2).joinGame(0, 13)
            ).to.be.revertedWith('FairHighlow: Participants limit has been reached')
      })

      it('join game. negative. err - game is finished', async () => {
            const amountToPlay = 100
            await usdc.increaseAllowance(fair.address, amountToPlay)
            await usdc.connect(acc1).transfer(acc2.address, amountToPlay)
            await fair.createGame(12, 1, amountToPlay, usdc.address)
            await network.provider.send("evm_increaseTime", [13600])
            await fair.finishGame(0)
            await usdc.connect(acc2).increaseAllowance(fair.address, amountToPlay)
            await expect(
                  fair.connect(acc2).joinGame(0, 13)
            ).to.be.revertedWith('FairHighlow: The game is finished')
      })

      it('finish game. positive', async () => {
            const amountToPlay = 100
            await usdt.increaseAllowance(fair.address, amountToPlay)
            await fair.createGame(12, 1, amountToPlay, usdt.address)
            await network.provider.send("evm_increaseTime", [13600])
            await fair.finishGame(0)
            const prize = await fair.prizeList(acc1.address, 0)
            assert(prize.isWinner, 'Is winner')
            assert(prize.prize == amountToPlay, 'Amount')
      })

      it('finish game. negative. err - already finished', async () => {
            const amountToPlay = 100
            await usdt.increaseAllowance(fair.address, amountToPlay)
            await fair.createGame(12, 1, amountToPlay, usdt.address)
            await network.provider.send("evm_increaseTime", [13600])
            await fair.finishGame(0)
            await expect(
                  fair.finishGame(0)
            ).to.be.revertedWith('FairHighlow: The game is finished already')
      })

      it('finish game. negative. err - time', async () => {
            const amountToPlay = 100
            await usdt.increaseAllowance(fair.address, amountToPlay)
            await fair.createGame(12, 1, amountToPlay, usdt.address)
            await expect(
                  fair.finishGame(0)
            ).to.be.revertedWith('FairHighlow: You can finish a game only after exact period')
      })

      it('finish game. negative. err - bidders list', async () => {
            const amountToPlay = 100
            await usdt.increaseAllowance(fair.address, amountToPlay)
            await fair.createGame(12, 1, amountToPlay, usdt.address)
            await network.provider.send("evm_increaseTime", [13600])
            await expect(
                  fair.connect(acc2).finishGame(0)
            ).to.be.revertedWith('FairHighlow: Only participants can finish a game')
      })

      it('claim game. positive one player', async () => {
            const amountToPlay = 100
            const balancePlayerBefore = await usdt.balanceOf(acc1.address)
            await usdt.increaseAllowance(fair.address, amountToPlay)
            await fair.createGame(12, 1, amountToPlay, usdt.address)
            await network.provider.send("evm_increaseTime", [13600])
            await fair.finishGame(0)
            await fair.claim(0)
            const balancePlayerAfterClaim = await usdt.balanceOf(acc1.address)
            const balanceWalletFromComission = await usdt.balanceOf(acc6.address)
            const balanceFair = await usdt.balanceOf(fair.address)
            assert(
                  balanceWalletFromComission == Math.round(amountToPlay * feePercent / 10000), 
                  'Get commision 1%'
            )
            assert(
                  BigInt(balancePlayerAfterClaim) + BigInt(balanceWalletFromComission)
                  ===
                  BigInt(balancePlayerBefore),
                  'PLayer balance with commision return'
            )
            assert( balanceFair == 0, 'Contract address return')
      })

      it('claim game. positive two players', async () => {
            const amountToPlay = 100
            await usdt.transfer(acc2.address, amountToPlay)
            const balancePlayer1Before = await usdt.balanceOf(acc1.address)
            const balancePlayer2Before = await usdt.balanceOf(acc2.address)
            await usdt.increaseAllowance(fair.address, amountToPlay)
            await usdt.connect(acc2).increaseAllowance(fair.address, amountToPlay)
            await fair.createGame(12, 2, amountToPlay, usdt.address)
            await fair.connect(acc2).joinGame(0, 13)
            await network.provider.send("evm_increaseTime", [13600])
            await fair.finishGame(0)
            try {
                  await fair.claim(0)
            } catch (error) {
                  console.log('Acc1 loser, Acc2 winner')
            }
            try {
                  await fair.connect(acc2).claim(0)
            } catch (error) {
                  console.log('Acc2 loser, Acc1 winner')
            }
            const balancePlayer1AfterClaim = await usdt.balanceOf(acc1.address)
            const balancePlayer2AfterClaim = await usdt.balanceOf(acc2.address)
            const balanceWalletFromComission = await usdt.balanceOf(acc6.address)
            const balanceFair = await usdt.balanceOf(fair.address)
            assert(
                  balanceWalletFromComission == Math.round(amountToPlay * 2 * feePercent / 10000), 
                  'Get commision 1%'
            )
            assert(
                  (BigInt(balancePlayer1AfterClaim)
                  >
                  BigInt(balancePlayer1Before))
                  ||
                  (BigInt(balancePlayer2AfterClaim)
                  >
                  BigInt(balancePlayer2Before)),
                  'PLayer balance with commision return'
            )
            assert( balanceFair == 0, 'Contract address return')
      })

      it('claim game. positive count many winners', async () => {
            const amountToPlay = 100
            let players = [acc1,acc2,acc3,acc4,acc5,acc6,acc7,acc8,acc9]
            for (let i = 0; i < players.length; i++) {
                  await usdt.transfer(players[i].address, amountToPlay)
                  await usdt.connect(players[i]).increaseAllowance(fair.address, amountToPlay)
            }
            await fair.createGame(Math.floor(Math.random() * 255), 11, amountToPlay, usdt.address)
            for (let i = 1; i < players.length; i++) {
                  try {
                        await fair.connect(players[i]).joinGame(0, Math.floor((Math.random() + parseFloat(`0.0${i}`)) * 255))
                  } catch (error) {
                  }
            }
            await network.provider.send("evm_increaseTime", [13600])
            await fair.finishGame(0)
            let claimersAmount = 0
            for (let i = 0; i < players.length; i++) {
                  const prize = await fair.prizeList(players[i].address, 0)
                  if (prize.prize != 0) {
                        claimersAmount += 1
                  }
            }
            assert(claimersAmount > 1, 'Many winners')
            console.log('This test (claim game. positive count many winners) can not work, because of random number generator')
      })

      it('claim game. negative. err - not winner', async () => {
            const amountToPlay = 100
            await usdt.increaseAllowance(fair.address, amountToPlay)
            await fair.createGame(12, 1, amountToPlay, usdt.address)
            await network.provider.send("evm_increaseTime", [13600])
            await fair.finishGame(0)
            await fair.claim(0)
            await expect(
                  fair.connect(acc2).claim(0)
            ).to.be.revertedWith('FairHighlow: You are not a winner of the game')
      })

      it('claim game. negative. err - already claimed', async () => {
            const amountToPlay = 100
            await usdt.increaseAllowance(fair.address, amountToPlay)
            await fair.createGame(12, 1, amountToPlay, usdt.address)
            await network.provider.send("evm_increaseTime", [13600])
            await fair.finishGame(0)
            await fair.claim(0)
            await expect(
                  fair.claim(0)
            ).to.be.revertedWith('FairHighlow: Prize is claimed already')
      })

})  