const loader = document.getElementById('loader');
const error = document.getElementById('error');
const header = document.getElementsByTagName('header')[0];
const container = document.getElementById('charts');
const checkbox = document.getElementById('extender');
const charts = [];

const populate = (title, data, extend, bar, fn) => {
	const days = data[extend ? 'Italy' : 'Brazil'].filter((x) => x.confirmed > 0).length;
	const labels = Array(days).fill(0).map((x, i) => `${i + 1}º dia`);
	const countBrazil = data.Brazil.filter((x) => x.confirmed > 0).map(fn).filter((x, i) => i < days);
	const countItaly = data.Italy.filter((x) => x.confirmed > 0).map(fn).filter((x, i) => i < days);
	const element = document.createElement('canvas');
	container.appendChild(element);
	charts.push(new Chart(element, {
		type: bar ? 'bar' : 'line',
		data: {
			labels,
			datasets: [
				{
					label: 'Brasil',
					data: countBrazil,
					...(bar ? { backgroundColor: 'rgb(0,0,255)' } : { borderColor: 'rgb(0,0,255)' }),
					...(bar ? {} : { fill: false }),
					...(bar ? {} : { lineTension: 0 }),
					...(bar ? {} : { radius: 0 })
				},
				{
					label: 'Itália',
					data: countItaly,
					...(bar ? { backgroundColor: 'rgb(255,0,0)' } : { borderColor: 'rgb(255,0,0)' }),
					...(bar ? {} : { fill: false }),
					...(bar ? {} : { lineTension: 0 }),
					...(bar ? {} : { radius: 0 })
				}
			]
		},
		options: {
			title: {
				display: true,
				text: title
			},
			legend: {
				onClick: false
			},
			tooltips: {
				mode: 'index',
				intersect: false,
				displayColors: false
			}
		}
	}));
};

const populateAll = (data, extend = false) => {
	for (const chart of charts) {
		chart.destroy();
	}
	charts.length = 0;
	container.innerHTML = '';
	populate('Casos totais', data, extend, false, (x) => x.confirmed);
	populate('Casos diários', data, extend, true, (x, i, arr) => arr[i - 1] ? x.confirmed - arr[i - 1].confirmed : x.confirmed);
	populate('Mortes totais', data, extend, false, (x) => x.deaths);
	populate('Mortes diárias', data, extend, true, (x, i, arr) => arr[i - 1] ? x.deaths - arr[i - 1].deaths : x.deaths);
	populate('Casos recuperados', data, extend, false, (x) => x.recovered);
	populate('Casos recuperados diários', data, extend, true, (x, i, arr) => arr[i - 1] ? x.recovered - arr[i - 1].recovered : x.recovered);
	populate('Casos ativos', data, extend, false, (x) => x.confirmed - x.recovered - x.deaths);
}

(async () => {
	try {
		const data = await (await fetch('https://pomber.github.io/covid19/timeseries.json')).json();
		populateAll(data);
		checkbox.onchange = (e) => {
			populateAll(data, e.target.checked);
		};
		loader.style.display = 'none';
		header.style.display = 'block';
	}
	catch (err) {
		loader.style.display = 'none';
		error.style.display = 'block';
	}
})();