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
    // Sectors graph-------------------------------------------
    let industryGroup = sectorDim.group();

    dc.pieChart("#industrySplit")
        .height(500)
        .width(400)
        .dimension(sectorDim)
        .group(industryGroup);

    // companies graph-------------------------------------------
    let securityGroup = companyNameDim.group();

    dc.pieChart("#companySplit")
        .height(500)
        .width(500)
        .dimension(companyNameDim)
        .group(securityGroup);

    //chart sector against cash ratio-------------------------
    let cashGroup = sectorDim.group().reduce(
        function reduceAdd(p, v) {
            p.count++;
            p.total += +v.cashRatio;
            p.average = p.total / p.count;
            return p;
        },
        function reduceRemove(p, v) {
            p.count--;
            if (p.count == 0) {
                p.total = 0;
                p.average = 0;
            }
            else {
                p.total -= +v.cashRatio;
                p.average = p.total / p.count;
            }
            return p;
        },
        function reduceInit() {
            return { count: 0, total: 0, average: 0 };
        }
    );

    dc.barChart("#sectorCashSplit")
        .height(300)
        .width(1000)
        .dimension(sectorDim)
        .group(cashGroup)
        .valueAccessor(function(p) {
            return p.value.average;
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Industries")
        .yAxis().ticks(5);


    dc.renderAll();

}
