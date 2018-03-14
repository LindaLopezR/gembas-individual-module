import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { Locations } from 'meteor/igoandsee:locations-collection';
import { Tasks } from 'meteor/igoandsee:tasks-collection';

import './tasksItem/tasksItem.js';
import './tasksModal/tasksModal.js';
import './tasks.html';

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

Template.tasks.helpers({

	getTasksInLocation() {
		let selectedLocation = getSelectedLocation();
		if (selectedLocation) {
			let tasksIds = selectedLocation.tasks.map( (task) => task._id );
			return  Tasks.find({_id:{$in:tasksIds}});
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

Template.tasks.events({

	'click .add' : function(e) {
		e.preventDefault();

		$('#modalAddTasks').modal({
			closable  : false,
			onDeny() {
				console.log('Deny');
			},
			onApprove() {
				console.log('Approve');
				//Get all selected task
				let selectedLocation = getSelectedLocation();
				if (selectedLocation) {

					let newTasks = $('.checkTask:checked').map(function(){
							return {
								_id : $(this).val(),
								critical : false
							};
					}).toArray();

					selectedLocation.tasks = [...selectedLocation.tasks, ...newTasks];
					replaceLocation(selectedLocation);
				}

			}
		}).modal('show');
	}

});
