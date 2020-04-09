const loader = document.getElementById('loader');
const error = document.getElementById('error');
const header = document.getElementsByTagName('header')[0];
const container = document.getElementById('charts');
const selectA = document.getElementById('selectA');
const selectB = document.getElementById('selectB');
const reverse = document.getElementById('reverse');
const charts = [];

let data;
let countryA = 'Brazil';
let countryB;

const populate = (title, fn) => {
	const days = data[countryA].filter((x) => x.confirmed > 0).length;
	const countA = data[countryA].filter((x) => x.confirmed > 0).map(fn).filter((x, i) => i < days);
	const countB = data[countryB].filter((x) => x.confirmed > 0).map(fn).filter((x, i) => i < days);

	const labels = Array(days).fill(0).map((x, i) => {
		const day = i + 1;
		let suffix = 'th';
		if (day == 1) {
			suffix = 'st';
		}
		else if (day == 2) {
			suffix = 'nd';
		}
		return `${day}${suffix} day`;
	});

	const element = document.createElement('canvas');
	container.appendChild(element);

	charts.push(new Chart(element, {
		type: 'line',
		data: {
			labels,
			datasets: [
				{
					label: countryA,
					data: countA,
					borderColor: 'rgb(0,0,255)',
					fill: false,
					lineTension: 0,
					radius: 0
				},
				{
					label: countryB,
					data: countB,
					borderColor: 'rgb(255,0,0)',
					fill: false,
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
			},
			tooltips: {
				mode: 'index',
				intersect: false,
				displayColors: false
			}
		}
	}));
};

const populateAll = () => {
	for (const chart of charts) {
		chart.destroy();
	}
	charts.length = 0;
	container.innerHTML = '';

	populate('Total cases', (x) => x.confirmed);
	populate('Daily cases', (x, i, arr) => arr[i - 1] ? x.confirmed - arr[i - 1].confirmed : x.confirmed);
	populate('Total deaths', (x) => x.deaths);
	populate('Daily deaths', (x, i, arr) => arr[i - 1] ? x.deaths - arr[i - 1].deaths : x.deaths);
	populate('Total recovered', (x) => x.recovered);
	populate('Daily recovered', (x, i, arr) => arr[i - 1] ? x.recovered - arr[i - 1].recovered : x.recovered);
	populate('Active cases', (x) => x.confirmed - x.recovered - x.deaths);
}

selectA.onchange = (e) => {
	countryA = e.target.value;
	populateAll();
};

selectB.onchange = (e) => {
	countryB = e.target.value;
	populateAll();
};

reverse.onclick = () => {
	const aux = countryA;
	countryA = countryB;
	countryB = aux;
	selectA.value = countryA;
	selectB.value = countryB;
	populateAll();
}

(async () => {
	try {
		data = await (await fetch('https://pomber.github.io/covid19/timeseries.json')).json();
		const countries = Object.keys(data).filter(x => data[x][0].confirmed == 0);

		countries.sort((a, b) => {
			const aLast = data[a][data[a].length - 1];
			const bLast = data[b][data[b].length - 1];
			return aLast.confirmed > bLast.confirmed ? -1 : 1
		});

		countryB = countries[0];

		for (const country of countries) {
			const optionA = document.createElement('option');
			const optionB = document.createElement('option');
			optionA.value = optionB.value = country;
			optionA.innerText = optionB.innerText = country;
			selectA.appendChild(optionA);
			selectB.appendChild(optionB);
		}

		selectA.value = countryA;
		selectB.value = countryB;

		populateAll();
		header.style.display = 'block';
	}
	catch (err) {
		console.error(err.stack);
		error.style.display = 'block';
	}
	loader.style.display = 'none';
})();