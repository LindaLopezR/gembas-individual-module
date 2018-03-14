import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { Locations } from 'meteor/igoandsee:locations-collection';

import './locationItem.html';

Template.locationItem.rendered = function() {
  $('.ui.checkbox').checkbox();
  let data = this.data;
  let check = $(`.checkQr[data-id="${data._id}"]`)[0];
  check = $(check);

  setTimeout(function() {
    check.prop('checked', data.qr);
  }, 100);

}

Template.locationItem.helpers({

  getLocationName(id) {
    return Locations.findOne(id).name;
  }

});

Template.locationItem.events({

  'click .eliminar'(e) {

    Session.set('OPTIONS_MESSAGE', TAPi18n.__('sure_delete_location'));

    $('#modalOptions').modal({
        closable  : true,
        onApprove() {
          let id = $(e.target).closest('.eliminar').data('id');
          let locations = Session.get('ARRAY_LOCATIONS') || [];
          locations = locations.filter( (location) => location._id != id );
          Session.set('ARRAY_LOCATIONS', locations);
        }

    }).modal('show');

  },

  'click .task-location'(e) {
    let id = $(e.target).data('id');
    Session.set('EDITING_LOCATION', id);
  },

  'click .list-location'(e) {
    let id = $(e.target).data('id');
    Session.set('EDITING_LOCATION', id);
  },

  'change .checkQr'(e) {
    let id = $(e.target).data('id');
    let locations = Session.get('ARRAY_LOCATIONS') || [];

    //TODO forEach?
    locations = locations.map((location) => {
      if (location._id == id) {
        location.qr = $(e.target).is(':checked');
        console.log("Chanege to: ", $(e.target).is(':checked'));
      }
      return location
    });

    Session.set('ARRAY_LOCATIONS', locations);
  }

});
