# Block Scanner and Report 
NodeJS app that scans blocks for external prices by quering major DeFi platforms and saves the result in the given `*.csv` file and generate report for the same data

## Setup 
This app requires NodeJS v18 or higher to run
- Clone the repo and run : 
```sh
npm install
``` 
### Scan Blocks for Data 
- To check avaliable options for running run : 
```sh
Usage: scan [options]

Generate a CSV file with external prices aggregated from the liquidity pools

Options:
  -i --input-token <input-token>              Input Token Address. Will override `INPUT_TOKEN` in env variables.
  -d --input-token-decimal <input-decimal>    Input Token Decimals. Will override `INPUT_TOKEN_DECIMAL` in env variables.
  -o --output-token <output-token>            Output Token Address. Will override `OUTPUT_TOKEN` in env variables.
  -D --output-token-decimal <output-decimal>  Output Token Deciamls. Will override `OUTPUT_TOKEN_DECIMAL` in env variables.
  -a --amount-in <amount-in>                  Fully denominated input token amount. Eg: For 1 USDT having 6 decimals, this will be 1000000. Will override `AMOUNT_IN` in env
                                              variables.
  -f --from-block <from-block>                Block number to start from. Will override `FROM_BLOCK` in env variables.
  -t --to-block <to-block>                    Block number to end at. Will override `TO_BLOCK` in env variables.
  -p --file-path <output-file-path>           Output file path. Will override `FILE_PATH` in env variables.
  -r --rpc-url <rpc-url>                      RPC URL to use for fetching data. Will override `RPC_URL` in env variables.
  --memoize                                   Memoize the results of the query. Will override `MEMOIZE` in env variables.
  -l, --lps <string>                          Optional list of liquidity providers (dex) to use by the router as one quoted string seperated by a comma for each, example:
                                              'SushiSwapV2,UniswapV3'. Will override `LIQUIDITY_PROVIDERS` in env variables.
  --pool-filter <pool-address>                Optional address of the pool to filter. Will override `POOL_FILTER` in env variables.
  --skip-blocks <number>                      Optional number of blocks to skip in every iteration. Will override `SKIP_BLOCKS` in env variables.
  --gas-limit <gas-limit>                     Optional gas Limit for the "arb" transaction.Default is 600000 gas units. Will override `GAS_LIMIT` in env variables.
  --gas-coverage <gas-coverage>               Optional percentage of gas to cover to be considered profitable for the transaction to be submitted.Default percentage is 100.
                                              Will override `GAS_COVERAGE` in env variables.
  -h, --help                                  display help for command
```
- Alternatively all options can be set in a `.env` file. Refer `.example.env` for reference. **CLI arguments will overide the env variables** .
Example :
```sh
# Input Token Address
INPUT_TOKEN="0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f" 

# Input Token Decimals
INPUT_TOKEN_DECIMAL="18" 

# Output Token
OUTPUT_TOKEN="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

# Output Token Decimals
OUTPUT_TOKEN_DECIMAL="6"  

# Fully denomiated input token amount.
AMOUNT_IN="30000000000000000000000" 

# Block to start iterating from
FROM_BLOCK="18383100" 

# Block to stop iterating to
TO_BLOCK="18384100" 

# Path of the csv file
FILE_PATH="./csv/ETH_GHO_USDC.csv" 

# RPC of the network
RPC_URL="https://eth.llamarpc.com" 

# Memoize the data
MEMOIZE="true" 

# Optional list of liquidity providers names seperated by a comma for each
LIQUIDITY_PROVIDERS="apeswap,elk,pancakeswap,sushiswapv2,sushiswapv3,uniswapv2,uniswapv3,trident" 

# Optional pool Filter to filter from
POOL_FILTER=""  

# Optional number of blocks to skip in the iteration 
SKIP_BLOCKS="1" 

# Optional approximate gas limit for each arb transaction
GAS_LIMIT="1000000"

# Optional gas coverage for the arb transaction to be considered profiatble
GAS_COVERAGE="120"   


```
- To run with env variables run : 
```sh
ts-node scan.ts
```
- To run with cli arguments run : 
```sh
ts-node scan.ts --input-token 0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f --input-token-decimal 18 --output-token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 --output-token-decimal 6 --amount-in 30000000000000000000000 --from-block 18383100  --to-block 18384100  --file-path "./csv/ETH_GHO_USDC.csv" --rpc-url https://eth.llamarpc.com --memoize
```
- All the data queried from the liquidity providers will be cached in the mem-cache folder. The size to the mem-cache folder will vary from few MBs of data to more than 10GBs, depending upon the block range and number of LPs. More LPs or higher block range means more data will be cached.
- To reduced the number LPs use the `--lps` option in the cli or `LIQUIDITY_PROVIDERS` env variable in .env file. This coupled with the `--pool-filter` cli argument (or the `POOL_FILTER` in env variables) will narrow down the search of arb opportunities to that particular liquidity provider and pool contract. 
- **Only single token pair data is generated at a time**. Example: Data generated for GHO-USDC input-output pair will be different from data generated for USDC-GHO input-output pair. For example : Above is the command for GHO-USDC pair. To generate data for USDC-GHO run : 
```sh
ts-node scan.ts --input-token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 --input-token-decimal 6 --output-token 0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f --output-token-decimal 18 --amount-in 30000000000 --from-block 18383100  --to-block 18384100  --file-path "./csv/ETH_USDC_GHO.csv" --rpc-url https://eth.llamarpc.com --memoize
```
- Notice that the `--input-token` and `--output-token` arguments values are swapped in the above command, as are `--input-token-decimal` and `--output-token-decimal`. The `--file-path` is also changed, along with `--amount-in` which now has value of `30000000000` i.e 30,000 USDC instead of `30000000000000000000000` i.e 30,000 GHO in previous case. Rest of the arguments remain same. Alternatively you can change values in .env file instead. 
- The output data generated in the *.csv file is represented by the columns : 
```sh
[CHAIN_ID], [BLOCK_NUMBER], [INPUT_TOKEN_ADDRESS], [INPUT_TOKEN_DECIMALS], [OUTPUT_TOKEN_ADDRESS],[OUTPUT_TOKEN_DECIMALS], [INPUT_AMOUNT], [OUTPUT_AMOUNT], [RATIO],[GAS_COST_IN_TOKEN]

1,18383119,0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f,18,0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,6,30000.0,29214.887535,0.9738295845,7.902483
1,18383120,0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f,18,0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,6,30000.0,29214.887535,0.9738295845,7.902483
1,18383115,0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f,18,0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,6,30000.0,29214.887535,0.9738295845,7.902483
1,18383118,0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f,18,0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,6,30000.0,29214.887535,0.9738295845,7.902483
1,18383116,0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f,18,0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,6,30000.0,29214.887535,0.9738295845,7.902483
1,18383114,0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f,18,0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,6,30000.0,29214.887535,0.9738295845,7.902483
``` 
where :  
- `CHAIN_ID` column value represents the chain id of the blockchain.
- `BLOCK_NUMBER` column value represents block number at which ratio was calculated.
- `INPUT_TOKEN_ADDRESS` column value represents input token address
- `INPUT_TOKEN_DECIMALS` column value represents decimals of input token
- `OUTPUT_TOKEN_ADDRESS` column value represents output token address
- `OUTPUT_TOKEN_DECIMALS` column value represents decimals of output token
- `INPUT_AMOUNT` column value represents decimal input amount formatted according to the number of decimals of the input token.
- `OUTPUT_AMOUNT` column value represents decimal output amount formatted according to the number of decimals of the output token.
- `RATIO` column value represents the `scale-18(output)/scale-18(input)` value .
- `GAS_COST_IN_TOKEN` column value represents the gas cost for the transaction in output token terms.


#### List of available liquidity providers (decentralized exchanges)
- all of the names are case INSENSITIVE:
`SushiSwapV2`
`SushiSwapV3`
`UniswapV2`
`UniswapV3`
`Trident`
`QuickSwap`
`ApeSwap`
`PancakeSwap`
`TraderJoe`
`Dfyn`
`Elk`
`JetSwap`
`SpookySwap`
`NetSwap`
`NativeWrap`
`HoneySwap`
`UbeSwap`
`Biswap`
`CurveSwap`
`DovishV3`
`LaserSwap` 

### Generate report.
- Generates report based on the csv data gathered and input threshold given, for given two token pairs.  
- **For the report to be generated, data for both TOKEN_A/TOKEN_B pair and TOKEN_B/TOKEN_A pair is required with approximate equal block ranges.**
```sh
ts-node report.ts --help 
```
```sh
Usage: report [options]

Generate report for sub1 token pair

Options:
  -b --buy-pair <csv file path>   Path to file containing buy pair data
  -s --sell-pair <csv file path>  Path to file containing sell pair data
  -r --buy-ratio <ratio>          Buy ratio threshold
  -R --sell-ratio <ratio>         Sell ratio threshold
  -h, --help                      display help for command
```
- Report generated is generated in a html file, served in a browser session at `http://localhost:3000/`. Example : 
```sh
ts-node report.ts -b "./csv/ETH_GHO_USDC.csv" -s "./csv/ETH_USDC_GHO.csv" -r 0.98 -R 1.029 
``` 
```
REPORT GENERATED :  http://localhost:3000/ 
```   

