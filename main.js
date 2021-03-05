const loader = document.getElementById('loader');
const error = document.getElementById('error');
const container = document.getElementById('charts');
const header = document.getElementsByTagName('header')[0];

const populate = (title, data, fn, bar = false, avg = false) => {
	const daily = data.map(fn);
	let avg7day;

	if (avg) {
		avg7day = daily.map((x, i, arr) => {
			const values = [];
			for (let k = i; k > (i - 7); k--) {
				if (k >= 0) {
					values.push(arr[k])
				}
			}
			return Math.round(values.reduce((acc, v) => acc + v, 0) / values.length);
		});
	}

	const labels = data.map(d => d._id);
	const element = document.createElement('canvas');
	container.appendChild(element);

	new Chart(element, {
		type: bar ? 'bar' : 'line',
		data: {
			labels,
			datasets: [
				...(avg ? [
					{
						label: `Média (${avg7day[avg7day.length - 1].toLocaleString()})`,
						data: avg7day,
						borderColor: 'rgb(255,0,0)',
						fill: false,
						lineTension: 0,
						radius: 0,
						type: 'line'
					}
				] : []),
				{
					data: daily,
					label: `${avg ? 'Diário' : 'Total'} (${daily[daily.length - 1].toLocaleString()})`,
					...(bar ?
						{
							backgroundColor: 'rgb(0,0,255)'
						} :
						{
							borderColor: 'rgb(0,0,255)',
							fill: false,
							lineTension: 0,
							radius: 0
						})
				}
			]
		},
		options: {
			title: {
				display: true,
				text: `${title} (${data[data.length - 1]._id})`
			},
			legend: {
				onClick: false
			},
			tooltips: {
				mode: 'index',
				intersect: false,
				displayColors: false,
				callbacks: {
					label: tooltipItem => {
						return `${avg ? tooltipItem.datasetIndex == 0 ? 'Média: ' : 'Diário: ' : ''}${tooltipItem.yLabel.toLocaleString()}`
					}
				}
			},
			scales: {
				yAxes: [{
					ticks: {
						callback: value => value.toLocaleString()
					}
				}]
			}
		}
	});
};

(async () => {
	try {
		const data = (await (await fetch('https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalCasos')).json());

		populate('Casos acumulado', data.dias, (x) => x.casosAcumulado);
		populate('Casos novos', data.dias, (x) => x.casosNovos, true, true);
		populate('Casos por semana', data.semana, (x) => x.casosNovos, true);
		populate('Óbitos acumulado', data.dias, (x) => x.obitosAcumulado);
		populate('Óbitos novos', data.dias, (x) => x.obitosNovos, true, true);
		populate('Óbitos por semana', data.semana, (x) => x.obitosNovos, true);

		header.style.display = 'block';
	}
	catch (err) {
		console.error(err.stack);
		error.style.display = 'block';
	}

	loader.style.display = 'none';
})();