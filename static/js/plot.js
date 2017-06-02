var graphDiv = document.getElementById('tester');
var trace1 = {
  x: [0, 2500],
  y: [.5, .5],
  type: 'scatter',
  mode: 'lines',
  marker: {
    color: '#aaaaaa',
    size: 1
  },
  shape : 'spline', 
	smoothing : 1.3
};
var data = [trace1];

var layout = {
	font: {
	    family: 'Courier New, monospace',
	    size: 10,
	    color: '#aaaaaa'
	},
	xaxis: {
		title: 'Wavelength',
		showgrid: false,
		zeroline: false
	},
	yaxis: {
		title: 'Intensity',
		showgrid: false,
		showticklabels: false,
		showline: false,
		tickmode: 'array',
		tickvals: [0, 255],
	},
	hovermode: !1,
	showlegend: false,
	autosize: false,
	width: 350,
	height: 200,
	margin: {
		l: 50,
		r: 50,
		b: 50,
		t: 50,
		pad: 4
	},
	paper_bgcolor: 'rgba(0, 0, 0, 0)',
	plot_bgcolor: 'rgba(0, 0, 0, 0)',
	shape : 'spline', 
	smoothing : 1.3
};

var plotOptions = {
	staticPlot: true,
	displayModeBar: false,
}
Plotly.newPlot(graphDiv, data, layout, plotOptions);