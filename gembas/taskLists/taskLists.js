import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Locations } from 'meteor/igoandsee:locations-collection';
import { TasksLists } from 'meteor/igoandsee:tasks-lists-collection';

import './taskListItem/taskListItem.js';
import './taskListModal/taskListModal.js';
import './taskLists.html';

function getSelectedLocation() {

	let locationId = Session.get('EDITING_LOCATION') || null;
	if (locationId) {
		let allLocations = Session.get('ARRAY_LOCATIONS') || [];
		let currentLocation =
					allLocations.filter( (location) => location._id == locationId );
		if (currentLocation.length > 0) return currentLocation[0];
	}

	return null;
}

function replaceLocation(locationToReplace) {
	let allLocations = Session.get('ARRAY_LOCATIONS') || [];
	let index =
		allLocations.findIndex( (location) => location._id == locationToReplace._id );
	allLocations[index] = locationToReplace;
	Session.set('ARRAY_LOCATIONS', allLocations);
}

Template.taskLists.helpers({

	getTaskListsInLocation() {
		let selectedLocation = getSelectedLocation();
		if (selectedLocation) {
			let tasksIds = selectedLocation.lists.map( (list) => list._id );
		 	return  TasksLists.find({_id:{$in:tasksIds}});
		}
		return [];
	},

	getSelectedLocationName() {
		let selectedLocation = getSelectedLocation();
		if (selectedLocation) {
			return Locations.findOne(selectedLocation._id).name;
		}
	}
});

Template.taskLists.events({

	'click .add' : function(e) {
		e.preventDefault();

		$('#modalAddTaskList').modal({
			closable  : false,
			onDeny() {
				console.log('Deny');
			},
			onApprove() {
				console.log('Approve');
				//Get all selected task
				let selectedLocation = getSelectedLocation();
				if (selectedLocation) {

					let newTaskList = $('.checkTask:checked').map(function(){
							return {
								_id : $(this).val(),
							};
					}).toArray();

					console.log('List ids: ', newTaskList);
					selectedLocation.lists = [...selectedLocation.lists, ...newTaskList];
					replaceLocation(selectedLocation);
				}

			}
		}).modal('show');
	}

});
