import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { TasksLists } from 'meteor/igoandsee:tasks-lists-collection';

import './taskListModal.html';

Template.taskListModal.onCreated(function() {

	this.textSearch = new ReactiveVar();
	this.textSearch.set('');
});

Template.taskListModal.rendered = function() {
	$('#inputModal').on('input', (e) => {
		let text = $('#inputModal').val();
		console.log('Word: ' + text);
		this.textSearch.set(text);
	});
}

Template.taskListModal.helpers({

	getTaskListToSelect() {
		//Que locacion se esta editando
		let locationId = Session.get('EDITING_LOCATION') || null;
		if (!locationId) {
			return [];
		}

		//Si no hay locaciones no mostrar nada
		let allLocations = Session.get('ARRAY_LOCATIONS') || [];
		if (allLocations.length == 0) {
			return [];
		}

		let locationIndex = allLocations.findIndex( (location) => location._id == locationId );
		let location = allLocations[locationIndex];
		if (!location) {
			return [];
		}
		// IDS de las listas que estan siendo usadas
		let listsIds = location.lists.map( (list) => list._id );

		let tasksLists = TasksLists.find({_id: {$nin:listsIds}}).fetch();
		let textSearch = Template.instance().textSearch.get().trim().toLowerCase();

		if (textSearch == '') {
			return tasksLists;
		}

		return tasksLists.filter((list) => {
			return list.name.toLowerCase().includes(textSearch);
		});
	}

});
