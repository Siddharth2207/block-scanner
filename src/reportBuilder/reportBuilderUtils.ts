import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';  
import fs from 'fs'; 

/**
 * Sort function to sort according to block numbers.
*/
function compare( a, b ) {
    if ( a.blockNumber < b.blockNumber ){
      return -1;
    }
    if ( a.blockNumber > b.blockNumber ){
      return 1;
    }
    return 0;
}  
/**
 * Helper function to get unique values.
*/
function getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

/**
 * Remove duplicated records from csv file and sort them according to block numbers.
 * 
 * @param {string} filePath - Path of csv file .
*/
export const cleanSortCsv = async(filePath : string) => {
    try{
        const file =  fs.readFileSync(filePath) 
    
        let records = parse(file.toString(), {
            columns: false,
            skip_empty_lines: true
        }).map(e => {
            return{
                chainId : e[0],
                blockNumber : Number(e[1]) ,
                fromToken : e[2],
                fromTokenDecimals : e[3],
                toToken : e[4],
                toTokenDecimals : e[5],
                amountIn : e[6],
                amountOut : e[7],
                ratio : Number(e[8]),
                gasCostInToken : Number(e[9])
            }
        }) 
        
        records = getUniqueListBy(records,"blockNumber")
        records.sort(compare) 
        const stream = fs.createWriteStream(filePath);
        for(let i = 0 ; i < records.length ; i++){ 
            let record = records[i]
            const outputCsvLine = stringify([
                [
                    record.chainId.toString(),
                    record.blockNumber.toString(),
                    record.fromToken,
                    record.fromTokenDecimals.toString(),
                    record.toToken,
                    record.toTokenDecimals.toString(),
                    record.amountIn,
                    record.amountOut,
                    record.ratio,
                    record.gasCostInToken
                ],
            ]); 
            stream.write(outputCsvLine, function() {}); 
        }
        stream.end(); 
    }catch(error){
        console.log(">>> Error while sorting file :", error)
    }
} 

