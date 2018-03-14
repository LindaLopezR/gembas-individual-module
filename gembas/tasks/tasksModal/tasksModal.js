import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { Tasks } from 'meteor/igoandsee:tasks-collection';

import './tasksModal.html';

Template.tasksModal.onCreated(function() {

  this.textSearch = new ReactiveVar();
  this.textSearch.set('');
});

Template.tasksModal.rendered = function() {
  $('#inputModalTask').on('input', (e) => {
    let text = $('#inputModalTask').val();
    console.log('Word: ' + text);
    this.textSearch.set(text);
  });
};

Template.tasksModal.helpers({

  getTasksToSelect() {
    let locationId = Session.get('EDITING_LOCATION') || null;
    if (!locationId) {
      return [];
    }

    let allLocations = Session.get('ARRAY_LOCATIONS') || [];
    if (allLocations.length == 0) {
      return [];
    }

    let locationIndex = allLocations.findIndex( (location) => location._id == locationId );
    let location = allLocations[locationIndex];
    if (!location) {
      return [];
    }

    let tasksIds = location.tasks.map( (task) => task._id );

    let listTasks = Tasks.find({_id: {$nin:tasksIds}}).fetch();
    let textSearch = Template.instance().textSearch.get().trim().toLowerCase();

    if (textSearch == '') {
      return listTasks;
    }

    return listTasks.filter((task) => {
      return task.name.toLowerCase().includes(textSearch);
    });
  }

});
