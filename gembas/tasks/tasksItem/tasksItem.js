import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';

import './tasksItem.html';

Template.tasksItem.events({

  'change .criticalCheckbox'(e) {
    let checkbox = $(e.target).closest('.ui.checkbox');
    let checked = checkbox.checkbox('is checked');
    let taskId = checkbox.data('id');

    let locationId = Session.get('EDITING_LOCATION') || null;

    let allLocations = Session.get('ARRAY_LOCATIONS') || [];
    let locationIndex = allLocations.findIndex( (location) => location._id == locationId );
    let location = allLocations[locationIndex];
    let taskIndex = location.tasks.findIndex( (task) => task._id == taskId );

    allLocations[locationIndex].tasks[taskIndex].critical = checked;
    Session.set('ARRAY_LOCATIONS', allLocations);
  },

  'click .eliminarBtn'(e, template) {
    let taskId = template.data._id;

    let locationId = Session.get('EDITING_LOCATION') || null;

    let allLocations = Session.get('ARRAY_LOCATIONS') || [];
    let locationIndex = allLocations.findIndex( (location) => location._id == locationId );
    let location = allLocations[locationIndex];
    location.tasks = location.tasks.filter( (task) => task._id != taskId );
    allLocations[locationIndex] = location;
    Session.set('ARRAY_LOCATIONS', allLocations);
  }

});

Template.tasksItem.helpers({

  getCurrentLocation() {
    return Session.get('EDITING_LOCATION') || null;
  },

  computedAgain() {
    console.log('Computed again');
    setTimeout(() => {
      let taskId = this._id;

      let locationId = Session.get('EDITING_LOCATION') || null;
      let allLocations = Session.get('ARRAY_LOCATIONS') || [];
      let locationIndex = allLocations.findIndex( (location) => location._id == locationId );
      let location = allLocations[locationIndex];
      let taskIndex = location.tasks.findIndex( (task) => task._id == taskId );

      let isCritical = allLocations[locationIndex].tasks[taskIndex].critical;
      if (isCritical) {
          $('.checkbox[data-id="' + taskId + '"]').checkbox('set checked');
      } else {
          $('.checkbox[data-id="' + taskId + '"]').checkbox('set unchecked');
      }
    }, 100);
  }

});
