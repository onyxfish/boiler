document.write('<div id="boiler-room"></div>');

var boiler_template;
var boiler_data;

function boildata(data, text_status, request) {
    boiler_data = data;
    
    var html = Mustache.to_html(boiler_template, boiler_data);
    var content = jQuery(html);
    
    jQuery("#boiler-room").empty();
    jQuery("#boiler-room").append(content);
}

function boiltemplate(data, text_status, request) {
    boiler_template = data;
    
    jQuery(document).ready(function() {
        jQuery.ajax({
          url: boiler_data_url,
          dataType: "jsonp"
        });
    });
}

jQuery(document).ready(function() {
    jQuery.ajax({
      url: boiler_template_url,
      dataType: 'jsonp'
    });
});