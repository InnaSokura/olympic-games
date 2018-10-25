function buildChart(data, columns) {
  const max = Math.max(...data.map(_ => _[columns[1]]));
  const barWidth = 80;

  console.log(`${columns[0].padEnd(5)} ${columns[1]}`.toUpperCase());
  console.log('-'.repeat(4) + '  ' + '-'.repeat(80));

  data.forEach((row) => {
    const label = String(row[columns[0]]).toUpperCase().padEnd(5);
    const value = row[columns[1]];
    const progress = '█'.repeat(Math.ceil(value/max*barWidth));
    console.log(`${label} ${progress} ${value || ''}`);
  });
}

module.exports = buildChart;
