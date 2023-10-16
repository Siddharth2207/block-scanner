### Block Scanner
- Traverses blocks to get the ratios for a particular token pair and outputs the data in csv file. 

#### Setup 
- Clone the repo and run : 
```sh
npm install
``` 
#### Scan Blocks for Data 
- To check avaliable options for running run : 
```sh
ts-node scan.ts --help 
``` 
-Following are the options avaliable : 
```sh
Usage: scan [options]

Generate a CSV file with the following columns

Options:
  -i --input-token <input-token>        Input Token Address
  -d --input-decimal <input-decimal>    Input Token Decimals
  -o --output-token <output-token>      Output Token Address
  -D --output-decimal <output-decimal>  Output Token Deciamls
  -a --amount-in <amount-in>            Fully denominated input token amount. Eg: For 1 USDT having 6 decimals, this will be 1000000
  -f --from-block <from-block>          Block number to start from
  -t --to-block <to-block>              Block number to end at
  -p --file-path <output-file-path>     Output file path
  -r --rpc-url <rpc-url>                RPC URL to use for fetching data.
  --memoize                             Memoize the results of the query.
  -l, --lps <string>                    List of liquidity providers as one quoted string seperated by a comma for each. Example: 'SushiSwapV2,UniswapV3'
  -h, --help                            display help for command
```

#### Example : 
- Check a token pair on Polygon : 
```sh
ts-node scan.ts -i 0x84342e932797FC62814189f01F0Fb05F52519708 -d 18 -o 0xc2132D05D31c914a87C6611C10748AEb04B58e8F -D 6 -a 1000000000000000000 -f 48469533 -t 48469633 -p "./POLYGON_NHT_USDT.csv" -l "sushiswapv2,sushiswapv3,uniswapv2,uniswapv3,quickswap" -r https://polygon.llamarpc.com --memoize 
``` 
- Check a token pair on Ethereum : 
```sh
ts-node scan.ts -i 0x853d955acef822db058eb8505911ed77f175b99e -d 18 -o 0x6B175474E89094C44Da98b954EedeAC495271d0F -D 18 -a 30030000000000000000000 -f 18324137 -t 18331137 -p "./ETEHREUM_FRAX_USDT_1d.csv" -l "apeswap,elk,pancakeswap,sushiswapv2,sushiswapv3,uniswapv2,uniswapv3,trident" -r https://eth-mainnet.g.alchemy.com/v2/zv_qezhqKEtY-ZRKRUbDHD2VqlPYASBK --memoize 
``` 
- The output data generated in the *.csv file is represented by the columns : 
```sh
[CHAIN_ID], [BLOCK_NUMBER], [INPUT_TOKEN_ADDRESS], [OUTPUT_TOKEN_ADDRESS], [INPUT_AMOUNT], [OUTPUT_AMOUNT], [RATIO]

137,48377233,0x84342e932797FC62814189f01F0Fb05F52519708,0xc2132D05D31c914a87C6611C10748AEb04B58e8F,1.0,0.000000000000000254,0.000254
137,48377234,0x84342e932797FC62814189f01F0Fb05F52519708,0xc2132D05D31c914a87C6611C10748AEb04B58e8F,1.0,0.000000000000000254,0.000254
137,48377235,0x84342e932797FC62814189f01F0Fb05F52519708,0xc2132D05D31c914a87C6611C10748AEb04B58e8F,1.0,0.000000000000000254,0.000254
137,48377236,0x84342e932797FC62814189f01F0Fb05F52519708,0xc2132D05D31c914a87C6611C10748AEb04B58e8F,1.0,0.000000000000000254,0.000254
137,48377237,0x84342e932797FC62814189f01F0Fb05F52519708,0xc2132D05D31c914a87C6611C10748AEb04B58e8F,1.0,0.000000000000000254,0.000254
``` 
where :  
- `CHAIN_ID` column value represents the chain id of the blockchain.
- `BLOCK_NUMBER` column value represents block number at which ratio was calculated.
- `INPUT_TOKEN_ADDRESS` column value represents input token address
- `OUTPUT_TOKEN_ADDRESS` column value represents output token address
- `INPUT_AMOUNT` column value represents decimal input amount formatted according to the number of decimals of the input token.
- `OUTPUT_AMOUNT` column value represents decimal output amount formatted according to the number of decimals of the output token.
- `RATIO` column value represents the `scale-18(output)/scale-18(input)` value .


#### Generate report 
- Generates report based on the csv data gathered and input threshold given. 

```sh
ts-node report.ts --help 
``` 
```sh
Usage: report [options]

Generate report for sub1 token pair

Options:
  -b --buy-pair <csv file path>   Path to file containing buy pair data
  -s --sell-pair <csv file path>  Path to file containing sell pair data
  -r --buy-ratio <ratio>          Buy Ratio
  -R --sell-ratio <ratio>         Sell Ratio
  -h, --help                      display help for command
``` 
- Report generated is generated in a html file, served on `http://localhost:3000/`. Example : 
```sh
ts-node report.ts -b "./csv/ETH_FRAX_DAI.csv" -s "./csv/ETH_DAI_FRAX.csv" -r 0.9964 -R 1.0058 
``` 
```
REPORT GENERATED :  http://localhost:3000/ 
``` 

ts-node scan.ts -i 0x853d955acef822db058eb8505911ed77f175b99e -d 18 -o 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 -D 6 -a 30030000000000000000000  -p "./csv/FRAX_USDC/18200136-x.csv" -l "curveswap" -r https://eth-mainnet.g.alchemy.com/v2/zv_qezhqKEtY-ZRKRUbDHD2VqlPYASBK --memoize -f 18200136 -t 18308136 --pool-filter 0xdcef968d416a41cdac0ed8702fac8128a64241a2   


ts-node scan.ts -i 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 -d 6 -o 0x853d955acef822db058eb8505911ed77f175b99e -D 18 -a 30000000000  -p "./csv/testx.csv" -l "curveswap" -r https://eth-mainnet.g.alchemy.com/v2/zv_qezhqKEtY-ZRKRUbDHD2VqlPYASBK --memoize -f 18317320 -t 18331180 

ts-node report.ts -b "./csv/FRAX_USDC/ETH_FRAX_USDC.csv" -s "./csv/FRAX_USDC/ETH_USDC_FRAX.csv" -r 0.999 -R 1.00205  


ts-node scan.ts -i 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 -d 6 -o 0x853d955acef822db058eb8505911ed77f175b99e -D 18 -a 30000000000  -p "./csv/FRAX_USDC/18332138-x-rev.csv" -l "curveswap" -r https://eth-mainnet.g.alchemy.com/v2/zv_qezhqKEtY-ZRKRUbDHD2VqlPYASBK --memoize -f 18332138 -t 18361302 --pool-filter 0xdcef968d416a41cdac0ed8702fac8128a64241a2    

ts-node scan.ts -i 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 -d 6 -o 0x853d955acef822db058eb8505911ed77f175b99e -D 18 -a 30000000000  -p "./csv/FRAX_USDC/18000135-x-rev.csv" -l "curveswap" -r https://eth-mainnet.g.alchemy.com/v2/zv_qezhqKEtY-ZRKRUbDHD2VqlPYASBK --memoize -f 18000135 -t 18200136 --pool-filter 0xdcef968d416a41cdac0ed8702fac8128a64241a2   

