import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { Locations } from 'meteor/igoandsee:locations-collection';

import './locationsModal/locationsModal.js';
import './locationItem/locationItem.js'
import './locations.html';

Template.locations.helpers({

	getSelectedLocations : function() {
		return Session.get('ARRAY_LOCATIONS') || [];
	},

});

Template.locations.events({

	'click .add' : function(e) {
		e.preventDefault();
		$('#modalAddLocation').modal({
			closable  : false,
			onDeny() {
				console.log('Deny');
			},
			onApprove() {
				console.log('Approve');
				//Get all selected locations
				let arrayLocations = Session.get('ARRAY_LOCATIONS') || [];
				let newLocations = $('.checkLocation:checked').map(function(){
					return {
						_id : $(this).val(),
						qr  : true,
						tasks : [],
						lists : []
					};
				}).toArray();
				arrayLocations = [...arrayLocations, ...newLocations];
				Session.set('ARRAY_LOCATIONS', arrayLocations);
			}
		}).modal('show');

	}

});
