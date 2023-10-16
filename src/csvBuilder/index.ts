import { ethers } from 'ethers';
import { fallback, http, createPublicClient } from "viem";
import { DataFetcher, Router,  config , PoolFilter } from "sushiswap-router";
import { stringify } from 'csv-stringify/sync'; 
import fs from 'fs';
import { fallbacks, getChainId, processLps } from '../utils';
import { Token } from "sushi/currency";
import Queue from "queue-promise";

export const getPoolFilter = (address : string) => {
    const poolFilter: PoolFilter = (rpool) => {
        if (rpool.address.toLowerCase() === address.toLowerCase()) return true
        else return false
    } 
    return poolFilter
} 

const getRoute = async ( 
    chainId,
    gasPrice,
    dataFetcher : DataFetcher,
    fromToken : Token,
    toToken : Token,
    amountIn: bigint,
    block: bigint,
    memoize: boolean,
    poolFilterAddress? :string,
) => {
    
    await dataFetcher.fetchPoolsForToken(fromToken, toToken, null, { blockNumber: block, memoize: memoize });

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
        poolFilterAddress ? getPoolFilter(poolFilterAddress) : undefined
    );  
    
    return {
        route : route,
        blockNumber : block
    }

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
    memoize: boolean,
    poolFilterAddress? :string,
    skipBlocks? : bigint
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

        const queue = new Queue({
            concurrent: 5,
            interval: 1500,
            start: true,
        });   

        for(let i = fromBlock; i <= toBlock; i += skipBlocks){ 
            queue.enqueue(() => {
                return getRoute(
                    chainId,
                    gasPrice,
                    dataFetcher,
                    fromToken,
                    toToken,
                    amountIn,
                    i,
                    memoize,
                    poolFilterAddress
                );
            });
        }   
        
        queue.on("resolve", (data) =>  {  
            const {route,blockNumber} = data
            const stream = fs.createWriteStream(fileName, {flags: 'a'}); 
            if (route.status == "NoWay"){
                console.log("No route found")
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
                    `\x1b[36m${blockNumber}\x1b[0m <-> \x1b[33m${ethers.utils.formatEther(price)}\x1b[0m`, 
                    "\n"
                ); 
                const outputCsvLine = stringify([
                    [
                        chainId.toString(),
                        blockNumber.toString(),
                        inputToken,
                        outputToken,
                        ethers.utils.formatUnits(ethers.BigNumber.from(amountIn),inputTokenDecimal).toString(),
                        ethers.utils.formatUnits(amountOut,outputTokenDecimal).toString(),
                        ethers.utils.formatEther(price).toString()
                    ],
                ]); 
                stream.write(outputCsvLine, function() {}); 
            }
            stream.end();  
        });  

        queue.on("reject",(error) => {
            console.log(error)
        })

        queue.on("end", () => {
            console.log("\x1b[32m%s\x1b[0m", "Generated CSV data successfully", "\n");
            process.exit(0);
        }); 

    }catch(error){
        console.log("\x1b[31m%s\x1b[0m", ">>> Something went wrong, reason:", "\n");
        console.log(error);
    }
} 
