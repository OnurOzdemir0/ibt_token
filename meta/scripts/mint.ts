// scripts/mint.ts
import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners(); // must be the owner
  console.log("Owner address:", owner.address);

  const tokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  console.log("Token address:", tokenAddress);

  const token = await ethers.getContractAt("ERC20Demo", tokenAddress);
  console.log("Token contract fetched");

  console.log("Minting IBT tokens...");

  const tx = await token.mint(
    owner.address, 
    ethers.parseEther("1000") 
  );
  console.log("Mint transaction sent:", tx.hash);

  await tx.wait();
  console.log("Mint transaction confirmed");

  const balance = await token.balanceOf(owner.address);
  console.log("Your IBT balance:", ethers.formatEther(balance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
