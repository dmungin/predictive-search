

angular.module('example', [
	'ui.bootstrap',
	'dmPredictiveSearch.directive'

	])
	.controller('ExampleController', ExampleController);



function ExampleController() {
	var vm = this;
	vm.searchData = [
		'Bengals',
		'Steelers',
		'Browns',
		'Ravens',
		'Patriots',
		'Jets',
		'Dolphins',
		'Giants',
		'Packers',
		'Bears',
		'Vikings',
		'49ers',
		'Chargers',
		'Raiders'
	];
	vm.selectedSearchItems = [];
	vm.searchLoading = false;
	vm.onSelect = onSelect;
	vm.onChange = onChange;
	vm.onRemove = onRemove;
	vm.searchValidator = searchValidator;

	function onSelect(item, model, label, event) {

	}
	function onChange(value) {
		
	}
	function onRemove(item) {

	}
	function searchValidator(value) {
		return true;
	}

	
}