document.write('<div id="boiler-room"></div>');

// http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
            (
                    // Delimiters.
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                    // Quoted fields.
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                    // Standard fields.
                    "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );
            
    var first = true;
    var headers = [];
    var i = 0;

    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [{}];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;

    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                    strMatchedDelimiter.length &&
                    (strMatchedDelimiter != strDelimiter)
                    ){

                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push( [] );
                    first = false;
                    i = 0;

            }


            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    var strMatchedValue = arrMatches[ 2 ].replace(
                            new RegExp( "\"\"", "g" ),
                            "\""
                            );

            } else {

                    // We found a non-quoted value.
                    var strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            if (first) {
                headers.push(strMatchedValue);
            } else {
                arrData[ arrData.length - 1 ][headers[i]] = strMatchedValue;
            }
            
            i += 1;
    }

    // Return the parsed data.
    return( arrData );
}

var boiler_template;
var boiler_data;

function got_data(data, text_status, request) {
    if (typeof(data) == 'string') {
        data = { "items": CSVToArray(data) };
    }
    
    boiler_data = data;
    
    var html = Mustache.to_html(boiler_template, boiler_data);
    var content = jQuery(html);
    
    jQuery("#boiler-room").empty();
    jQuery("#boiler-room").append(content);
}

function got_template(data, text_status, request) {
    boiler_template = data;

    var dataType;
    
    if (/json$/.test(boiler_data_url)) {
        dataType = "json";
    } else {
        dataType = "text";
    }
    
    jQuery(document).ready(function() {
        jQuery.ajax({
          url: boiler_data_url,
          success: got_data,
          dataType: dataType
        });
    });
}

jQuery(document).ready(function() {
    jQuery.ajax({
      url: boiler_template_url,
      success: got_template,
      dataType: 'html'
    });
});