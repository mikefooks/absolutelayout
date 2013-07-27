require.config({
	baseUrl: 'dist/',
	paths: {
		'layout': 'layout.min',
		'jquery': 'http://code.jquery.com/jquery-1.9.1.min'
	}
});

require(['layout', 'jquery'], function(Layout, $) {
	var testLayout = new Layout();
	testLayout.initConfig({
		fluid: true,
		container: 'div.layoutBox',
		rows: 10,
		columns: 10
	}).refresh();

	testLayout.addCell(2, 2, 2, 2, 'cell_1', 'testCell');

	$('header').on('click', function() {
		console.log(testLayout.Cells.cell_1);
		testLayout.Cells.cell_1.reposition(3, 3);
		console.log(testLayout.Cells.cell_1);
		console.log(testLayout.Cells.cell_1.toCss());
	});
});