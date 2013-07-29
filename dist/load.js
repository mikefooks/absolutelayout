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
        rows: 7,
        columns: 7
    }).refresh();

    window.testLayout = testLayout;

});