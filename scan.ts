const { Command } = require("commander"); 
import { ethers } from 'ethers'; 
import { writeRatioToCSV } from './src';

async function main(argv){

    const cmdOptions = new Command()
      .requiredOption("-i --input-token <input-token>",`Input Token Address`)
      .requiredOption("-d --input-decimal <input-decimal>",`Input Token Decimals`)
      .requiredOption("-o --output-token <output-token>",`Output Token Address`)
      .requiredOption("-D --output-decimal <output-decimal>",`Output Token Deciamls`)
      .requiredOption("-a --amount-in <amount-in>",`Fully denominated input token amount. Eg: For 1 USDT having 6 decimals, this will be 1000000`)
      .requiredOption("-f --from-block <from-block>",`Block number to start from`)
      .requiredOption("-t --to-block <to-block>",`Block number to end at`)
      .requiredOption("-p --file-path <output-file-path>",`Output file path`)
      .requiredOption("-r --rpc-url <rpc-url>",`RPC URL to use for fetching data.`)
      .option("--memoize",`Memoize the results of the query.`)
      .option("-l, --lps <string>", "List of liquidity providers (dex) to use by the router as one quoted string seperated by a comma for each, example: 'SushiSwapV2,UniswapV3'")


      .description([
        "Generate a CSV file with the following columns",
      ].join("\n"))
      .parse(argv) 
      .opts();   

    const inputToken = cmdOptions.inputToken
    const inputTokenDecimal = Number(cmdOptions.inputDecimal)
    const outputToken = cmdOptions.outputToken
    const outputTokenDecimal = Number(cmdOptions.outputDecimal)
    const amountIn = ethers.BigNumber.from(cmdOptions.amountIn)
    const fromBlock = BigInt(cmdOptions.fromBlock)
    const toBlock = BigInt(cmdOptions.toBlock)
    const filePath = cmdOptions.filePath
    const rpcUrl = cmdOptions.rpcUrl 
    const lps = cmdOptions.lps ? Array.from(cmdOptions.lps.matchAll(/[^,\s]+/g)).map(v => v[0]) : undefined 
    const memoize = cmdOptions.memoize


    writeRatioToCSV(
        inputToken,
        inputTokenDecimal,
        outputToken,
        outputTokenDecimal,
        amountIn,
        fromBlock,
        toBlock,
        filePath,
        rpcUrl,
        lps,
        memoize
    )
 
} 

main(process.argv).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });  