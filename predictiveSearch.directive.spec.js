
describe('Predictive Search Directive', function() {
	var scope, compile, directiveElem;
	beforeEach(function() {
		module('predictiveSearch.directive');
	});
	beforeEach(inject(function ($rootScope, $compile) {
		scope = $rootScope.$new();
		compile = $compile;
		scope.name = 'name value';
		scope.searchPlaceholder = 'placeholder value';
		scope.customFilter = undefined;
		scope.source = [];
		scope.onChange = jasmine.createSpy('onChange');
		scope.onSelect = jasmine.createSpy('onSelect');
		scope.clearOnBlur = jasmine.createSpy('clearOnBlur');
		scope.customTemplate = undefined;
		scope.minLength = '3';
		scope.viewValue = undefined;
		scope.validator = jasmine.createSpy('validator').and.returnValue(true);
		scope.loading = false;
		scope.disabledSpinner = true;
		scope.matchTemplate   = undefined;
		scope.multiSelect = true;
		scope.selectedItems = undefined;
		scope.selectedItemTemplate = undefined;
		scope.onRemoveItem = jasmine.createSpy('onRemoveItem');
		scope.selectedItemDisplayProperty = undefined;

		directiveElem = getCompiledElement();
	}));
	function getCompiledElement() {
		var element = angular.element('<rm53-predictive-search '+
			'name="{{name}}" '+
			'search-placeholder="{{searchPlaceholder}}" '+
			'custom-filter="{{customFilter}}" '+
			'source="source" '+
			'on-change="onChange()" '+
			'on-select="onSelect()" '+
			'clear-on-blur="{{clearOnBlue}}" '+
			'custom-template="{{customTemplate}}" '+
			'min-length="{{minLength}}" '+
			'view-value="viewValue" '+
			'validator="validator()" '+
			'loading="loading" '+
			'disabled-spinner="{{disabledSpinner}}" '+
			'match-template="{{matchTemplate}}" '+
			'multi-select="{{multiSelect}}" '+
			'selected-items="selectedItems" '+
			'selected-item-template="{{selectedItemTemplate}}" '+
			'on-remove-item="onRemoveItem()" '+
			'selected-item-display-property="{{selectedItemDisplayProperty}}"></rm53-predictive-search>');
		var compiledElement = compile(element)(scope);
		scope.$digest();
		return compiledElement;
	}
	/* Begin Tests */
	it('should create a wrapper div', function() {
		expect(directiveElem.find('div.rm53-predictive-search')).toBeDefined();
	});
	it('should create an input that implements uib-typeahead', function() {
		expect(directiveElem.find('input[uib-typeahead]')).toBeDefined();
	});

	it('should bind isolate scope properties to controller', function() {
		var directiveScope = directiveElem.isolateScope();
		expect(directiveScope.psvm.name).toEqual(scope.name);
	});
});
