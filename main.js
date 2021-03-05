const loader = document.getElementById('loader');
const error = document.getElementById('error');
const container = document.getElementById('charts');
const header = document.getElementsByTagName('header')[0];
const charts = [];

const populate = (title, data, fn, bar = false, avg7day) => {
	const computed = data.map(fn);
	let avg7dayComputed;

	if (avg7day) {
		avg7dayComputed = computed.map((x, i, arr) => {
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

	charts.push(new Chart(element, {
		type: bar ? 'bar' : 'line',
		data: {
			labels,
			datasets: [
				...(avg7day ? [
					{
						label: `Média (${avg7dayComputed[avg7dayComputed.length - 1].toLocaleString()})`,
						data: avg7dayComputed,
						borderColor: 'rgb(255,0,0)',
						fill: false,
						lineTension: 0,
						radius: 0,
						type: 'line'
					}
				] : []),
				{
					data: computed,
					label: `${avg7day ? 'Diário' : 'Total'} (${computed[computed.length - 1].toLocaleString()})`,
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
				text: title
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
						return `${avg7day ? tooltipItem.datasetIndex == 0 ? 'Média: ' : 'Diário: ' : ''}${tooltipItem.yLabel.toLocaleString()}`
					}
				}
			}
		}
	}));
};

(async () => {
	try {
		const data = (await (await fetch('https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalCasos')).json()).dias;

		for (const chart of charts) {
			chart.destroy();
		}

		populate('Casos acumulado', data, (x) => x.casosAcumulado);
		populate('Casos novos', data, (x) => x.casosNovos, true, true);
		populate('Óbitos acumulado', data, (x) => x.obitosAcumulado);
		populate('Óbitos novos', data, (x) => x.obitosNovos, true, true);

		header.style.display = 'block';
	}
	catch (err) {
		console.error(err.stack);
		error.style.display = 'block';
	}

	loader.style.display = 'none';
})();