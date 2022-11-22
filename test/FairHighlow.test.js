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
      let fair;
      let usdt;
      let usdc;
  
      beforeEach(async function() {
            [acc1, acc2, acc3, acc4, acc5, acc6] = await ethers.getSigners();
            const Fair = await ethers.getContractFactory("FairHighlow", acc1);
            const TokenForTests = await ethers.getContractFactory("TokenForTests", acc1)
            fair = await Fair.deploy(acc1.address, 100, 300, 30);
            usdt = await TokenForTests.deploy('Tether Like', "USDTTokenForTests", 18);
            usdc = await TokenForTests.deploy('USD Coin Like', "USDTCokenForTests", 6);
            await fair.deployed();
            await usdt.deployed();
            await usdc.deployed();
      })
  
      it("1 should be deployed", async function() {
            expect(fair.address).to.be.properAddress
      })
  
      it("2 create game. positive ", async function() {
            await usdc.increaseAllowance(fair.address, 100)
            const tx = await fair.createGame(12, 1, 100, usdc.address)
            //const tx2 = await fair.connect(acc2).joinGame(1,1, {value: 100})
            const tx2 = await fair.getActualGames()
            console.log(usdc.address)
            console.log(tx2)
            // const txtx = await fair.connect(acc3).joinGame(0, 12, {value: 100})
            // const txtx2 = await fair.connect(acc4).joinGame(0, 12, {value: 100})
            // const txtx3 = await fair.connect(acc5).joinGame(0, 12, {value: 100})
            //expect(tx2.value).to.eq(0)
      })
})  