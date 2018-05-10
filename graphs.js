queue()
    .defer(d3.csv, "securities.csv")
    .await(makeGraph);

function makeGraph(error, securitiesData) {

    let ndx = crossfilter(securitiesData);
// dimensions --------------------------------------------------
    let companyNameDim = ndx.dimension(dc.pluck("security"));
    
    let sectorDim = ndx.dimension(dc.pluck("sector"));
    
    let cashDim = ndx.dimension(dc.pluck("cashRatio"));
    
    let currentDim = ndx.dimension(dc.pluck("currentRatio"));
    
    let earningsDim = ndx.dimension(dc.pluck("earningsBeforeInterestAndTax"));
    
    let profitDim = ndx.dimension(dc.pluck("grossProfit"));
    
    let flowDim = ndx.dimension(dc.pluck("netCashFlow"));
    
    let quickDim = ndx.dimension(dc.pluck("quickRatio"));
    
// graphs -----------------------------------------------------------    
    let industryGroup = sectorDim.group();
    
    dc.pieChart("#industrySplit")
        .height(500)
        .width(400)
        .dimension(sectorDim)
        .group(industryGroup);
    
    
    let securityGroup = companyNameDim.group();
    
    dc.pieChart("#sectorSplit")
        .height(500)
        .width(400)
        .dimension(companyNameDim)
        .group(securityGroup);
    
    let cashGroup = sectorDim.group().reduceSum(dc.pluck("cashRatio"));
    
    dc.barChart("#sectorCashSplit")
        .height(300)
        .width(800)
        .dimension(sectorDim)
        .group(cashGroup)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Industries")
        .yAxis().ticks(5);
    
    
    dc.renderAll();
    
}