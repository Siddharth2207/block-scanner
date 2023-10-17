import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';  
import fs from 'fs'; 

function compare( a, b ) {
    if ( a.blockNumber < b.blockNumber ){
      return -1;
    }
    if ( a.blockNumber > b.blockNumber ){
      return 1;
    }
    return 0;
}  

function getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

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
                toToken : e[3],
                amountIn : e[4],
                amountOut : e[5],
                ratio : Number(e[6])
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
                    record.toToken,
                    record.amountIn,
                    record.amountOut,
                    record.ratio.toString()
                ],
            ]); 
            stream.write(outputCsvLine, function() {}); 
        }
        stream.end(); 
    }catch(error){
        console.log(">>> Error while sorting file :", error)
    }
} 

