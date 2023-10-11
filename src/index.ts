import { ethers } from 'ethers';
import { fallback, http, createPublicClient } from "viem";
import { DataFetcher, Router, LiquidityProviders, config } from "sushiswap-router";
import { stringify } from 'csv-stringify/sync'; 
import fs from 'fs';
import { fallbacks, getChainId, processLps } from './utils';
import { Token } from "sushi/currency";


export const writeRatioToCSV = async (
    inputToken: string,
    inputTokenDecimal: number,
    outputToken: string,
    outputTokenDecimal: number,
    amountIn: any,
    fromBlock: bigint,
    toBlock: bigint, 
    fileName: string,
    rpcUrl: string ,
    lps : string[],
    memoize: boolean
) => { 
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const gasPrice = await provider.getGasPrice();   
        const chainId = getChainId(provider.network.chainId) 

        const transport = fallback(
            fallbacks[chainId].transport,
            { rank: true }
        ); 
        
        const dataFetcher = new DataFetcher(
            1,
            createPublicClient({
              chain: config[1]?.chain,
              transport
            })
          );; 

        const liquidityProviders = lps ? 
            processLps(lps,chainId) :
            processLps(fallbacks[chainId].liquidityProviders,chainId) 

        dataFetcher.startDataFetching(liquidityProviders);
        
        // get pools and data for a token pair
        const fromToken = new Token({
            chainId,
            decimals : inputTokenDecimal,
            address : inputToken,
        });
        const toToken = new Token({
            chainId,
            decimals : outputTokenDecimal,
            address : outputToken,
        });  

        console.log("\n","-------------------------Generating CSV Data-------------------------", "\n") 
        console.log(`>>> Generating CSV for ${inputToken} - ${outputToken}`, `\n`) 

        for(let i = fromBlock; i <= toBlock; i++){
            await dataFetcher.fetchPoolsForToken(fromToken, toToken, null, { blockNumber: i, memoize: memoize });
        
            // Find the Best Route
            const pcMap = dataFetcher.getCurrentPoolCodeMap(fromToken, toToken);
                const route = Router.findBestRoute(
                pcMap,
                chainId,
                fromToken,
                amountIn,
                toToken,
                gasPrice.toNumber()
            );
            if (route.status == "NoWay"){
                throw "found no route for this token pair" 
            }else{ 

                console.log("route : " , route.amountOutBI.toString())
                const amountOut = ethers.BigNumber.from(route.amountOutBI.toString()) 
                const rateFixed = amountOut.mul(
                    "1" + "0".repeat(18 - outputTokenDecimal)
                ); 
                
                const amountInScale = amountIn.mul(
                    "1" + "0".repeat(18 - inputTokenDecimal)
                ); 
                const price = rateFixed.mul("1" + "0".repeat(18)).div(amountInScale) ;   
                
                console.log(
                    "Block <-> Ratio :",
                    `\x1b[36m${i}\x1b[0m <-> \x1b[33m${ethers.utils.formatEther(price)}\x1b[0m`, 
                    "\n"
                ); 

                const outputCsvLine = stringify([
                    [
                        chainId.toString(),
                        i.toString(),
                        inputToken,
                        outputToken,
                        ethers.utils.formatUnits(amountIn,inputTokenDecimal).toString(),
                        ethers.utils.formatUnits(amountOut).toString(),
                        ethers.utils.formatEther(price).toString()
                    ],
                ]); 
                
                const stream = fs.createWriteStream(fileName, {flags: 'a'});
                stream.write(outputCsvLine, function() {}); 
                stream.end(); 

            }
        } 
        console.log("\x1b[32m%s\x1b[0m", "Generated CSV data successfully", "\n");
        process.exit(0);
    }catch(error){
        console.log("\x1b[31m%s\x1b[0m", ">>> Something went wrong, reason:", "\n");
        console.log(error);
    }
}