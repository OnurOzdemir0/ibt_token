import { ethers } from "hardhat";
import DeploymentArgs from "./DeploymentArgs";

async function main() {
    const ERC20Demo = await ethers.getContractFactory("ERC20Demo");
    const erc20Demo = await ERC20Demo.deploy(...DeploymentArgs);

    await erc20Demo.waitForDeployment();
    const contractAddress = await erc20Demo.getAddress();
    console.log("ERC20Demo deployed to:", contractAddress);
    //
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 