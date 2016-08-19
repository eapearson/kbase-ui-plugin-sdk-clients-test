/*global define*/
/*jslint white:true,browser:true*/
define([
    'bluebird',
    'kb/common/html',
    'kb_sdk_clients/AssemblyAPI/dev/AssemblyAPIClient',
    'kb_sdk_clients/GenomeAnnotationAPI/dev/GenomeAnnotationAPIClient',
    'kb_sdk_clients/TaxonAPI/dev/TaxonAPIClient'
], function (Promise, html, AssemblyAPI, GenomeAnnotationAPI, TaxonAPI) {
    'use strict';
    function factory(config) {
        var parent, container, runtime = config.runtime,
            div = html.tag('div'),
            h1 = html.tag('h1'), h2 = html.tag('h2'), h3 = html.tag('h3'),
            ul = html.tag('ul'), li = html.tag('li'),
            a = html.tag('a'), i = html.tag('i'),
            table = html.tag('table'), tr = html.tag('tr'),
            th = html.tag('th'), td = html.tag('td'), span = html.tag('span'), button = html.tag('button'),
            colgroup = html.tag('colgroup'), col = html.tag('col');



        function renderLayout() {
            return div({class: 'container-fluid'}, [
                div({class: 'col-md-12'}, div({dataElement: 'status'})),
                div({class: 'col-md-12'}, div({dataElement: 'error'})),
                div({class: 'col-md-12'}, div({dataElement: 'assembly-api'})),
                div({class: 'col-md-12'}, div({dataElement: 'genome-annotation-api'})),
                div({class: 'col-md-12'}, div({dataElement: 'taxon-api'}))
            ]);

        }
        function setContent(element, content) {
            var node = container.querySelector('[data-element="' + element + '"]');
            if (!node) {
                return;
            }
            node.innerHTML = content;
        }

        // API

        function attach(node) {
            parent = node;
            container = document.createElement('div');
            parent.appendChild(container);
        }


        function start(params) {
            return Promise.try(function () {
                container.innerHTML = renderLayout();
            });
        }

        function doAssemblyApi() {
            var client = new AssemblyAPI(runtime.config('services.service_wizard.url'), {
                token: runtime.service('session').getAuthToken()
            });
            return client.get_stats('436/8/1')
                .then(function (data) {
                    setContent('assembly-api', html.makePanel({
                        title: 'AssemblyAPI.get_stats',
                        content: div([
                            html.makeObjTable(data, {rotated: true})
                        ])
                    }));
                    console.log('SUCCESS DATA', data);
                });
        }

        function doGenomeAnnotationApi() {
            var client = new GenomeAnnotationAPI(runtime.config('services.service_wizard.url'), {
                token: runtime.service('session').getAuthToken()
            });
            return client.status()
                .then(function (data) {
                    setContent('genome-annotation-api', html.makePanel({
                        title: 'GenomeAnnotationAPI.get_status',
                        content: div([
                            html.makeObjTable(data, {rotated: true})
                        ])
                    }));
                    console.log('SUCCESS DATA', data);
                });
        }

        function doTaxonApi() {
            var client = new TaxonAPI(runtime.config('services.service_wizard.url'), {
                token: runtime.service('session').getAuthToken()
            });
            return client.get_info('436/9/1', 'y')
                .then(function (data) {
                    setContent('taxon-api', html.makePanel({
                        title: 'TaxonAPI.get_info',
                        content: div([
                            html.makeObjTable(data, {rotated: true})
                        ])
                    }));
                    console.log('SUCCESS DATA', data);
                });
        }

        function run(params) {
            return Promise.all([
                doAssemblyApi(),
                doGenomeAnnotationApi(),
                doTaxonApi()
            ])
                .catch(function (err) {
                    setContent('error', 'error :( -> ' + (err.message || err.error.message));
                    console.error('ERROR', err);
                });
        }

        function stop() {
            return Promise.try(function () {
                container.innerHTML = 'stopped!';
            });
        }

        function detach() {
            parent.removeChild(container);
            container.innerHTML = 'detached!';
        }

        return {
            attach: attach,
            start: start,
            run: run,
            stop: stop,
            detach: detach
        };
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
});