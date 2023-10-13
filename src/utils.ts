import { createPublicClient, http, fallback } from "viem" ;
import { ChainId } from "@sushiswap/chain" ; 
import {  LiquidityProviders } from "sushiswap-router";
/**
 * Chain specific fallback data
 */
export const fallbacks = {
    [ChainId.ARBITRUM_NOVA]: {
        transport: http("https://nova.arbitrum.io/rpc"),
        liquidityProviders: [
            "sushiswapv3",
            "sushiswapv2"
        ]
    },
    [ChainId.ARBITRUM]: {
        transport: [
            http("https://lb.drpc.org/ogrpc?network=arbitrum&dkey=Ak765fp4zUm6uVwKu4annC8M80dnCZkR7pAEsm6XXi_w"),
            http("https://rpc.ankr.com/arbitrum"),
            http("https://arbitrum-one.public.blastapi.io"),
            http("https://endpoints.omniatech.io/v1/arbitrum/one/public"),
            http("https://arb1.croswap.com/rpc"),
            http("https://1rpc.io/arb"),
            http("https://arbitrum.blockpi.network/v1/rpc/public"),
            http("https://arb-mainnet-public.unifra.io"),
        ],
        liquidityProviders: [
            "dfyn",
            "elk",
            "sushiswapv3",
            "uniswapv3",
            "sushiswapv2"
        ]
    },
    [ChainId.AVALANCHE]: {
        transport: [
            http("https://api.avax.network/ext/bc/C/rpc"),
            http("https://rpc.ankr.com/avalanche")
        ],
        liquidityProviders: [
            "elk",
            "traderjoe",
            "sushiswapv3",
            "sushiswapv2"
        ]
    },
    [ChainId.BOBA]: {
        transport: [
            http("https://mainnet.boba.network"),
            http("https://lightning-replica.boba.network")
        ],
        liquidityProviders: [
            "sushiswapv3",
            "sushiswapv2"
        ]
    },
    [ChainId.BOBA_AVAX]: {
        transport: [
            http("https://avax.boba.network"),
            http("https://replica.avax.boba.network")
        ],
        liquidityProviders: [
            "sushiswapv2"
        ]
    },
    [ChainId.BOBA_BNB]: {
        transport: [
            http("https://bnb.boba.network"),
            http("https://replica.bnb.boba.network")
        ],
        liquidityProviders: [
            "sushiswapv2"
        ]
    },
    [ChainId.BSC]: {
        transport: [
            http("https://rpc.ankr.com/bsc"),
            http("https://lb.drpc.org/ogrpc?network=bsc&dkey=Ak765fp4zUm6uVwKu4annC8M80dnCZkR7pAEsm6XXi_w"),
            http("https://bsc-dataseed.binance.org"),
            http("https://bsc-dataseed1.binance.org"),
            http("https://bsc-dataseed2.binance.org"),
        ],
        liquidityProviders: [
            "apeswap",
            "biswap",
            "elk",
            "jetswap",
            "pancakeswap",
            "sushiswapv3",
            "sushiswapv2",
            "uniswapv3"
        ]
    },
    [ChainId.BTTC]: {
        transport: http("https://rpc.bittorrentchain.io"),
    },
    [ChainId.CELO]: {
        transport: http("https://forno.celo.org"),
        liquidityProviders: [
            "ubeswap",
            "sushiswapv2"
        ]
    },
    [ChainId.ETHEREUM]: {
        transport: [
            http("https://lb.drpc.org/ogrpc?network=ethereum&dkey=Ak765fp4zUm6uVwKu4annC8M80dnCZkR7pAEsm6XXi_w"),
            http("https://eth.llamarpc.com"),
            // http('https://eth.rpc.blxrbdn.com'),
            // http('https://virginia.rpc.blxrbdn.com'),
            // http('https://singapore.rpc.blxrbdn.com'),
            // http('https://uk.rpc.blxrbdn.com'),
            http("https://1rpc.io/eth"),
            http("https://ethereum.publicnode.com"),
            http("https://cloudflare-eth.com"),
        ],
        liquidityProviders: [
            "apeswap",
            "curveswap",
            "elk",
            "pancakeswap",
            "sushiswapv3",
            "sushiswapv2",
            "uniswapv2",
            "uniswapv3"
        ]
    },
    [ChainId.FANTOM]: {
        transport: [
            http("https://rpc.ankr.com/fantom"),
            http("https://rpc.fantom.network"),
            http("https://rpc2.fantom.network"),
        ],
        liquidityProviders: [
            "dfyn",
            "elk",
            "jetswap",
            "spookyswap",
            "sushiswapv3",
            "sushiswapv2"
        ]
    },
    [ChainId.FUSE]: {
        transport: http("https://rpc.fuse.io"),
        liquidityProviders: [
            "elk",
            "sushiswapv3",
            "sushiswapv2"
        ]
    },
    [ChainId.GNOSIS]: {
        transport: http("https://rpc.ankr.com/gnosis"),
        liquidityProviders: [
            "elk",
            "honeyswap",
            "sushiswapv3",
            "sushiswapv2"
        ]
    },
    [ChainId.HARMONY]: {
        transport: [
            http("https://api.harmony.one"),
            http("https://rpc.ankr.com/harmony")
        ],
        liquidityProviders: [
            "sushiswapv2"
        ]
    },
    [ChainId.KAVA]: {
        transport: [
            http("https://evm.kava.io"),
            http("https://evm2.kava.io"),
        ],
        liquidityProviders: [
            "elk"
        ]
    },
    [ChainId.MOONBEAM]: {
        transport: [
            http("https://rpc.api.moonbeam.network"),
            http("https://rpc.ankr.com/moonbeam")
        ],
        liquidityProviders: [
            "sushiswapv2"
        ]
    },
    [ChainId.MOONRIVER]: {
        transport: http("https://rpc.api.moonriver.moonbeam.network"),
        liquidityProviders: [
            "elk",
            "sushiswapv3",
            "sushiswapv2"
        ]
    },
    [ChainId.OPTIMISM]: {
        transport: [
            http("https://lb.drpc.org/ogrpc?network=optimism&dkey=Ak765fp4zUm6uVwKu4annC8M80dnCZkR7pAEsm6XXi_w"),
            http("https://rpc.ankr.com/optimism"),
            http("https://optimism-mainnet.public.blastapi.io"),
            http("https://1rpc.io/op"),
            http("https://optimism.blockpi.network/v1/rpc/public"),
            http("https://mainnet.optimism.io"),
        ],
        liquidityProviders: [
            "elk",
            "sushiswapv3",
            "uniswapv3"
        ]
    },
    [ChainId.POLYGON]: {
        transport: [
            http("https://polygon.llamarpc.com"),
            // http('https://polygon.rpc.blxrbdn.com'),
            http("https://polygon-mainnet.public.blastapi.io"),
            http("https://polygon.blockpi.network/v1/rpc/public"),
            http("https://polygon-rpc.com"),
            http("https://rpc.ankr.com/polygon"),
            http("https://matic-mainnet.chainstacklabs.com"),
            http("https://polygon-bor.publicnode.com"),
            http("https://rpc-mainnet.matic.quiknode.pro"),
            http("https://rpc-mainnet.maticvigil.com"),
            // ...polygon.rpcUrls.default.http.map((url) => http(url)),
        ],
        liquidityProviders: [
            "apeswap",
            "dfyn",
            "elk",
            "jetswap",
            "quickswap",
            "sushiswapv3",
            "sushiswapv2",
            "uniswapv3"
        ]
    },
    [ChainId.POLYGON_ZKEVM]: {
        transport: [
            http("https://zkevm-rpc.com"),
            http("https://rpc.ankr.com/polygon_zkevm"),
            http("https://rpc.polygon-zkevm.gateway.fm"),
        ],
        liquidityProviders: [
            "dovishv3",
            "sushiswapv3"
        ]
    },
    [ChainId.THUNDERCORE]: {
        transport: [
            http("https://mainnet-rpc.thundercore.com"),
            http("https://mainnet-rpc.thundercore.io"),
            http("https://mainnet-rpc.thundertoken.net"),
        ],
        liquidityProviders: [
            "laserswap",
            "sushiswapv3"
        ]
    },
}; 

/**
 * Resolves an array of case-insensitive names to LiquidityProviders, ignores the ones that are not valid
 *
 * @param {string[]} liquidityProviders - List of liquidity providers
 * @param {number} chainId - The chain id
 */
export const processLps = (liquidityProviders, chainId) => {
    if (
        !liquidityProviders ||
        !Array.isArray(liquidityProviders) ||
        !liquidityProviders.length ||
        !liquidityProviders.every(v => typeof v === "string")
    ) return undefined;
    const _lps = [];
    const LP = Object.values(LiquidityProviders);
    for (let i = 0; i < liquidityProviders.length; i++) {
        const index = LP.findIndex(
            v => v.toLowerCase() === liquidityProviders[i].toLowerCase()
                && !!fallbacks[chainId]?.liquidityProviders.includes(
                    liquidityProviders[i].toLowerCase()
                )
        );
        if (index > -1 && !_lps.includes(LP[index])) _lps.push(LP[index]);
    }
    return _lps.length ? _lps : undefined;
};  

export const getChainId = (chainId) => {
    if (chainId === 1) return ChainId.ETHEREUM;
    if (chainId === 56) return ChainId.BSC;
    if (chainId === 137) return ChainId.POLYGON;
    if (chainId === 250) return ChainId.FANTOM;
    if (chainId === 43114) return ChainId.AVALANCHE;
    if (chainId === 1666600000) return ChainId.HARMONY;
    if (chainId === 1287) return ChainId.MOONBEAM;
    if (chainId === 43120) return ChainId.ARBITRUM;
    if (chainId === 1666600001) return ChainId.HARMONY_TESTNET;
    if (chainId === 43114) return ChainId.AVALANCHE_TESTNET;
    if (chainId === 97) return ChainId.BSC_TESTNET;
    if (chainId === 401697) return ChainId.FANTOM_TESTNET;
}
