import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { Locations } from 'meteor/igoandsee:locations-collection';

import './locationsModal.html';

Template.locationsModal.onCreated(function() {

  this.textSearch = new ReactiveVar();
  this.textSearch.set('');
});

Template.locationsModal.rendered = function() {
  $('#inputModalLocation').on('input', (e) => {
    let text = $('#inputModalLocation').val();
    console.log('Word: ' + text);
    this.textSearch.set(text);
  });
}

Template.locationsModal.helpers({

  getLocationsToSelect() {
    let locations = [];
    try {
      let selectedLocations = Session.get('ARRAY_LOCATIONS') || [];
      let ids = selectedLocations.map((location) => location._id );

      locations = Locations.find({_id: { $nin:ids}}).fetch();
      let textSearch = Template.instance().textSearch.get().trim().toLowerCase();

      if(textSearch == '') {
        return locations;
      }

      return locations.filter((location) => {
        return location.name.toLowerCase().includes(textSearch);
      });

    } catch(error) {
      console.log(error);
      alert(JSON.stringify(error));
    }
    
  }

});
