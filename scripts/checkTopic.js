const { ethers } = require("hardhat");
const hre = require("hardhat");
const Web3 = require("web3")

async function main() {
    const signer = await hre.ethers.getSigner()
    const Fair = await hre.ethers.getContractFactory("Fair");
    // const fair = await Fair.deploy(
    //   '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', //wallet
    //   300,  //3% fee to wallet
    //   10,  //second to finish game
    //   30,   //userGamesToReturnNumber
    // );
    const fair = Fair.attach('0xc63d2a04762529edB649d7a4cC3E57A0085e8544')
    // await fair.deployed();
    // const web3 = new Web3("https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161")
    // const subscription = web3.eth.subscribe('FinishGame', {
    //     address: fair.address,
    //     topics: ['0x3e9fed5538947ce96981fb9097e840f5c8d821344c446fe2409e2b8eb1efb08f']
    // }, function(error, result){
    //     if (!error)
    //     console.log(result);
    // })
    // .on("connected", function(subscriptionId){
    //     console.log(subscriptionId);
    // })
    // .on("data", function(log){
    //     console.log(log);
    // })
    const signer2 = new ethers.Wallet('d82a91f6f71f55749ecfdb7b94cf56a53aaab11dd5ca10014404bbb99d3c25c5', ethers.provider);
    await fair.createGame(20, 4, {value: ethers.utils.parseEther("0.0001")})
    await fair.connect(signer2).joinGame(10, 8, {value: ethers.utils.parseEther("0.0001")})
    .then(() => {
        console.log('Game created and joined')
        setTimeout(async () => {
            await fair.finishGame(10)
            console.log('Game finished')
        }, 1000*60)
    })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
