import { ChartJSNodeCanvas, ChartCallback  } from "chartjs-node-canvas";
import { ChartConfiguration } from 'chart.js';
import { parse } from 'csv-parse/sync'; 
import fs from 'fs'; 
import path from "path" ; 
 

export function getLabels(filePath: string){
    const file =  fs.readFileSync(filePath)  

    const fileName = path.parse(filePath).name
    const input = file.toString() 

    const records = parse(input, {
        columns: false,
        skip_empty_lines: true
    });

    let blockNumbers = [] 
    let ratios = [] 
    for (let i = 0 ; i < records.length ; i++){
        blockNumbers.push(records[i][1].toString())
        ratios.push(Number(records[i][6]))
    }
    return {fileName, blockNumbers, ratios}
}  

export async function generateGraph(
    fileName : string,
    targetValue : number,
    blockNumbers : string[],
    ratios: number[]
) {
    
	const width = 1200;
	const height = 800;  
	const configuration: ChartConfiguration = {
		type: 'line',
		data: {
			labels:blockNumbers,
			datasets: [{
				label: `Line Chart For ${fileName}`,
				data: ratios, 
                fill: false,
				borderWidth: 1,
                tension: 0.1,
                borderColor : 'rgba(54, 162, 235, 1)'
			}]
		},
        options :{
            scales: {
                x: {
                  title : {
                    text: 'BLOCK NUMBERS',
                    display: true,
                    font: {
                        size: 15,
                        weight: 'bold'
                    }
                  }
                },
                y : {
                    title : {
                        text: 'RATIOS', 
                        display: true,
                        font: {
                            size: 15,
                            weight : 'bold'
                        }
                      }
                }
            },
            plugins: {
                tooltip: {
                    usePointStyle : true
                }
            },
           elements: {
                point:{
                    radius : function(context) {
                        if(context.parsed.y > targetValue){
                            return 5
                        }else{
                            return 3
                        }
                        
                    },
                    backgroundColor : function(context) {
                        if(context.parsed.y > targetValue){
                            return 'rgba(192, 0, 0, 1)'
                        }else{
                            return 'rgba(54, 162, 235, 0.2)'
                        }
                        
                    } 
                }
           }
        },
		plugins: [{
			id: 'background-colour',
			beforeDraw: (chart) => {
				const ctx = chart.ctx;
				ctx.save();
				ctx.fillStyle = 'white';
				ctx.fillRect(0, 0, width, height);
				ctx.restore();
			}
		}]
	}; 
	const chartCallback: ChartCallback = (ChartJS) => {
		ChartJS.defaults.responsive = true;
		ChartJS.defaults.maintainAspectRatio = false;
	};
	const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });
	const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
	await fs.promises.writeFile(`./graphs/${fileName}.png`, buffer, 'base64');
} 

export async function generateReportData(
    filePath: string,
    targetRatio : number
){
    const {fileName, blockNumbers, ratios} = getLabels(filePath)  

    let sumOfRatio = 0
    let blockCount = 0
    let clearThresholdCount = 0
    for (let i = 0 ; i < ratios.length ; i++){
        blockCount++;
        sumOfRatio += ratios[i]
        if(ratios[i] > targetRatio){
            clearThresholdCount++
        }
    } 
    const avgRatio = sumOfRatio/blockCount 
    await generateGraph(
        fileName,
        targetRatio,
        blockNumbers,
        ratios
    );
    return {
        fileName,
        blockCount,
        avgRatio,
        clearThresholdCount
    }


} 


export async function generateSub1ReportData(
    buyFilePath: string,
    sellFilePath: string,
    buyRatio : number,
    sellRatio : number
) {
    
    const buyFile = path.parse(buyFilePath).name
    const sellFile = path.parse(sellFilePath).name 

    const buyRecords = parse(fs.readFileSync(buyFilePath).toString()  , {
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

    const sellRecords = parse(fs.readFileSync(sellFilePath).toString()  , {
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

    let flag = 0 
    let currentBlock = 0
    let sub1 = []  
    let loopLength = buyRecords.length > sellRecords.length ? buyRecords.length : sellRecords.length
    for(let i = 0; i < loopLength ; i++){
        if(flag == 0){
            if(buyRecords[i].blockNumber > currentBlock && buyRecords[i].ratio > buyRatio){
                flag = 1
                currentBlock = buyRecords[i].blockNumber
                sub1.push(buyRecords[i])  
                i=-1
            }
        }else{ 
            if(sellRecords[i].blockNumber > currentBlock  && sellRecords[i].ratio > sellRatio){ 
                flag = 0
                currentBlock = sellRecords[i].blockNumber
                sub1.push(sellRecords[i])
                i=-1
            }
        }
    } 

    let blockNumbers = [] 
    let ratios = [] 
    for (let i = 0 ; i < sub1.length ; i++){
        blockNumbers.push(sub1[i].blockNumber.toString())
        ratios.push(sub1[i].ratio)
    }  
    
    const width = 1200;
	const height = 800;  
	const configuration: ChartConfiguration = {
		type: 'line',
		data: {
			labels:blockNumbers,
			datasets: [{
				label: `Line Chart For ${buyFile} and ${sellFile}`,
				data: ratios, 
                fill: false,
				borderWidth: 1,
                tension: 0.1,
                borderColor : 'rgba(54, 162, 235, 1)'
			}]
		},
        options :{ 
            scales: {
                x: {
                  type: 'linear',
                  position: 'bottom',
                  title : {
                    text: 'BLOCK NUMBERS',
                    display: true,
                    font: {
                        size: 15,
                        weight: 'bold'
                    }
                  }
                },
                y : {
                    title : {
                        text: 'RATIOS', 
                        display: true,
                        font: {
                            size: 15,
                            weight : 'bold'
                        }
                      }
                }
                
              },
          
           elements: {
                point:{ 
                    radius: 9,
                    backgroundColor : function(context) { 
                        
                        if(context.dataIndex % 2 == 0){
                            return 'rgba(192, 0, 0, 1)'
                        }else{
                            return 'rgba(3, 150, 3, 0.8)'
                        }
                        
                    } 
                }
           }
        },
		plugins: [{
			id: 'background-colour',
			beforeDraw: (chart) => {
				const ctx = chart.ctx;
				ctx.save();
				ctx.fillStyle = 'white';
				ctx.fillRect(0, 0, width, height);
				ctx.restore();
			}
		}]
	}; 
	const chartCallback: ChartCallback = (ChartJS) => {
		ChartJS.defaults.responsive = true;
		ChartJS.defaults.maintainAspectRatio = false;
	};
	const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });
	const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
	await fs.promises.writeFile(`./graphs/${buyFile}-${sellFile}.png`, buffer, 'base64');
    
    let buyVol = 0 
    let sellVol = 0 

    for(let i = 0 ; i < sub1.length ; i++){
        if(i % 2 == 0){
            buyVol += Number(sub1[i].amountIn)
        }else{
            sellVol += Number(sub1[i].amountIn)
        }
    }
    return {
        clears : sub1.length,
        buyVol : buyVol,
        sellVol : sellVol
    }

}    


