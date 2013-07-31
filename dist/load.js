require.config({
    baseUrl: 'dist/',
    paths: {
        'layout': 'layout.min',
        'controller': 'controller.min',
        'jquery': 'http://code.jquery.com/jquery-1.9.1.min'
    }
});

require(['layout', 'controller', 'jquery'], function(Layout, Controller, $) {
    var testLayout = new Layout(),
        testController = new Controller();
    
    testLayout.initConfig({
        fluid: true,
        container: 'div.layoutBox',
        rows: 7,
        columns: 7
    }).refresh();

    testLayout.addCell(3, 3, 1, 1, 'testCell', 'controlBox');

    testController.init(testLayout);

    window.testLayout = testLayout;
    window.testController = testController;

});