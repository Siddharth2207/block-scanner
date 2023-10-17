const { Command } = require("commander");
import { writeRatioToCSV } from './src';
import * as dotenv from "dotenv";
dotenv.config();  

/**
 * Default CLI arguments
 */
const DEFAULT_OPTIONS = {
      inputToken         :   process?.env?.INPUT_TOKEN   ,
      inputTokenDecimal  :   process?.env?.INPUT_TOKEN_DECIMAL     ,
      outputToken        :   process?.env?.OUTPUT_TOKEN,
      outputTokenDecimal :   process?.env?.OUTPUT_TOKEN_DECIMAL    ,
      amountIn           :   process?.env?.AMOUNT_IN,
      fromBlock          :   process?.env?.FROM_BLOCK,
      toBlock            :   process?.env?.TO_BLOCK   ,
      filePath           :   process?.env?.FILE_PATH,
      rpcUrl             :   process?.env?.RPC_URL,
      lps                :   process?.env?.LIQUIDITY_PROVIDERS,
      memoize            :   process?.env?.MEMOIZE?.toLowerCase() === "true" ? true : false,
      poolFilter         :   process?.env?.POOL_FILTER ,
      skipBlocks         :   process?.env?.SKIP_BLOCKS,
      gasLimit           :   process?.env?.GAS_LIMIT,
      gasCoverage        :   process?.env?.GAS_COVERAGE  ,
}; 


async function main(argv){

    const cmdOptions = new Command()
      .option("-i --input-token <input-token>",`Input Token Address`)
      .option("-d --input-decimal <input-decimal>",`Input Token Decimals`)
      .option("-o --output-token <output-token>",`Output Token Address`)
      .option("-D --output-decimal <output-decimal>",`Output Token Deciamls`)
      .option("-a --amount-in <amount-in>",`Fully denominated input token amount. Eg: For 1 USDT having 6 decimals, this will be 1000000`)
      .option("-f --from-block <from-block>",`Block number to start from`)
      .option("-t --to-block <to-block>",`Block number to end at`)
      .option("-p --file-path <output-file-path>",`Output file path`)
      .option("-r --rpc-url <rpc-url>",`RPC URL to use for fetching data.`)
      .option("--memoize",`Memoize the results of the query.`)
      .option("--skip-blocks <number>",`Number of blocks to skip in every iteration`)
      .option("--pool-filter <pool-address>",`Address of the pool to filter`)
      .option("--gas-limit <gas-limit>",`Gas Limit for the "arb" transaction.Default is 1 million gas`)
      .option("--gas-coverage <gas-coverage>",`The percentage of gas to cover to be considered profitable for the transaction to be submitted.Defualt 100.`)
      .option("-l, --lps <string>", "List of liquidity providers (dex) to use by the router as one quoted string seperated by a comma for each, example: 'SushiSwapV2,UniswapV3'")
      .description([
        "Generate a CSV file with the following columns",
      ].join("\n"))
      .parse(argv) 
      .opts();   

    cmdOptions.inputToken           = cmdOptions.inputToken           || DEFAULT_OPTIONS.inputToken
    cmdOptions.inputTokenDecimal    = cmdOptions.inputTokenDecimal    || DEFAULT_OPTIONS.inputTokenDecimal
    cmdOptions.outputToken          = cmdOptions.outputToken          || DEFAULT_OPTIONS.outputToken
    cmdOptions.outputTokenDecimal   = cmdOptions.outputTokenDecimal   || DEFAULT_OPTIONS.outputTokenDecimal
    cmdOptions.amountIn             = cmdOptions.amountIn             || DEFAULT_OPTIONS.amountIn
    cmdOptions.fromBlock            = cmdOptions.fromBlock            || DEFAULT_OPTIONS.fromBlock
    cmdOptions.toBlock              = cmdOptions.toBlock              || DEFAULT_OPTIONS.toBlock
    cmdOptions.filePath             = cmdOptions.filePath             || DEFAULT_OPTIONS.filePath 
    cmdOptions.rpcUrl               = cmdOptions.rpcUrl               || DEFAULT_OPTIONS.rpcUrl
    cmdOptions.lps                  = cmdOptions.lps                  || DEFAULT_OPTIONS.lps
    cmdOptions.memoize              = cmdOptions.memoize              || DEFAULT_OPTIONS.memoize
    cmdOptions.poolFilter           = cmdOptions.poolFilter           || DEFAULT_OPTIONS.poolFilter
    cmdOptions.skipBlocks           = cmdOptions.skipBlocks           || DEFAULT_OPTIONS.skipBlocks
    cmdOptions.gasLimit             = cmdOptions.gasLimit             || DEFAULT_OPTIONS.gasLimit
    cmdOptions.gasCoverage          = cmdOptions.gasCoverage          || DEFAULT_OPTIONS.gasCoverage

    const inputToken = cmdOptions.inputToken 
    const inputTokenDecimal = Number(cmdOptions.inputTokenDecimal) 
    const outputToken = cmdOptions.outputToken 
    const outputTokenDecimal = Number(cmdOptions.outputTokenDecimal)
    const amountIn = BigInt(cmdOptions.amountIn)
    const fromBlock = BigInt(cmdOptions.fromBlock)
    const toBlock = BigInt(cmdOptions.toBlock)
    const filePath = cmdOptions.filePath
    const rpcUrl = cmdOptions.rpcUrl 
    const lps = cmdOptions.lps ? Array.from(cmdOptions.lps.matchAll(/[^,\s]+/g)).map(v => v[0]) : undefined 
    const memoize = cmdOptions.memoize
    const poolFilter = cmdOptions.poolFilter ? cmdOptions.poolFilter : undefined
    const skipBlocks = cmdOptions.skipBlocks ? BigInt(cmdOptions.skipBlocks) : 1n
    const gasLimit = cmdOptions.gasLimit ? cmdOptions.gasLimit  : "1000000"
    const gasCoverage = cmdOptions.gasCoverage ? cmdOptions.gasCoverage  : "100"


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
        memoize,
        poolFilter,
        skipBlocks,
        gasCoverage,
        gasLimit
    )
 
} 

main(process.argv).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });  