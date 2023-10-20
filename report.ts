const { Command } = require("commander");
import { generateReportData, generateSub1ReportData, getERC20Metadata } from "./src";
import express from "express";
import Mustache from "mustache";
import fs from "fs";

const app = express();
app.use(express.static("graphs"));

async function main(argv){

    const cmdOptions = new Command()
        .requiredOption("-i --input-token <input-token-address>","Address of input token")
        .requiredOption("-o --output-token <output-token-address>","Address of output token")
        .requiredOption("-r --input-ratio <ratio>","Input ratio threshold")
        .requiredOption("-R --output-ratio <ratio>","Output ratio threshold")
        .requiredOption("--rpc-url <RPC URL>","Network rpc")
        .description([
            "Generate report for sub1 token pair",
        ].join("\n"))
        .parse(argv)
        .opts();

    const AddressPattern = /^0x[a-fA-F0-9]{40}$/;
    if (!AddressPattern.test(cmdOptions.inputToken)) throw "invalid input token address";
    if (!AddressPattern.test(cmdOptions.outputToken)) throw "invalid output token address";
    if (!cmdOptions.rpcUrl) throw "undefined RPC URL";

    const inputTokenMetadata = await getERC20Metadata(cmdOptions.inputToken,cmdOptions.rpcUrl)
    const outputTokenMetadata = await getERC20Metadata(cmdOptions.outputToken,cmdOptions.rpcUrl)
    if(inputTokenMetadata.nativeSymbol != outputTokenMetadata.nativeSymbol){
        throw "Mismatched network on input and output tokens"
    }

    const buyPairPath = `./csv/${inputTokenMetadata.nativeSymbol}_${inputTokenMetadata.symbol}_${outputTokenMetadata.symbol}.csv`
    const sellPairPath = `./csv/${inputTokenMetadata.nativeSymbol}_${outputTokenMetadata.symbol}_${inputTokenMetadata.symbol}.csv` 

    if (!fs.existsSync(buyPairPath)) {
        throw `Data for ${inputTokenMetadata.symbol} - ${outputTokenMetadata.symbol} token pair does not exist`
    }

    if (!fs.existsSync(sellPairPath)) {
        throw `Data for ${outputTokenMetadata.symbol} - ${inputTokenMetadata.symbol} token pair does not exist`
    }

    const buyPair = buyPairPath;
    const sellPair = sellPairPath; 
    const buyRatio = Number(cmdOptions.inputRatio);
    const sellRatio = Number(cmdOptions.outputRatio); 

    const buyPairData = await generateReportData(buyPair, buyRatio);
    const sellPairData = await generateReportData(sellPair, sellRatio);

    const sub1Report = await generateSub1ReportData(
        buyPair,
        sellPair,
        buyRatio,
        sellRatio
    );


    const template = fs.readFileSync("./html/template.html").toString();
    const rendered = Mustache.render(template, {
        buyPairName : buyPairData.fileName,
        buyPairBlockCount : buyPairData.blockCount,
        avgBuyRatio : buyPairData.avgRatio,
        targetBuyRatio : buyRatio,
        buyClearCount : buyPairData.clearThresholdCount ,
        buyUrl : `./${buyPairData.fileName}.png`,

        sellPairName : sellPairData.fileName,
        sellPairBlockCount : sellPairData.blockCount,
        avgSellRatio : sellPairData.avgRatio,
        targetSellRatio : sellRatio,
        sellClearCount : sellPairData.clearThresholdCount ,
        sellUrl : `./${sellPairData.fileName}.png`,

        buySellUrl : `./${buyPairData.fileName}-${sellPairData.fileName}.png`,
        roundTrips : sub1Report.roundTrips,
        returnForPeriod : sub1Report.returnForPeriod,
        sub1Mul : buyRatio * sellRatio


    });
    fs.writeFileSync("./html/report.html", rendered );

    app.get("/", (req, res)=>{
        res.sendFile("./html/report.html", {root:__dirname});
    });

    app.listen(3000, () => {
        console.log("\x1b[36mREPORT GENERATED\x1b[0m : \x1b[33m http://localhost:3000/ \x1b[0m");
    });

}

main(process.argv).catch((error) => {
    console.log("\x1b[31m%s\x1b[0m", "An error occured during execution: ");
    console.log(error);
    process.exitCode = 1;
});