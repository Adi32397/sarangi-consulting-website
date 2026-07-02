fetch('http://localhost:5000/api/dashboard/stats')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data.charts.monthlyRevenue, null, 2)))
  .catch(err => console.error(err));
