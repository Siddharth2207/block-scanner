import {ethers, BigNumber} from "ethers"
import { Token } from "sushi/currency"; 
import { DataFetcher, Router, PoolFilter } from "sushiswap-router"; 
import { getChainId } from "../utils";


export const getRoute = async ( 
    config,
    gasPrice,
    dataFetcher : DataFetcher,
    fromToken : Token,
    toToken : Token,
    amountIn: bigint,
    block: bigint,
    memoize: boolean,
    poolFilterAddress? :string,
) => {  
    
    const chainId = getChainId(config.chainId) 
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
    const ethPrice = await getEthPrice(
        config,
        toToken,
        gasPrice,
        dataFetcher
    );
    return {
        route : route,
        ethPrice : ethPrice,
        blockNumber : block
    }

} 

export const getEthPrice = async(
    config,
    toToken,
    gasPrice,
    dataFetcher
) => { 
    const chainId = getChainId(config.chainId) 

    const amountIn = BigNumber.from(
        "1" + "0".repeat(config.nativeWrappedToken.decimals)
    );
    const fromToken = new Token({
        chainId: config.chainId,
        decimals: config.nativeWrappedToken.decimals,
        address: config.nativeWrappedToken.address,
        symbol: config.nativeWrappedToken.symbol
    });

    await dataFetcher.fetchPoolsForToken(fromToken, toToken);
    const pcMap = dataFetcher.getCurrentPoolCodeMap(fromToken, toToken);
    const route = Router.findBestRoute(
        pcMap,
        chainId,
        fromToken,
        BigInt(amountIn.toString()),
        toToken,
        gasPrice.toNumber()
        
    );
    if (route.status == "NoWay") return undefined;
    else return ethers.utils.formatUnits(route.amountOutBI.toString(), toToken.decimals);
};  

export const getPoolFilter = (address : string) => {
    const poolFilter: PoolFilter = (rpool) => {
        if (rpool.address.toLowerCase() === address.toLowerCase()) return true
        else return false
    } 
    return poolFilter
} 

