### Block Scanner
- Traverses blocks to get the ratios for a particular token pair and outputs the data in csv file. 

#### Setup 
- Clone the repo and run : 
```sh
npm install
``` 
#### Usage 
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
ts-node scan.ts -i 0x84342e932797FC62814189f01F0Fb05F52519708 -d 18 -o 0xc2132D05D31c914a87C6611C10748AEb04B58e8F -D 6 -a 1000000000000000000 -f 48377233 -t 48377243 -p "./POLYGON_NHT_USDT.csv" -l "sushiswapv2,sushiswapv3,uniswapv2,uniswapv3,quickswap" -r https://polygon.llamarpc.com --memoize 
``` 
- Check a token pair on Ethereum : 
```sh
ts-node scan.ts -i 0x6B175474E89094C44Da98b954EedeAC495271d0F -d 18 -o 0x853d955aCEf822Db058eb8505911ED77F175b99e -D 18 -a 29921892000000000000000 -f 18304470 -t 18304479 -p "./ETEHREUM_DAI_FRAX.csv" -l "uniswapv2,uniswapv3" -r https://1rpc.io/eth --memoize 
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


