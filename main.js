const loader = document.getElementById('loader');
const error = document.getElementById('error');
const header = document.getElementsByTagName('header')[0];

const populate = (title, data, fn) => {
	const daysInBrazil = data.Brazil.filter((x) => x.confirmed > 0).length;
	const labels = Array(daysInBrazil).fill(0).map((x, i) => `${i + 1}º dia`);
	const countBrazil = data.Brazil.filter((x) => x.confirmed > 0).map(fn);
	const countItaly = data.Italy.filter((x) => x.confirmed > 0).map(fn).filter((x, i) => i < daysInBrazil);
	const element = document.createElement('canvas');
	
	document.body.appendChild(element);

	new Chart(element, {
		type: 'line',
		data: {
			labels,
			datasets: [
				{
					label: `Brasil (${countBrazil[countBrazil.length - 1]})`,
					data: countBrazil,
					fill: false,
					borderColor: 'rgb(0,0,255)',
					lineTension: 0,
					radius: 0
				},
				{
					label: `Itália (${countItaly[countItaly.length - 1]})`,
					data: countItaly,
					fill: false,
					borderColor: 'rgb(255,0,0)',
					lineTension: 0,
					radius: 0
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
			}
		}
	});
};

(async () => {
	try {
		const data = await (await fetch('https://pomber.github.io/covid19/timeseries.json')).json();

		populate('Casos totais', data, (x) => x.confirmed);
		populate('Casos diários', data, (x, i, arr) => arr[i - 1] ? x.confirmed - arr[i - 1].confirmed : x.confirmed);
		populate('Mortes totais', data, (x) => x.deaths);
		populate('Mortes diárias', data, (x, i, arr) => arr[i - 1] ? x.deaths - arr[i - 1].deaths : x.deaths);
		populate('Casos recuperados', data, (x) => x.recovered);
		populate('Casos recuperados diários', data, (x, i, arr) => arr[i - 1] ? x.recovered - arr[i - 1].recovered : x.recovered);
		populate('Casos ativos', data, (x) => x.confirmed - x.recovered - x.deaths);

		loader.style.display = 'none';
		header.style.display = 'block';
	}
	catch (err) {
		loader.style.display = 'none';
		error.style.display = 'block';
	}
})();