define([
    'backbone',
    'underscore',
    'highcharts',
    'datepicker',
    'text!templates/latency.html',
], function(Backbone, _, Highcharts, Datepicker, LatencyTemplate) {
    
    return Backbone.View.extend({
        
        tagName: 'div',

        className: 'box gradient',

        template:_.template(LatencyTemplate),

        events: {
            'click .refresh-graph' : 'getGraphData'
        },

        initialize: function() {
        },

        render: function() {
            $(this.el).html(this.template());
            return this;
        },

        setupDates: function() {
            this.$('#latency_start').datepicker();
            this.$('#latency_end').datepicker();
        },

        renderGraph: function(data) {
            this.setupDates();

            pretty = {
                'prestonologyweb0':'External Web0',
                'prestonologyweb1':'External Web1',
                'prestonologyweb2':'External Web2',
                'hagnaqmoweb0':'QMO Web0',
                'hagnaqmoweb1':'QMO Web1',
                'hagnaqmoweb2':'QMO Web2',
            }
            var options = {
                chart: {
                    renderTo: this.$('.placeholder')[0],
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: null
                },

                xAxis: {
                    type: 'datetime'
                },

                yAxis: {
                    title:{
                        text:'Latency (seconds)'
                    }
                },

                series: []
            };

            _.each(_.keys(data), function(key) {
                options.series.push({
                    'name':pretty[key],
                    'data':data[key]
                });
            })

            options.series[5].data = data[5];

            var chart = new Highcharts.Chart(options);
        },

        getGraphData: function() {
            var self = this;
            var mapped = {};
            var url = this.buildGraphURL();

            $.getJSON(url, function(data) {

                _.each(data['rows'], function(d) {
                    var name = self.buildMappedName(d);
                    if (!_.has(mapped, name)) {
                        mapped[name] = [];
                    }
                    mapped[name].push([d['key'],d['value']['latency']]);

                }, this);

                self.renderGraph(mapped);

            });

        },

        buildMappedName: function(d) {
            return d['value']['where'] + d['value']['destination'];
        },

        buildGraphURL: function() {
            var start = $('#latency_start').val();
            var end = $('#latency_end').val();

            if (!start) {
                var today = new Date();
                var day = today.getDate();
                var month = today.getMonth();
                var year = today.getFullYear();
                start = new Date(year, month, day).getTime() / 1000
            } else {
                var d = start.split("/")
                start = new Date(d[2], d[0]-1, d[1]).getTime() / 1000
            }

            if (end == 'Now') {
                end = new Date().getTime() / 1000;

            } else {
                var d = end.split("/")
                end = new Date(d[2], d[0]-1, d[1]).getTime() / 1000
            }
            
            var url = 'http://i.sm/couch/stats/_design/matt/_view/gammalatency';
            //var url = 'latency';
            var opt = '?startkey=' + encodeURI(JSON.stringify(start));
            opt += '&endkey=' + encodeURI(JSON.stringify(end));
            return url += opt
        }


    });
});

