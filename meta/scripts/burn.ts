// scripts/burn.ts
import { ethers } from "hardhat";

async function main() {
  const [owner] = await ethers.getSigners(); // must be the owner
  const tokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const token = await ethers.getContractAt("ERC20Demo", tokenAddress);

  console.log("Burning IBT tokens...");

  const tx = await token.burn(
    ethers.parseEther("500") 
  );

  const balance = await token.balanceOf(owner.address);
  console.log("Your IBT balance:", ethers.formatEther(balance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
