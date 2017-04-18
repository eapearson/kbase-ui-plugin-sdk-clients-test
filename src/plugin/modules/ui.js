define([
    'bluebird',
    'kb_common/html',
    'bootstrap'
], function(Promise, html) {
    'use strict';
    var t = html.tag,
        div = t('div'),
        span = t('span'),
        ul = t('ul'),
        li = t('li'),
        a = t('a'),
        button = t('button'),
        pre = t('pre');

    // "static" methods
    function na() {
        return span({ style: { fontStyle: 'italic', color: 'orange' } }, 'NA');
    }

    function factory(config) {
        var container = config.node;

        /*
         * Just a wrapper around querySelector
         */
        function getElement(names) {
            if (typeof names === 'string') {
                names = names.split('.');
            }
            var selector = names.map(function(name) {
                return '[data-element="' + name + '"]';
            }).join(' ');

            return container.querySelector(selector);
        }

        function qsa(node, selector) {
            return Array.prototype.slice.call(node.querySelectorAll(selector, 0));
        }

        function getElements(names) {
            if (typeof names === 'string') {
                names = names.split('.');
            }
            var selector = names.map(function(name) {
                return '[data-element="' + name + '"]';
            }).join(' ');

            return qsa(container, selector);
        }

        function getButton(name) {
            if (typeof name !== 'string') {
                // names = names.split('.');
                // TODO: support a path of elements up to the button.
                throw new Error('Currently only a single string supported to get a button');
            }
            var selector = '[data-button="' + name + '"]',
                buttonNode = container.querySelector(selector);

            if (!buttonNode) {
                throw new Error('Button ' + name + ' not found');
            }
            return buttonNode;
        }

        function getNode(names) {
            if (typeof names === 'string') {
                names = [names];
            }
            var selector = names.map(function(dataSelector) {
                return '[data-' + dataSelector.type + '="' + dataSelector.name + '"]';
            }).join(' ');

            return container.querySelector(selector);
        }

        /*
         * a node spec is a list of path segment specs, which are each a simple
         * object where the keys are the suffix to a data- attribute and the v
         * values are the values. Each segment is an array of these, which are 
         * concatenated
         */
        function findNode(nodePath) {
            var selector = nodePath.map(function(pathElement) {
                return Object.keys(pathElement).map(function(dataKey) {
                    var dataValue = pathElement[dataKey];
                    return '[data-' + dataKey + '="' + dataValue + '"]';
                }).join('');
            }).join(' ');

            return container.querySelector(selector);
        }

        function renderInfoDialog(title, content, okLabel) {
            var dialog =
                div({ class: 'modal fade', tabindex: '-1', role: 'dialog' }, [
                    div({ class: 'modal-dialog' }, [
                        div({ class: 'modal-content' }, [
                            div({ class: 'modal-header' }, [
                                button({ type: 'button', class: 'close', dataDismiss: 'modal', ariaLabel: okLabel }, [
                                    span({ ariaHidden: 'true' }, '&times;')
                                ]),
                                span({ class: 'modal-title' }, title)
                            ]),
                            div({ class: 'modal-body' }, [
                                content
                            ]),
                            div({ class: 'modal-footer' }, [
                                button({ type: 'button', class: 'btn btn-default', dataDismiss: 'modal', dataElement: 'ok' }, okLabel)
                            ])
                        ])
                    ])
                ]);
            return dialog;
        }

        function hideElement(name) {
            var el = getElement(name);
            if (!el) {
                return;
            }
            el.classList.add('hidden');
        }

        function showElement(name) {
            var el = getElement(name);
            if (!el) {
                return;
            }
            el.classList.remove('hidden');
        }

        function makePanel(title, elementName) {
            return div({ class: 'panel panel-primary' }, [
                div({ class: 'panel-heading' }, [
                    div({ class: 'panel-title' }, title)
                ]),
                div({ class: 'panel-body' }, [
                    div({ dataElement: elementName, class: 'container-fluid' })
                ])
            ]);
        }

        function buildPanel(args) {
            var type = args.type || 'primary',
                classes = ['panel', 'panel-' + type],
                icon;
            if (args.hidden) {
                classes.push('hidden');
                // style.display = 'none';
            }
            if (args.classes) {
                classes = classes.concat(args.classes);
            }
            return div({ class: classes.join(' '), dataElement: args.name }, [
                (function() {
                    if (args.title) {
                        return div({ class: 'panel-heading' }, [
                            div({ class: 'panel-title' }, [args.title, icon])
                        ]);
                    }
                }()),
                div({ class: 'panel-body' }, [
                    args.body
                ])
            ]);
        }

        function makeCollapsiblePanel(title, elementName) {
            var collapseId = html.genId();

            return div({ class: 'panel panel-default' }, [
                div({ class: 'panel-heading' }, [
                    div({ class: 'panel-title' }, span({
                            class: 'collapsed',
                            dataToggle: 'collapse',
                            dataTarget: '#' + collapseId,
                            style: { cursor: 'pointer' }
                        },
                        title
                    ))
                ]),
                div({ id: collapseId, class: 'panel-collapse collapse' },
                    div({ class: 'panel-body' }, [
                        div({ dataElement: elementName, class: 'container-fluid' })
                    ])
                )
            ]);
        }

        function buildIcon(arg) {
            var klasses = ['fa'],
                style = [];
            klasses.push('fa-' + arg.name);
            if (arg.rotate) {
                klasses.push('fa-rotate-' + String(arg.rotate));
            }
            if (arg.flip) {
                klasses.push('fa-flip-' + arg.flip);
            }
            if (arg.size) {
                if (typeof arg.size === 'number') {
                    klasses.push('fa-' + String(arg.size) + 'x');
                } else {
                    klasses.push('fa-' + arg.size);
                }
            }
            if (arg.classes) {
                arg.classes.forEach(function(klass) {
                    klasses.push(klass);
                });
            }
            if (arg.style) {
                style = style.concat(arg.style);
            }

            return span({
                dataElement: 'icon',
                style: { verticalAlign: 'middle' },
                class: klasses.join(' ')
            });
        }

        function buildCollapsiblePanel(args) {
            var collapseId = html.genId(),
                type = args.type || 'primary',
                classes = ['panel', 'panel-' + type],
                collapseClasses = ['panel-collapse collapse'],
                toggleClasses = [],
                icon;
            if (args.hidden) {
                classes.push('hidden');
                // style.display = 'none';
            }
            if (!args.collapsed) {
                collapseClasses.push('in');
            } else {
                toggleClasses.push('collapsed');
            }
            if (args.classes) {
                classes = classes.concat(args.classes);
            }
            if (args.icon) {
                icon = [' ', buildIcon(args.icon)];
            }
            return div({ class: classes.join(' '), dataElement: args.name }, [
                div({ class: 'panel-heading' }, [
                    div({ class: 'panel-title' }, span({
                        class: toggleClasses.join(' '),
                        dataToggle: 'collapse',
                        dataTarget: '#' + collapseId,
                        style: { cursor: 'pointer' }
                    }, [args.title, icon]))
                ]),
                div({ id: collapseId, class: collapseClasses.join(' ') },
                    div({ class: 'panel-body' }, [
                        args.body
                    ])
                )
            ]);
        }

        function collapsePanel(path) {
            var node = getElement(path);
            if (!node) {
                return;
            }
            var collapseToggle = node.querySelector('[data-toggle="collapse"]'),
                targetSelector = collapseToggle.getAttribute('data-target'),
                collapseTarget = node.querySelector(targetSelector);

            collapseToggle.classList.add('collapsed');
            collapseToggle.setAttribute('aria-expanded', 'false');
            collapseTarget.classList.remove('in');
            collapseTarget.setAttribute('aria-expanded', 'false');
        }

        function expandPanel(path) {
            var node = getElement(path);
            if (!node) {
                return;
            }
            var collapseToggle = node.querySelector('[data-toggle="collapse"]'),
                targetSelector = collapseToggle.getAttribute('data-target'),
                collapseTarget = node.querySelector(targetSelector);

            collapseToggle.classList.remove('collapsed');
            collapseToggle.setAttribute('aria-expanded', 'true');
            collapseTarget.classList.add('in');
            collapseTarget.setAttribute('aria-expanded', 'true');
        }

        function buildButtonToolbar(arg) {
            return div({
                class: ['btn-toolbar'].concat(arg.classes || [])
            }, [
                div({
                    class: 'btn-group'
                }, arg.buttons)
            ]);
        }

        function createNode(markup) {
            var node = document.createElement('div');
            node.innerHTML = markup;
            return node.firstChild;
        }

        function setContent(path, content) {
            var node = getElements(path);
            node.forEach(function(node) {
                node.innerHTML = content;
            });
        }

        function addClass(path, klass) {
            var node = getElement(path);
            if (node) {
                if (!node.classList.contains(klass)) {
                    node.classList.add(klass);
                }
            }
        }

        function removeClass(path, klass) {
            var node = getElement(path);
            if (node) {
                node.classList.remove(klass);
            }
        }


        function buildIcon(arg) {
            var klasses = ['fa'],
                style = [];
            klasses.push('fa-' + arg.name);
            if (arg.rotate) {
                klasses.push('fa-rotate-' + String(arg.rotate));
            }
            if (arg.flip) {
                klasses.push('fa-flip-' + arg.flip);
            }
            if (arg.size) {
                if (typeof arg.size === 'number') {
                    klasses.push('fa-' + String(arg.size) + 'x');
                } else {
                    klasses.push('fa-' + arg.size);
                }
            }
            if (arg.classes) {
                arg.classes.forEach(function(klass) {
                    klasses.push(klass);
                });
            }
            if (arg.style) {
                style = style.concat(arg.style);
            }

            return span({
                dataElement: 'icon',
                style: { verticalAlign: 'middle' },
                class: klasses.join(' ')
            });
        }

        function reverse(arr) {
            var newArray = [],
                i, len = arr.length;
            for (i = len - 1; i >= 0; i -= 1) {
                newArray.push(arr[i]);
            }
            return newArray;
        }

        function updateTab(tabId, tabName, updates) {
            var node = document.getElementById(tabId);
            if (!node) {
                return;
            }

            // Update tab label
            var tabTab = findNode([{
                element: 'tab',
                name: tabName
            }]);

            // Update tab label 
            if (updates.label) {
                var labelNode = tabTab.querySelector('[data-element="label"]');
                if (labelNode) {
                    labelNode.innerHTML = updates.label;
                }
            }

            // update the tab icon
            if (updates.icon) {
                var iconNode = tabTab.querySelector('[data-element="icon"]');
                if (iconNode) {
                    // remove any icons.
                    var classList = iconNode.classList;
                    for (var i = classList.length; classList > 0; classList -= 1) {
                        if (classList.item[i].substring(0, 3) === 'fa-') {
                            classList.remove(classList.item[i]);
                        }
                    }
                    iconNode.classList.add('fa-' + updates.icon);
                }
            }

            // update tab color
            if (updates.color) {
                tabTab.style.color = updates.color;
            }

            // switch to tab
            if (updates.select) {

            }

        }

        function buildTabs(arg) {
            var tabsId = arg.id,
                tabsAttribs = {},
                tabClasses = ['nav', 'nav-tabs'],
                tabStyle = {},
                activeIndex, tabTabs,
                tabs = arg.tabs.filter(function(tab) {
                    return (tab ? true : false);
                }),
                events = [],
                content,
                selectInitialTab = false,
                tabMap = {},
                panelClasses = ['tab-pane'];

            if (arg.fade) {
                panelClasses.push('fade');
            }

            if (typeof arg.initialTab === 'number') {
                selectInitialTab = true;
            }

            if (tabsId) {
                tabsAttribs.id = tabsId;
            }

            tabs.forEach(function(tab) {
                tab.panelId = html.genId();
                tab.tabId = html.genId();
                if (tab.name) {
                    tabMap[tab.name] = tab.tabId;
                }
                if (tab.events) {
                    tab.events.forEach(function(event) {
                        events.push({
                            id: tab.tabId,
                            jquery: true,
                            type: event.type + '.bs.tab',
                            handler: event.handler
                        });
                    });
                }
            });
            if (arg.alignRight) {
                tabTabs = reverse(tabs);
                tabStyle.float = 'right';
                if (selectInitialTab) {
                    activeIndex = tabs.length - 1 - arg.initialTab;
                }
            } else {
                tabTabs = tabs;
                if (selectInitialTab) {
                    activeIndex = arg.initialTab;
                }
            }
            content = div(tabsAttribs, [
                ul({ class: tabClasses.join(' '), role: 'tablist' },
                    tabTabs.map(function(tab, index) {
                        var tabAttribs = {
                                role: 'presentation'
                            },
                            linkAttribs = {
                                href: '#' + tab.panelId,
                                dataElement: 'tab',
                                ariaControls: tab.panelId,
                                role: 'tab',
                                id: tab.tabId,
                                dataPanelId: tab.panelId,
                                dataToggle: 'tab'
                            },
                            icon, label = span({ dataElement: 'label' }, tab.label);
                        if (tab.icon) {
                            icon = buildIcon({ name: tab.icon });
                        } else {
                            icon = '';
                        }

                        if (tab.name) {
                            linkAttribs.dataName = tab.name;
                        }
                        if (selectInitialTab) {
                            if (index === activeIndex) {
                                tabAttribs.class = 'active';
                            }
                        }
                        tabAttribs.style = tabStyle;
                        return li(tabAttribs, a(linkAttribs, [icon, label].join(' ')));
                    })),
                div({ class: 'tab-content' },
                    tabs.map(function(tab, index) {
                        var attribs = {
                            role: 'tabpanel',
                            class: panelClasses.join(' '),
                            id: tab.panelId,
                            style: arg.style || {}
                        };
                        if (tab.name) {
                            attribs.dataName = tab.name;
                        }
                        if (index === 0) {
                            attribs.class += ' active';
                        }
                        return div(attribs, tab.content);
                    }))
            ]);
            return {
                content: content,
                events: events,
                map: tabMap
            };
        }


        function buildGridTable(arg) {
            return arg.table.map(function(row) {
                return div({ class: 'row', style: arg.row.style }, arg.cols.map(function(col, index) {
                    return div({ class: 'col-md-' + String(col.width), style: col.style }, row[index]);
                }));
            });
        }



        return {
            getElement: getElement,
            getButton: getButton,
            // setButton: setButton,
            getNode: getNode,
            hideElement: hideElement,
            showElement: showElement,
            makePanel: makePanel,
            buildPanel: buildPanel,
            makeCollapsiblePanel: makeCollapsiblePanel,
            buildCollapsiblePanel: buildCollapsiblePanel,
            collapsePanel: collapsePanel,
            expandPanel: expandPanel,
            createNode: createNode,
            setContent: setContent,
            na: na,
            buildButtonToolbar: buildButtonToolbar,
            buildIcon: buildIcon,
            addClass: addClass,
            removeClass: removeClass,
            buildTabs: buildTabs,
            updateTab: updateTab,
            buildGridTable: buildGridTable
        };
    }

    return {
        make: function(config) {
            return factory(config);
        },
        // "static" methods
        na: na
    };
});