angular.module('dmPredictiveSearch.directive', [
    ])
    .directive('rm53PredictiveSearch', predictiveSearchDirective)
    .directive('rm53PredictiveSearchItem', predictiveSearchItemDirective)
    .directive('rm53InputAutosize', inputAutosizeDirective)
    .controller('PredictiveSearchController', PredictiveSearchController);

predictiveSearchDirective.$inject = [];
/* @ngInject */
function predictiveSearchDirective() {
    return {
        restrict: 'E',
        controller: 'PredictiveSearchController',
        controllerAs: 'psvm',
        bindToController: true,
        scope: {
            name: '@?',
            searchPlaceholder: '@?',
            customFilter: '@?',
            source: '<',
            onChange: '&?',
            onSelect: '&?',
            clearOnBlur: '@?',
            customTemplate: '@?',
            minLength: '@?',
            viewValue: '=?',
            validator: '&?',
            loading: '<?',
            disabledSpinner: '@?',
            matchTemplate: '@?',
            multiSelect: '@?',
            selectedItems: '=?',
            selectedItemTemplate: '@?',
            onRemoveItem: '&?',
            selectedItemDisplayProperty: '@?'
        },
        compile: compile,
        templateUrl: 'predictiveSearch.html'
    };
    
    function compile(tElement) {
        /* Set custom popup template if user does passes one in */
        if(typeof tElement.attr('popup-template') !== 'undefined') {
            tElement.find('input').attr('typeahead-popup-template-url', tElement.attr('popup-template'));
        }
        /* Set default match template if user does not pass a custom one in */
        if(typeof tElement.attr('match-template') === 'undefined') {
            tElement.attr('match-template', 'uib/template/typeahead/typeahead-match.html');
        }
        return link;
    }
    function link(scope, element) {
        var input = element.find('input');
        var wrapper = element.children();
        wrapper.on('click', function() {
            input[0].focus();
        });
        input.on('focus', function() {
            wrapper.addClass('rm53-input-group-focused');
        });
        input.on('blur', function() {
            wrapper.removeClass('rm53-input-group-focused');
            if(!angular.isDefined(scope.psvm.clearOnBlur) || scope.psvm.clearOnBlur === 'true') {
                element.removeClass('rm53-invalid-search-text');
                input.val('');
            }

        });
        input.on('keydown', handleKeyDownEvent);
        function handleKeyDownEvent(event) {
            var keyCode = event.keyCode;
            element.removeClass('rm53-invalid-search-text');
            if(keyCode === 13 || keyCode === 9 && scope.psvm.matches.length === 0) {
                element.removeClass('rm53-invalid-search-text');
                if(input.val().length > 0) {
                    event.preventDefault();
                    if(typeof scope.psvm.validator !== 'function' || scope.psvm.validator({value: input.val()})) {
                        var customItem = {};
                        customItem[scope.psvm.selectedItemDisplayProperty] = input.val();
                        scope.$apply(function() {
                            scope.psvm.addSelectedItem(customItem);
                            input.val('');
                            scope.psvm.viewValue = '';
                        });
                    }
                    else {
                        element.addClass('rm53-invalid-search-text');
                    }

                }
            }
        }
    }
}

predictiveSearchItemDirective.$inject = [];
/* @ngInject */
function predictiveSearchItemDirective() {
    return {
        restrict: 'E',
        require: '^rm53PredictiveSearch',
        scope: {
            data: '='
        },
        template: '<ng-include src="template"></ng-include>',
        link: link
    };
    
    function link(scope, element, attrs, predictiveSearchCtrl) {
        var predictiveSearch = predictiveSearchCtrl.registerSelectedItem(),
            options = predictiveSearch.getOptions();
        scope.template = options.template;
        scope.getDisplayText = function() {
            if(angular.isDefined(options.displayProperty)) {
                return scope.data[options.displayProperty];
            }
            else {
                return scope.data;
            }

        };
        scope.removeTag = function() {
            predictiveSearch.removeSelectedItem(scope.$index, scope.data);
        };
        
        scope.$watch('$parent.$index', function(value) {
            scope.$index = value;
        });
    }
}

inputAutosizeDirective.$inject = [];
/* @ngInject */
function inputAutosizeDirective() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var threshold = 50;
            var span = angular.element('<span class="input"></span>');
            span.css('display', 'none')
                .css('visibility', 'hidden')
                .css('width', 'auto')
                .css('white-space', 'pre');
            
            element.parent().append(span);
            
            function resize(originalValue) {
                var value = originalValue, width;
                
                if (angular.isString(value) && value.length === 0) {
                    value = attrs.placeholder;
                }
                
                if (value) {
                    span.text(value);
                    span.css('display', '');
                    width = span.prop('offsetWidth');
                    span.css('display', 'none');
                }
                
                element.css('width', width ? width + threshold + 'px' : '');
                
                return originalValue;
            }
            attrs.$observe('placeholder', function(value) {
                resize(value);
            });
            element.on('keydown', function(){
                resize(element.val());
            });
        }
    };
}

PredictiveSearchController.$inject = ['$scope', '$q', '$timeout', '$injector', '$filter'];
/* @ngInject */
function PredictiveSearchController($scope, $q, $timeout, $injector, $filter) {
    var vm = this;
    vm.matches = [];
    vm.addSelectedItem = addSelectedItem;
    vm.getMatches = getMatches;
    vm.registerSelectedItem = registerSelectedItem;
    var timeout;
    init();
    
    function init() {
        if(!angular.isDefined(vm.selectedItems)) {
            vm.selectedItems = [];
        }
        if(!angular.isDefined(vm.viewValue)) {
            vm.viewValue = '';
        }
    }
    function getMatches() {
        var deferred = $q.defer();
        /* Cancel other calls to get matches so only most recent one goes through */
        if(timeout) {
            $timeout.cancel(timeout);
        }
        /* $timeout to fix bug where isolate scope with delegated onchange (via function passed with &) will run before scope
         * value updates (vm.viewValue) */
        timeout = $timeout(function() {
            /* For Async searches where value is passed out to update results list */
            if(typeof vm.onChange === 'function') {
                vm.onChange({value: vm.viewValue}).then(function(result) {
                    vm.source = result;
                    updateResults();
                    deferred.resolve(vm.matches);
                });
            } else if(vm.loading) {
                /* For searches where source list is static after initial load from server */
                var unbindWatch = $scope.$watch(function() {
                    return vm.loading;
                }, function() {
                    if(!vm.loading) {
                        updateResults();
                        deferred.resolve(vm.matches);
                        unbindWatch();
                    }
                });
            } else {
                /* For searches where search source is loaded already */
                updateResults();
                deferred.resolve(vm.matches);
            }
            /* reset timeout variable after timeout function has completed */
            timeout = null;
        });
        
        return deferred.promise;
    }
    function updateResults() {
        vm.matches.length = 0;
        var filterResults;
        if(vm.viewValue.length >= vm.minLength) {
            if(angular.isDefined(vm.customFilter) && vm.customFilter === 'false') {
                filterResults = vm.source;
            }
            else if(!angular.isDefined(vm.customFilter) || !$injector.has(vm.customFilter + 'Filter')) {
                filterResults = $filter('filter')(vm.source, vm.viewValue)
            }
            else {
                filterResults = $filter(vm.customFilter)(vm.source, vm.viewValue)
            }
            Array.prototype.push.apply(vm.matches, filterResults);
        }
        
    }
    function addSelectedItem($item, $model, $label, $event) {
        if(angular.isDefined(vm.multiSelect) && vm.multiSelect === 'true') {
            vm.selectedItems.push($item);
        }
        if(typeof vm.onSelect === 'function') {
            vm.onSelect({item: $item, model: $model, label: $label, event: $event});
        }
    }
    function removeSelectedItem(index, data) {
        vm.selectedItems.splice(index, 1);
        if(typeof vm.onRemoveItem === 'function') {
            vm.onRemoveItem({item: data});
        }
    }
    function registerSelectedItem() {
        return {
            getOptions: function() {
                return {
                    template: vm.selectedItemTemplate || 'predictiveSearch/selectedItem/default.html',
                    displayProperty: vm.selectedItemDisplayProperty
                };
            },
            removeSelectedItem: removeSelectedItem
        };
    }
}