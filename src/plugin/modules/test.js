/*global define*/
/*jslint white:true,browser:true*/
define([
    'bluebird',
    'kb/common/html',
    'kb/common/domEvent',
    './ui',
    'kb_sdk_clients/AssemblyAPI/dev/AssemblyAPIClient',
    'kb_sdk_clients/GenomeAnnotationAPI/dev/GenomeAnnotationAPIClient',
    'kb_sdk_clients/TaxonAPI/dev/TaxonAPIClient'
], function (Promise, html, domEvent, UI, AssemblyAPI, GenomeAnnotationAPI, TaxonAPI) {
    'use strict';
    function factory(config) {
        var parent, container, runtime = config.runtime, events, ui,
            t = html.tag,
            div = t('div'),
            p = t('p'), a = t('a'),
            label = t('label'), input = t('input'),
            ul = t('ul'), li = t('li'),
            button = t('button');

        function renderLayout() {
            return div({class: 'container-fluid'}, [
                div({class: 'col-md-12'}, div({dataElement: 'status'})),
                div({class: 'col-md-12'}, div({dataElement: 'error'})),
                div({class: 'col-md-12'}, div({dataElement: 'assembly-api'})),
                div({class: 'col-md-12'}, div({dataElement: 'genome-annotation-api'})),
                div({class: 'col-md-12'}, div({dataElement: 'taxon-api'}))
            ]);

        }
        //function setContent(element, content) {
        //    var node = container.querySelector('[data-element="' + element + '"]');
        //    if (!node) {
        //        return;
        //    }
        //    node.innerHTML = content;
        // }

        function doAssemblyApi(ref) {
            var client = new AssemblyAPI({
                url: runtime.config('services.service_wizard.url'),
                version: 'dev',
                auth: {
                    token: runtime.service('session').getAuthToken()
                }
            });
            ui.setContent('assembly-api.data', html.loading());
            return client.get_stats(ref)
                .then(function (data) {
                    ui.setContent('assembly-api.data', div([
                        p({style: {color: 'green'}}, ['Showing output for ' + ref]),
                        html.makeObjTable(data, {rotated: true})
                    ]));
                })
                .catch(function (err) {
                    console.log('ERROR Assembly', err);
                    ui.setContent('assembly-api.data', html.makePanel({
                        title: 'Error! ' + err.name,
                        content: err.message
                    }));
                });

        }
        function renderAssemblyLayout() {
            ui.setContent('assembly-api', html.makePanel({
                title: 'AssemblyAPI.get_stats',
                content: div([
                    p(['Please enter a ref for an Assemply API compatible object ',
                        'of type KBaseGenomes.ContigSet or KBaseGenomeAnnotations.Assembly.']),
                    p({style: {fontStyle: 'italic'}}, [
                        'Hint: if you are using a local dev environment, pull up the ',
                        a({href: '#typebrowser', target: '_blank'}, 'type browser'), '.']),
                    label(['Ref for Assembly: ', input({type: 'text', dataElement: 'assembly-ref'})]),
                    button({type: 'button', id: events.addEvent('click', function (e) {
                            var ref = ui.getElement('assembly-api.assembly-ref').value;
                            if (ref) {
                                doAssemblyApi(ref);
                            }
                        })}, 'Show'),
                    div({dataElement: 'data'})
                ])
            }));
        }

        function doGenomeAnnotationApi(ref) {
            var client = new GenomeAnnotationAPI({
                url: runtime.config('services.service_wizard.url'),
                version: 'dev',
                auth: {
                    token: runtime.service('session').getAuthToken()
                }
            });
            ui.setContent('genome-annotation-api.data', html.loading());
            return client.get_feature_types({ref: ref})
                .then(function (data) {
                    ui.setContent('genome-annotation-api.data', div([
                        p({style: {color: 'green'}}, ['Showing output for ' + ref]),
                        ul(data.map(function (featureType) {
                            return li(featureType);
                        }))
                    ]));
                })
                .catch(function (err) {
                    console.log('ERROR Genome Annotation', err);
                    ui.setContent('genome-annotation-api.data', html.makePanel({
                        title: 'Error! ' + err.name,
                        content: err.message
                    }));
                });

        }
        function renderGenomeAnnotationLayout() {
            ui.setContent('genome-annotation-api', html.makePanel({
                title: 'GenomeAnnotationAPI.get_feature_types',
                content: div([
                    p(['Please enter a ref for an Genome Annotation API compatible object ',
                        'of type KBaseGenomes.Genome or KKBaseGenomeAnnotations.GenomeAnnotation.']),
                    p({style: {fontStyle: 'italic'}}, [
                        'Hint: if you are using a local dev environment, pull up the ',
                        a({href: '#typebrowser', target: '_blank'}, 'type browser'), '.']),
                    label(['Ref: ', input({type: 'text', dataElement: 'ref'})]),
                    button({type: 'button', id: events.addEvent('click', function (e) {
                            var ref = ui.getElement('genome-annotation-api.ref').value;
                            if (ref) {
                                doGenomeAnnotationApi(ref);
                            }
                        })}, 'Show'),
                    div({dataElement: 'data'})
                ])
            }));
        }
        
        
        function doTaxonApi(ref) {
            var client = new GenomeAnnotationAPI({
                url: runtime.config('services.service_wizard.url'),
                version: 'dev',
                auth: {
                    token: runtime.service('session').getAuthToken()
                }
            });
            ui.setContent('taxon-api.data', html.loading());
            return client.status(ref)
                .then(function (data) {
                    ui.setContent('taxon-api.data', div([
                        p({style: {color: 'green'}}, ['Showing output for ' + ref]),
                        html.makeObjTable(data, {rotated: true})
                    ]));
                })
                .catch(function (err) {
                    console.log('ERROR Taxon', err);
                    ui.setContent('taxon-api.data', html.makePanel({
                        title: 'Error! ' + err.name,
                        content: err.message
                    }));
                });

        }
        function renderTaxonLayout() {
            ui.setContent('taxon-api', html.makePanel({
                title: 'Taxon.get_info',
                content: div([
                    p(['Please enter a ref for an Taxon API (get_info method) compatible object ',
                        'of type KBaseGenomes.Genome or KKBaseGenomeAnnotations.Taxon.']),
                    p({style: {fontStyle: 'italic'}}, [
                        'Hint: if you are using a local dev environment, pull up the ',
                        a({href: '#typebrowser', target: '_blank'}, 'type browser'), '.']),
                    label(['Ref: ', input({type: 'text', dataElement: 'ref'})]),
                    button({type: 'button', id: events.addEvent('click', function (e) {
                            var ref = ui.getElement('taxon-api.ref').value;
                            if (ref) {
                                doTaxonApi(ref);
                            }
                        })}, 'Show'),
                    div({dataElement: 'data'})
                ])
            }));
        }

        // API

        function attach(node) {
            parent = node;
            container = document.createElement('div');
            events = domEvent.make();
            ui = UI.make({node: container}),
                parent.appendChild(container);
        }

        function start(params) {
            return Promise.try(function () {
                container.innerHTML = renderLayout();
            })
                .then(function () {
                    return Promise.all([
                        renderAssemblyLayout(),
                        renderGenomeAnnotationLayout(),
                        renderTaxonLayout()
                    ]);
                });
        }

        function run(params) {
            return Promise.all([
                // doAssemblyApi('436/8/1'),
                // doGenomeAnnotationApi(),
                // doTaxonApi('436/9/1'),
                // doTaxonApi('bad')
            ])
                .then(function () {
                    events.attachEvents();
                })
                .catch(function (err) {
                    ui.setContent('error', 'error :( -> ' + (err.message || err.error.message));
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