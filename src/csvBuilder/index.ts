import { ethers } from 'ethers';
import { fallback, http, createPublicClient } from "viem";
import { DataFetcher, Router,  config , PoolFilter } from "sushiswap-router";
import { stringify } from 'csv-stringify/sync'; 
import fs from 'fs';
import { fallbacks, getChainId, processLps } from '../utils';
import { Token } from "sushi/currency";
import { ChainId } from "@sushiswap/chain" ;  

export const poolFilter: PoolFilter = (rpool) => {
    if (rpool.address.toLowerCase() === '0xdcef968d416a41cdac0ed8702fac8128a64241a2') return true
    else return false
}

export const writeRatioToCSV = async (  
    inputToken: string,
    inputTokenDecimal: number,
    outputToken: string,
    outputTokenDecimal: number,
    amountIn: bigint,
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
            chainId,
            createPublicClient({
              chain: config[1]?.chain,
              transport
            })
          );

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

        const stream = fs.createWriteStream(fileName, {flags: 'a'});
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
                gasPrice.toNumber(),
                undefined,
                poolFilter
            ); 

            if (route.status == "NoWay"){
                console.log("No route found")
                continue
            }else{ 

                console.log("route : " , route.amountOutBI.toString())
                const amountOut = ethers.BigNumber.from(route.amountOutBI.toString()) 
                const rateFixed = amountOut.mul(
                    "1" + "0".repeat(18 - outputTokenDecimal)
                ); 
                
                const amountInScale = ethers.BigNumber.from(amountIn).mul(
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
                        fromBlock.toString(),
                        inputToken,
                        outputToken,
                        ethers.utils.formatUnits(ethers.BigNumber.from(amountIn),inputTokenDecimal).toString(),
                        ethers.utils.formatUnits(amountOut,outputTokenDecimal).toString(),
                        ethers.utils.formatEther(price).toString()
                    ],
                ]); 
                stream.write(outputCsvLine, function() {}); 
            }
        }  
        stream.end(); 
        console.log("\x1b[32m%s\x1b[0m", "Generated CSV data successfully", "\n");
        process.exit(0);
    }catch(error){
        console.log("\x1b[31m%s\x1b[0m", ">>> Something went wrong, reason:", "\n");
        console.log(error);
    }
} 