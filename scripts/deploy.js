// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const signer = await hre.ethers.getSigner()
  const Fair = await hre.ethers.getContractFactory("Fair");
  const fair = await Fair.deploy(
    '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', //wallet
    300,  //3% fee to wallet
    150   //second to finish game
  );

  await fair.deployed();

  console.log(
    `Fair deployed to ${fair.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
