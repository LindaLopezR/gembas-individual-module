import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { Categories } from 'meteor/igoandsee:categories-collection';
import { Locations } from 'meteor/igoandsee:locations-collection';

import moment from 'moment';

import './alerts/alerts.js';
import './locations/locations.js';
import './tasks/tasks.js';
import './taskLists/taskLists.js';
import './gembas.html';

const MODE_NEW   = Symbol('mode_new');
const MODE_EDIT  = Symbol('mode_edit');
const MODE_CLONE = Symbol('mode_clone');

Template.gembas.onCreated(function(){

  this.mode = new ReactiveVar();
  this.mode.set(MODE_NEW);

  this.showTimes = new ReactiveVar();
  this.showTimes.set(true);

  this.showStatus = new ReactiveVar();
  this.showStatus.set(false);

  Session.set('ARRAY_LOCATIONS',[]);
  Session.set('EDITING_LOCATION', null);
  Session.set('EDIT_MODE', true);

});

Template.gembas.onDestroyed(function () {
	Session.set('EDIT_MODE', false);
});

Template.gembas.rendered = function(){

  $('#loadingGemba').hide();

  initComponents();

  let periodical = true;
  let mode = setAndGetMode(this);
  switch(mode) {
    case MODE_EDIT :
      periodical = this.data.periodical;
      fillData(this.data, true, periodical);
      break;
    case MODE_CLONE :
      periodical = this.data.periodical;
      fillData(this.data, false, periodical);
      break;
  };

  if (mode != MODE_NEW) {
    this.showTimes.set(periodical);
    this.showStatus.set(periodical);
  }

  setFormValidator(periodical);

};

Template.gembas.helpers({

  allLocations() {
    return Session.get('ARRAY_LOCATIONS') || [];
  },

  getCategories() {
    return Categories.find();
  },

  showSubmit() {
    let locations = Session.get('ARRAY_LOCATIONS') || [];
    return locations.length > 0;
  },

  showTasks() {
    let selectedLocation = Session.get('EDITING_LOCATION') || null;
    if (selectedLocation) {
      let locations = Session.get('ARRAY_LOCATIONS') || [];
      let show = false;
      let mapIds =  locations.map((location) => location._id);
      return mapIds.includes(selectedLocation);
    }
    return false;
  },

  getTitle() {
    let mode = Template.instance().mode.get();
    switch(mode) {
      case MODE_NEW :
        return TAPi18n.__('new_gemba_walk');
      case MODE_EDIT :
        return TAPi18n.__('edit_gemba_walk');
      case MODE_CLONE :
        return TAPi18n.__('new_gemba_walk');
    };
  },

  showTimes() {
    return Template.instance().showTimes.get();
  },

  showEnableDisable() {
    return Template.instance().showStatus.get();
  }

});

Template.gembas.events({

  'change [name=descriptionCheck]'(e) {

    console.log('Cambio');

    let periodical = $("[name=descriptionCheck]:checked").val() === 'periodical';
    setFormValidator(periodical);

    Template.instance().showTimes.set(periodical);

    if (Template.instance().mode.get() != MODE_NEW) {
      console.log('Cambio 2');
      Template.instance().showStatus.set(periodical);

      if (this.periodical && periodical) {
        console.log('Volvio a periodico');
        setTimeout(() => {
          initComponents();
          fillPeriodicalFields(this);
        }, 200);
      }

      if (!this.periodical && periodical) {
        console.log('Se volvio a periodico');
        setTimeout(() => {
          initComponents();
        }, 200);
      }

    } else if (periodical) {
      setTimeout(() => {
        initComponents();
      }, 200);
    } else {
      console.log('Cambio 4');
    }

    setTimeout(() => {
      $('.ui.checkbox').checkbox();
    }, 300);

  },

  'change #selectRepeat2'(e) {
    e.preventDefault();
    let val = ($('#selectRepeat2').dropdown('get value'))[0] || "1";
    Session.set('LIMIT', Number(val));
  },

  'submit #formNewGembaWalk'(e, template) {

    console.log('Submit form new gemba');

     let mode = Template.instance().mode.get();

      e.preventDefault();

      let locations = Session.get('ARRAY_LOCATIONS') || [];
      if(locations.length == 0){
        Session.set('ERROR_MESSAGE',TAPi18n.__('needs_location'));
        $('#modalError').modal('show');
        return;
      }

      let allLocationsWithTasks = true;

      locations.forEach(function(location) {
        if (location.tasks.length == 0 && location.lists.length == 0) {
          allLocationsWithTasks = allLocationsWithTasks && false;
          //console.log('Sin tareas: ', location.tasks);
          let locationName = Locations.findOne(location._id).name;
          Session.set('ERROR_MESSAGE', locationName + ' needs tasks');
          $('#modalError').modal('show');
        }
      });

      //Hack because we cant break forEach
      if (!allLocationsWithTasks) {
        return;
      }

      let repeatNumber = $('#selectRepeat1').val();
      repeatNumber = Number(repeatNumber);

      if(repeatNumber < 1){
        Session.set('ERROR_MESSAGE',TAPi18n.__('invalid_repeat'));
        $('#modalError').modal('show');
        return;
      }

      let timeToComplete = $('#pickerTimeToComplete').val();
      timeToComplete = Number(timeToComplete);

      if(timeToComplete < 1){
        Session.set('ERROR_MESSAGE',TAPi18n.__('invalid_time_to_complete'));
        $('#modalError').modal('show');
        return;
      }

      if (mode != MODE_EDIT) {
        if(new Date($('#pickerStartsOn').val()).getTime() < Date.now()){
          Session.set('ERROR_MESSAGE',TAPi18n.__('invalid_start_date'));
          $('#modalError').modal('show');
          return;
        }
      }

      if($('#exc3').is(':checked')){

        if($('#exc4').val().trim() == ''){
          Session.set('ERROR_MESSAGE',TAPi18n.__('invalid_score'));
          $('#modalError').modal('show');
          return;
        }

        let nToTest = Number($('#exc4').val());
        if(isNaN(nToTest)){
          Session.set('ERROR_MESSAGE',TAPi18n.__('invalid_score'));
          $('#modalError').modal('show');
          return;
        }else if(nToTest > 100 || nToTest < 0){
          Session.set('ERROR_MESSAGE',TAPi18n.__('invalid_score'));
          $('#modalError').modal('show');
          return;
        }
      }

      // let sendAlertTo = $('.checkAlertSupervisor:checked').map(function() {
      //   return $(this).data('id');
      // }).toArray();

      let data = getAllData();
      // data.sendAlertTo = sendAlertTo;

      if( getMinutesFromData(data.repeat1, data.repeat2) <
        getMinutesFromData(data.timeToComplete1, data.timeToComplete2) ){
        Session.set('ERROR_MESSAGE',TAPi18n.__('time_to_complete_less'));
        $('#modalError').modal('show');
        return;
      }

      $('#loadingGemba').show();

      data.startsOn = (new Date(data.startsOn)).getTime();
      data.locations = locations;
      data.timeToComplete = getMinutesFromData(data.timeToComplete1, data.timeToComplete2);

      console.log(data);

      //Create

      switch(mode) {
        case MODE_NEW :
          createGembaWalk(data);
          break;
        case MODE_EDIT :
          data.active = $('#activeGemba').is(':checked');
          editGembaWalk(data, template.data._id);
          break;
        case MODE_CLONE :
          cloneGembaWalk(data, template.data._id);
          break;
      };

   },

   'click #btnCancelGemba'(e) {
      e.preventDefault();
      Session.set('EDIT_MODE', false);
      Router.go('audits');
   }

});

let getAllData = function(){
  return {
    name : $('input[name="name"]').val(),
    description : $('textarea[name="description"]').val(),
    category : (($('#selectCategory').dropdown('get value'))[0] || ""),
    startsOn : $('#pickerStartsOn').val(),
    timeToComplete1 : $('#pickerTimeToComplete').val(),
    timeToComplete2 : (($('#selectComplete').dropdown('get value'))[0] || ""),
    repeat1 : $('#selectRepeat1').val(),
    repeat2 : (($('#selectRepeat2').dropdown('get value'))[0] || ""),
    periodical : ($("[name=descriptionCheck]:checked").val() == 'periodical'),
    exceptions : {
      exc1 : $('#exc1').is(':checked'),
      exc2 : $('#exc2').is(':checked'),
      exc3 : $('#exc3').is(':checked'),
      exc4 : $('#exc4').val()
    }
  };

};

let fillData = function(gembaWalk, isEdit, periodical) {

  console.log('Gemba Walk: ', gembaWalk);

  if (isEdit) {
    $('#name').val(gembaWalk.name);
    $('#description').val(gembaWalk.description);
    setTimeout(function() {

      // gembaWalk.sendAlertTo.forEach(function(userId) {
      //   $(`.checkAlertSupervisor[data-id="${userId}"]`).prop('checked', true);
      // });
      $('#activeGemba').prop('checked', gembaWalk.active);

    }, 100);

  }

  $('#selectCategory').dropdown('set selected', gembaWalk.category);

  if (periodical)  {
    fillPeriodicalFields(gembaWalk);
  } else {
    $('[name="descriptionCheck"][value="onDemmand"]').prop('checked',true);
  }

  var exceptions = gembaWalk.exceptions;
  if(exceptions.notDone.status == true) $('#exc1').prop('checked', true);
  if(exceptions.late.status) $('#exc2').prop('checked', true);
  if(exceptions.score.status) $('#exc3').prop('checked', true);
  $('#exc4').val(exceptions.score.number)

  parseLocationsAndTaks(gembaWalk.locations);

};

function fillPeriodicalFields(gembaWalk) {

  console.log('Fill: ', gembaWalk);

  // $('#selectOwner').dropdown('set selected', gembaWalk.owner);

  let dateString = moment(gembaWalk.date).format('MM/DD/YYYY HH:mm');
  $('#pickerStartsOn').datetimepicker({value:dateString});

  let ttc = fromMinutes(gembaWalk.timeToComplete);
  $('#pickerTimeToComplete').val(ttc.number);
  $('#selectComplete').dropdown('set selected',ttc.period);

  $('#selectRepeat1').val(gembaWalk.repeat.number);
  $('#selectRepeat2').dropdown('set selected', gembaWalk.repeat.period);

  $('#activeGemba').prop('checked', gembaWalk.active);
}

function parseLocationsAndTaks(remoteLocations) {

  console.log('Parse: ', remoteLocations);
  let locations = remoteLocations.map((remoteLocation) => {
    return {
      _id : remoteLocation._id,
      qr  : remoteLocation.scanCode,
      tasks : remoteLocation.tasks,
      lists : (remoteLocation.lists || [])
    };
  });

  Session.set('ARRAY_LOCATIONS', locations);
}

function fromMinutes(minutes){

  var data = {
    number : minutes,
    period : 'A'
  };

  //Si es menor a 60 (1 hora) entonces es minutos
  if(minutes < 60){
    data.period = 'minutes';
    return data;
  }

  //Si es menor a 1440 (1 dia) entonces es horas
  if(minutes < 1440){
    data.period = 'hours';
    data.number = minutes / 60; //Convertir a horas
    return data;
  }

  //si es menor a 5760 (1 semana) entonces es dia
  if(minutes < 10080){
    data.period = 'days';
    data.number = minutes / 1440; //Convertir a dias
    return data;
  }

  //Si es menor a 43200 (1 mes) entonces es semana
  if(minutes < 43200){
    data.period = 'weeks';
    data.number = minutes / 10080; //Convertir a semanas
    return data;
  }

  //Si no es por meses
  //No ponerlos en flotantes
  if ( (minutes/43200) % 1 != 0 ) {
    data.period = 'weeks';
    data.number = minutes/10080;
  } else {
    data.period = 'months';
    data.number = minutes/43200; //Convertir a meses
  }

  return data;

};

let getMinutesFromData = function(repeat1, repeat2){

  let minutes = Number(repeat1);
  switch(repeat2){
    case 'hours':
     return minutes * 60;
    case 'days':
      return minutes * 60 * 24;
     case 'weeks':
       return minutes * 60 * 24 * 7;
     case 'months':
       return minutes * 60 * 24 * 30;
     case 'minutes':
       return minutes * 1;
     default :
       return minutes * 1;
    };

};

function setAndGetMode(template) {
  let route = Router.current().route.getName();
  if (route.includes('edit')) {
    template.mode.set(MODE_EDIT);
    return MODE_EDIT;
  } else if (route.includes('clone')) {
    template.mode.set(MODE_CLONE);
    return MODE_CLONE;
  } else {
    template.mode.set(MODE_NEW);
    return MODE_NEW;
  }
}

function createGembaWalk(data) {

  Meteor.call('createGembaWalk', data, function(err, result){
     $('#loadingGemba').hide();
     if(err){
        let message = err.reason || TAPi18n.__('error_saving_audit');
        if(err.error == 'out-of-shift'){
           message = err.reason;
        }
        Session.set('ERROR_MESSAGE', message);
        $('#modalError').modal('show');
     }else{
        console.log('Gemba created');
        Session.set('EDIT_MODE', false);
        Router.go('audits');
     }
  });

};

function editGembaWalk(data, gembaId) {

  console.log('Gemba Id: ', gembaId);
  data._id = gembaId;

  Meteor.call('editGembaWalk', data, function(err, result){
     $('#loadingGemba').hide();
     if(err){
        let message = err.reason || TAPi18n.__('error_saving_audit');
        if(err.error == 'out-of-shift'){
          message = err.reason;
        }
        Session.set('ERROR_MESSAGE', message);
        $('#modalError').modal('show');
     }else{
        console.log('Gemba created');
        Session.set('EDIT_MODE', false);
        Router.go('audits');
     }
  });

};

function cloneGembaWalk(data, gembaId) {
  console.log('Gemba Id: ', gembaId);
  Meteor.call('createGembaWalk', data, function(err, result){
    $('#loadingGemba').hide();
    if(err){
      let message = err.reason || TAPi18n.__('error_saving_audit');
      if(err.error == 'out-of-shift'){
        message = err.reason;
      }
      Session.set('ERROR_MESSAGE', message);
      $('#modalError').modal('show');
    }else{
      console.log('Gemba created');
      Session.set('EDIT_MODE', false);
      Router.go('audits');
    }
  });

};

function initComponents() {
  console.log('Initing componentes');
  $('.ui.checkbox').checkbox();
  $('.ui.dropdown').dropdown();
  $('#pickerStartsOn').datetimepicker();
}

function setFormValidator(periodical) {

  let commonFields = {
    name: {
       identifier  : 'name',
       rules: [
          {
             type   : 'empty',
             prompt : TAPi18n.__('enter_gemba_walk')
          }
       ]
    },
    category: {
       identifier  : 'category',
       rules: [
          {
             type   : 'empty',
             prompt : TAPi18n.__('enter_category')
          }
       ]
    },
  };

  let periodicalFields = {
    startsOn: {
       identifier  : 'startsOn',
       rules: [
          {
             type   : 'empty',
             prompt : TAPi18n.__('please_date_start')
          }
       ]
    },
    timeToComplete: {
       identifier  : 'timeToComplete',
       rules: [
          {
             type   : 'empty',
             prompt : TAPi18n.__('please_time_complete')
          },
          {
             type   : 'integer',
             prompt : TAPi18n.__('please_valid_time')
          }
       ]
    },
    repeat1: {
       identifier  : 'repeat1',
       rules: [
          {
             type   : 'integer',
             prompt : TAPi18n.__('please_valid_repeat')
          },
          {
             type   : 'empty',
             prompt : TAPi18n.__('please_select_repeat')
          }
       ]
    },
    repeat2: {
       identifier  : 'repeat2',
       rules: [
           {
             type   : 'empty',
             prompt : TAPi18n.__('please_select_period')
           }
       ]
     }
  };

  let fields = commonFields;

  if (periodical) {
    fields = Object.assign(commonFields, periodicalFields);
  }

  $('#formNewGembaWalk').form({
    inline : true,
    on     : 'blur',
    fields: fields
  });

}
