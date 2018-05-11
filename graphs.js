queue()
    .defer(d3.csv, "securities.csv")
    .await(makeGraph);

function makeGraph(error, securitiesData) {

    let ndx = crossfilter(securitiesData);
    // dimensions --------------------------------------------------
    let companyNameDim = ndx.dimension(dc.pluck("security"));

    let sectorDim = ndx.dimension(dc.pluck("sector"));
    
    let sector2Dim = ndx.dimension(dc.pluck("sector"));
    
    let sector3Dim = ndx.dimension(dc.pluck("sector"));
    
    let sector4Dim = ndx.dimension(dc.pluck("sector"));

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
        .height(220)
        .width(220)
        .innerRadius(75)
        .minAngleForLabel( [3])
        .legend(dc.legend().x(70).y(57).itemHeight(9).gap(5))
        .dimension(sectorDim)
        .group(industryGroup);

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
        .width(400)
        .dimension(sector2Dim)
        .group(cashGroup)
        .valueAccessor(function(p) {
            return p.value.average;
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .yAxisLabel("Cash Ratio")
        .yAxis().ticks(5);

    // sector against current ratio-------------------------
    
    let currentGroup = sectorDim.group().reduce(
        function reduceAdd(p, v) {
            p.count++;
            p.total += +v.currentRatio;
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
                p.total -= +v.currentRatio;
                p.average = p.total / p.count;
            }
            return p;
        },
        function reduceInit() {
            return { count: 0, total: 0, average: 0 };
        }
    );

    dc.barChart("#sectorCurrentSplit")
        .height(300)
        .width(400)
        .dimension(sector3Dim)
        .group(currentGroup)
        .valueAccessor(function(p) {
            return p.value.average;
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .yAxisLabel("Current Ratio")
        .yAxis().ticks(5);
        
   // earnings by sector----------------------------------------     
     let earningsGroup = sectorDim.group().reduce(
        function reduceAdd(p, v) {
            p.count++;
            p.total += +v.earningsBeforeInterestAndTax;
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
                p.total -= +v.earningsBeforeInterestAndTax;
                p.average = p.total / p.count;
            }
            return p;
        },
        function reduceInit() {
            return { count: 0, total: 0, average: 0 };
        }
    );

    dc.barChart("#earnings")
        .height(300)
        .width(400)
        .dimension(sector4Dim)
        .group(earningsGroup)
        .valueAccessor(function(p) {
            return p.value.average;
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .yAxisLabel("EBIT")
        .yAxis().tickFormat(d3.format('e'));
  
// top 10 gross profit companies----------------------------------------------------------------  
        
    let profitGroup = companyNameDim.group().reduceSum(dc.pluck("grossProfit"));
    
    dc.rowChart("#profit")
    .height(300)
    .width(400)
    .dimension(companyNameDim)
    .group(profitGroup)
    .cap(10)
    .othersGrouper(false)
    .xAxis().tickFormat(d3.format('e'));

    
// top 10 ebit companies--------------------------------------------------------

    let earningsTopGroup = companyNameDim.group().reduceSum(dc.pluck("earningsBeforeInterestAndTax"));
    
    dc.rowChart("#earningsTop10")
    .height(300)
    .width(400)
    .dimension(companyNameDim)
    .group(profitGroup)
    .cap(10)
    .othersGrouper(false)
    .xAxis().tickFormat(d3.format('e'));


// gross profit and ebit by company--------------------------------------------    
    
    let companyDim = ndx.dimension(function(d) {
        return [d.earningsBeforeInterestAndTax, d.grossProfit, d.security];
    });
    
    let earningProfitGroup = companyDim.group();
        
        
        dc.scatterPlot("#earningsProfit")
            .height(400)
            .width(600)
            .margins({top:10, right:50, bottom:50, left:150})
            .x(d3.scale.linear().domain([-19000000000, 100000000000]))
            .brushOn(false)
            .symbolSize(8)
            .clipPadding(10)
            .yAxisLabel("Gross Profit")
            .xAxisLabel("EBIT")
            .title(function(d) {
                return d.key[2]
            })
            .dimension(companyDim)
            .group(earningProfitGroup)
            .xAxis().tickFormat(d3.format('e'));
            
// earnings and current ratio by company------------------------------

    let quick1Dim = ndx.dimension(dc.pluck("quickRatio"));

    let companyEarningsQuickDim = ndx.dimension(function(d) {
        return [d.quickRatio, d.earningsBeforeInterestAndTax, d.security];
    });
    
    let earnQuickGroup = companyEarningsQuickDim.group();
        
        
        dc.scatterPlot("#earningsQuick")
            .height(400)
            .width(550)
            .margins({top:10, right:50, bottom:50, left:150})
            .x(d3.scale.linear().domain([0, 250]))
            .brushOn(false)
            .symbolSize(8)
            .clipPadding(10)
            .yAxisLabel("EBIT")
            .xAxisLabel("Quick Ratio")
            .title(function(d) {
                return d.key[2]
            })
            .dimension(companyEarningsQuickDim)
            .group(earnQuickGroup)
            .yAxis().tickFormat(d3.format('e'));

    

    dc.renderAll();

}
