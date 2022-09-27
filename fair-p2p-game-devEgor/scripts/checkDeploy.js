const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const contractAddress = "0x9173a93CdCEA2E10F6aE64e12A0412f6680FFf29"
  const signer = await hre.ethers.getSigner()
  const Fair = await hre.ethers.getContractFactory("Fair");
  const fair = await Fair.attach(contractAddress)
// '0xE8D562606F35CB14dA3E8faB1174F9B5AE8319c4', 100

  console.log(await fair.wallet())
  console.log(await fair.feePercent())

    // signer.sendTransaction({
    //     to: '0x77185F3E9EC21086a2EBfe6E64C680A88Ca18caE',
    //     value: ethers.utils.parseEther('10')
    // })
    // .then(() => {
    //     signer.sendTransaction({
    //         to: '0x651ab11C3776fba14b4D8439f4deB1aB088Eb060',
    //         value: ethers.utils.parseEther('10')
    //     })
    // })
        signer.sendTransaction({
            to: '0xeA9b6B0f2ec94A2067515057d411467739d3a180',
            value: ethers.utils.parseEther('10')
        })
    
    .then(() => {
        signer.sendTransaction({
            to: '0x053e7e3c729A2316C257423359b81104f499A27f',
            value: ethers.utils.parseEther('10')
        })
    })
    .then(() => {
        signer.sendTransaction({
            to: '0xe60c978c22A988539CD6121B46Eaa4fBfaf2b35e',
            value: ethers.utils.parseEther('10')
        })
    })
    .then(() => {console.log(`done`)})
    .catch((err) => console.err(err))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
