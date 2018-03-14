import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import './alertGemba.html';

Template.alertGemba.rendered = function(){
	
	$('#alertGemba').modal({
    closable  : true,
    onDeny    : function(){
      return true;
    },
    onApprove : function() {
      return true;
    }
  }).modal();

};