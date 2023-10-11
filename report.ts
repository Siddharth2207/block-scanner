const { Command } = require("commander"); 
import { generateReportData } from './src';
import express from 'express'; 
import Mustache from 'mustache';
import http from 'http';
import path from 'path';
import fs from 'fs'; 

const app = express();
app.use(express.static('graphs'))

async function main(argv){

    const cmdOptions = new Command()
      .requiredOption("-b --buy-pair <csv file path>",`Path to file containing buy pair data`)
      .requiredOption("-s --sell-pair <csv file path>",`Path to file containing sell pair data`)
      .requiredOption("-r --buy-ratio <ratio>",`Buy Ratio`)
      .requiredOption("-R --sell-ratio <ratio>",`Sell Ratio`)
      .description([
        "Generate report for sub1 token pair",
      ].join("\n"))
      .parse(argv) 
      .opts();   

    const buyPair = cmdOptions.buyPair
    const sellPair = cmdOptions.sellPair
    const buyRatio = Number(cmdOptions.buyRatio)
    const sellRatio = Number(cmdOptions.sellRatio)

    const buyPairData = await generateReportData(buyPair, buyRatio)
    const sellPairData = await generateReportData(sellPair, sellRatio)

    
    const template = fs.readFileSync('./html/template.html').toString(); 
    const rendered = Mustache.render(template, {
      buyPairName : buyPairData.fileName,
      buyPairBlockCount : buyPairData.blockCount,
      avgBuyRatio : buyPairData.avgRatio,
      targetBuyRatio : buyRatio,
      buyClearCount : buyPairData.clearThresholdCount ,

      sellPairName : sellPairData.fileName,
      sellPairBlockCount : sellPairData.blockCount,
      avgSellRatio : sellPairData.avgRatio,
      targetSellRatio : sellRatio,
      sellClearCount : sellPairData.clearThresholdCount 

    });
    fs.writeFileSync('./html/report.html', rendered );

    app.get('/', (req, res)=>{
      res.sendFile('./html/report.html', {root:__dirname})
    }) 

    app.listen(3000, () => {
      console.log(`\x1b[36mREPORT GENERATED\x1b[0m : \x1b[33m http://localhost:3000/ \x1b[0m`);
    })
 
} 

main(process.argv).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });  