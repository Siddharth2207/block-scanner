import { ethers } from 'ethers';
import { fallback,  createPublicClient } from "viem";
import { DataFetcher,  config  } from "sushiswap-router";
import { stringify } from 'csv-stringify/sync'; 
import fs from 'fs';
import { fallbacks, getChainId, processLps } from '../utils';
import { Token } from "sushi/currency";
import Queue from "queue-promise";
import { getRoute } from './builderUtils';
import CONFIG from "../../config.json";

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
    skipBlocks? : bigint, 
    gasCoveragePercentage?:string,
    gasLimit? :string
) => { 
    try { 
        
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);   
        const networkChainId = (await provider.getNetwork()).chainId;
        const networkConfig = CONFIG.find(v => v.chainId === networkChainId);  

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
            concurrent: 7,
            interval: 1500,
            start: true,
        });   

        for(let i = fromBlock; i <= toBlock; i += skipBlocks){ 
            queue.enqueue(() => {
                return getRoute(
                    networkConfig,
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
        
        queue.on("resolve", async (data) =>  {
            const {route,ethPrice,blockNumber} = data
            const stream = fs.createWriteStream(fileName, {flags: 'a'}); 
            if (route.status == "NoWay"){
                console.log(">>> No route found")
            }else{ 
                const amountOut = ethers.BigNumber.from(route.amountOutBI.toString())  

                // Approximating gasLimit for the `arb` transaction
                let txGasLimit = ethers.BigNumber.from(gasLimit)
                txGasLimit = txGasLimit.mul("112").div("100"); 
                const gasCost = txGasLimit.mul(gasPrice); 

                const gasCostInToken = ethers.utils.parseUnits(
                    ethPrice
                ).mul(
                    gasCost
                ).div(
                    "1" + "0".repeat(
                        36 - outputTokenDecimal
                    )
                );   

                const headroom = (
                    Number(gasCoveragePercentage) * 1.15
                ).toFixed(); 
                const minimumTokenOut = gasCostInToken.mul(headroom).div("100") 

                if(amountOut.gte(minimumTokenOut)){  

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

                }else{
                    console.log("\x1b[31m%s\x1b[0m", ">>> Transaction not profitable.", "\n");
                }
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
