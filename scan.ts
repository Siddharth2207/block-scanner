const { Command } = require("commander");
import { writeRatioToCSV } from "./src";
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
        .option("-i --input-token <input-token>","Input Token Address. Will override `INPUT_TOKEN` in env variables.")
        .option("-d --input-token-decimal <input-decimal>","Input Token Decimals. Will override `INPUT_TOKEN_DECIMAL` in env variables.")
        .option("-o --output-token <output-token>","Output Token Address. Will override `OUTPUT_TOKEN` in env variables.")
        .option("-D --output-token-decimal <output-decimal>","Output Token Deciamls. Will override `OUTPUT_TOKEN_DECIMAL` in env variables.")
        .option("-a --amount-in <amount-in>","Fully denominated input token amount. Eg: For 1 USDT having 6 decimals, this will be 1000000. Will override `AMOUNT_IN` in env variables.")
        .option("-f --from-block <from-block>","Block number to start from. Will override `FROM_BLOCK` in env variables.")
        .option("-t --to-block <to-block>","Block number to end at. Will override `TO_BLOCK` in env variables.")
        .option("-p --file-path <output-file-path>","Output file path. Will override `FILE_PATH` in env variables.")
        .option("-r --rpc-url <rpc-url>","RPC URL to use for fetching data. Will override `RPC_URL` in env variables.")
        .option("--memoize","Memoize the results of the query. Will override `MEMOIZE` in env variables.")
        .option("-l, --lps <string>", "Optional list of liquidity providers (dex) to use by the router as one quoted string seperated by a comma for each, example: 'SushiSwapV2,UniswapV3'. Will override `LIQUIDITY_PROVIDERS` in env variables.")
        .option("--pool-filter <pool-address>","Optional address of the pool to filter. Will override `POOL_FILTER` in env variables.")
        .option("--skip-blocks <number>","Optional number of blocks to skip in every iteration. Will override `SKIP_BLOCKS` in env variables.")
        .option("--gas-limit <gas-limit>","Optional gas Limit for the \"arb\" transaction.Default is 600000 gas units. Will override `GAS_LIMIT` in env variables.")
        .option("--gas-coverage <gas-coverage>","Optional percentage of gas to cover to be considered profitable for the transaction to be submitted.Default percentage is 100. Will override `GAS_COVERAGE` in env variables.")
        .description([
            "Generate a CSV file with external prices aggregated from the liquidity pools",
        ].join("\n"))
        .parse(argv)
        .opts();

    cmdOptions.inputToken           = cmdOptions.inputToken           || DEFAULT_OPTIONS.inputToken;
    cmdOptions.inputTokenDecimal    = cmdOptions.inputTokenDecimal    || DEFAULT_OPTIONS.inputTokenDecimal;
    cmdOptions.outputToken          = cmdOptions.outputToken          || DEFAULT_OPTIONS.outputToken;
    cmdOptions.outputTokenDecimal   = cmdOptions.outputTokenDecimal   || DEFAULT_OPTIONS.outputTokenDecimal;
    cmdOptions.amountIn             = cmdOptions.amountIn             || DEFAULT_OPTIONS.amountIn;
    cmdOptions.fromBlock            = cmdOptions.fromBlock            || DEFAULT_OPTIONS.fromBlock;
    cmdOptions.toBlock              = cmdOptions.toBlock              || DEFAULT_OPTIONS.toBlock;
    cmdOptions.filePath             = cmdOptions.filePath             || DEFAULT_OPTIONS.filePath;
    cmdOptions.rpcUrl               = cmdOptions.rpcUrl               || DEFAULT_OPTIONS.rpcUrl;
    cmdOptions.lps                  = cmdOptions.lps                  || DEFAULT_OPTIONS.lps;
    cmdOptions.memoize              = cmdOptions.memoize              || DEFAULT_OPTIONS.memoize;
    cmdOptions.poolFilter           = cmdOptions.poolFilter           || DEFAULT_OPTIONS.poolFilter;
    cmdOptions.skipBlocks           = cmdOptions.skipBlocks           || DEFAULT_OPTIONS.skipBlocks;
    cmdOptions.gasLimit             = cmdOptions.gasLimit             || DEFAULT_OPTIONS.gasLimit;
    cmdOptions.gasCoverage          = cmdOptions.gasCoverage          || DEFAULT_OPTIONS.gasCoverage;

    const AddressPattern = /^0x[a-fA-F0-9]{40}$/;
    if (!AddressPattern.test(cmdOptions.inputToken)) throw "invalid input token address";
    if (!AddressPattern.test(cmdOptions.outputToken)) throw "invalid output token address";
    if (!cmdOptions.rpcUrl) throw "undefined RPC URL";
    if (!cmdOptions.filePath) throw "undefined FILE PATH";
    if (!BigInt(cmdOptions.amountIn)) throw "invalid AMOUNT IN";
    if (!BigInt(cmdOptions.fromBlock)) throw "invalid FROM_BLOCK";
    if (!BigInt(cmdOptions.toBlock)) throw "invalid FROM_BLOCK";
    if (!Number(cmdOptions.inputTokenDecimal)) throw "invalid INPUT_TOKEN_DECIMAL";
    if (!Number(cmdOptions.outputTokenDecimal)) throw "invalid OUTPUT_TOKEN_DECIMAL";


    const inputToken = cmdOptions.inputToken;
    const inputTokenDecimal = Number(cmdOptions.inputTokenDecimal);
    const outputToken = cmdOptions.outputToken;
    const outputTokenDecimal = Number(cmdOptions.outputTokenDecimal);
    const amountIn = BigInt(cmdOptions.amountIn);
    const fromBlock = BigInt(cmdOptions.fromBlock);
    const toBlock = BigInt(cmdOptions.toBlock);
    const filePath = cmdOptions.filePath;
    const rpcUrl = cmdOptions.rpcUrl;
    const memoize = cmdOptions.memoize;
    const lps = cmdOptions.lps ? Array.from(cmdOptions.lps.matchAll(/[^,\s]+/g)).map(v => v[0]) : undefined;
    const poolFilter = cmdOptions.poolFilter ? cmdOptions.poolFilter : undefined;
    const skipBlocks = cmdOptions.skipBlocks ? BigInt(cmdOptions.skipBlocks) : 1n;
    const gasLimit = cmdOptions.gasLimit ? cmdOptions.gasLimit  : "600000";
    const gasCoverage = cmdOptions.gasCoverage ? cmdOptions.gasCoverage  : "100";



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
        skipBlocks,
        gasCoverage,
        gasLimit,
        poolFilter
    );

}

main(process.argv).catch((error) => {
    console.log("\x1b[31m%s\x1b[0m", "An error occured during execution: ");
    console.log(error);
    process.exitCode = 1;
});