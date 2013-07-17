/* search.js */

//= require Bacon
//= require underscore

/*jslint nomen: true*/
/*globals $,_,OpenLayers,otm,document,Bacon,JSON*/
/*jslint indent: 4, white: true */

var Search = (function ($,Bacon,config) {
    "use strict";

    var exports = {},
        // Quite manual right now but should be nicer in the future
        elems = { '#search-species':
                  { 'key': 'tree.species__id',
                    'pred': 'IS' },
                  '#dbh-min':
                  { 'key': 'tree.diameter',
                    'pred': 'MIN' },
                  '#dbh-max':
                  { 'key': 'tree.diameter',
                    'pred': 'MAX' }};

    function buildSearch(stream) {
        return _.reduce(elems, function(preds, key_and_pred, id) {
            var val = $(id).val(),
                pred = {};

            if (val && val.length > 0) {
                pred[key_and_pred.pred] = val;
                preds[key_and_pred.key] = pred;
            }

            return preds;
        }, {});
    }

    function executeSearch(search_query) {
        var search = $.ajax({
            url: '/' + config.instance.id + '/benefit/search',
            data: {'filter': JSON.stringify(search_query)},
            type: 'GET',
            dataType: 'json'});

        return Bacon.fromPromise(search);
    }

    function displaySearch(result) {
        var html = _.template($('#template-search-results').html(),
                              { search: result });

        $("#search-results").html(html);
    }

    exports.init = function(start_search_stream) {
        return start_search_stream
            .map(buildSearch)
            .flatMap(executeSearch)
            .onValue(displaySearch);
    };

    return exports;

}($, Bacon, otm.settings));