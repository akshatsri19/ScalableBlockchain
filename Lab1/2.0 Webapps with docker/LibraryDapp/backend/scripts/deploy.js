const hre = require('hardhat');

async function main() {

  const Library = await hre.ethers.getContractFactory('Library');
  const contract = await Library.deploy();

  // Get and print the contract address
  const myContractDeployedAddress = await contract.getAddress();
  console.log(`Deployed to ${myContractDeployedAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});