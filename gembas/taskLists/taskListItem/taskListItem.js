import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import './taskListItem.html';

Template.taskListItem.events({

	'click .eliminarBtn'(e, template) {
		let taskListId = template.data._id;
		let locationId = Session.get('EDITING_LOCATION') || null;
		let allLocations = Session.get('ARRAY_LOCATIONS') || [];
		let locationIndex = allLocations.findIndex( (location) => location._id == locationId );
		let location = allLocations[locationIndex];
		location.lists = location.lists.filter( (list) => list._id != taskListId );
		allLocations[locationIndex] = location;
		Session.set('ARRAY_LOCATIONS', allLocations);
	 }

});
