(function($) {
    // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
    function parse_csv( strData, strDelimiter ){
        strDelimiter = (strDelimiter || ",");

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

        var arrData = [{}];
        var arrMatches = null;

        while (arrMatches = objPattern.exec( strData )) {
                var strMatchedDelimiter = arrMatches[ 1 ];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If it does not, then we know
                // that this delimiter is a row delimiter.
                if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);
                    first = false;
                    i = 0;
                }
                
                if (arrMatches[2]) {
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

                if (first) {
                    headers.push(strMatchedValue);
                } else {
                    arrData[ arrData.length - 1 ][headers[i]] = strMatchedValue;
                }
                
                i += 1;
        }

        return( arrData );
    }
    
    var methods = {
        init: function(options) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('boiler');
                
                if (!data) {
                    $this.data('boiler', options);
                    
                    $.ajax({
                        url: options["template_url"],
                        jsonpCallback: "boilertemplate",
                        dataType: "jsonp",
                        success: function(template_data) {
                            options["template"] = template_data;
                            $this.data('boiler', options);
                                                       
                            $.ajax({
                                url: options["data_url"],
                                jsonpCallback: "boilerdata",
                                dataType: "jsonp",
                                success: function(source_data) {
                                    // Handle CSV
                                    if (typeof(source_data) == 'string') {
                                        source_data = { "items": parse_csv(source_data) };
                                    }
                                    
                                    var html = Mustache.to_html(options["template"], source_data);
                                    var content = $(html);

                                    $this.empty();
                                    $this.append(content);
                                    
                                    if ("repeat" in options && options["repeat"] != 0) {
                                         $this.everyTime(options["repeat"], function() {
                                             $.ajax({
                                                 url: options["data_url"],
                                                 jsonpCallback: "boilerdata",
                                                 dataType: "jsonp",
                                                 success: function(source_data) {
                                                     console.log("Updating!");
                                                     
                                                     // Handle CSV
                                                     if (typeof(source_data) == 'string') {
                                                         source_data = { "items": parse_csv(source_data) };
                                                     }
                                                         
                                                     var html = Mustache.to_html(options["template"], source_data);
                                                     var content = $(html);

                                                     $this.empty();
                                                     $this.append(content);
                                                 }
                                             });
                                         });
                                     }
                                }
                            });
                        }
                    });
                }
            });
        },
        destroy: function() {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('boiler');
                
                if ("repeat" in data && data["repeat"] != 0) {
                    $this.stopTimer();
                }
                
                data.boiler.remove();
                $this.removeData('boiler');
            });
        }
    };
    
    $.fn.boiler = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.boiler');
        }
    }
})(jQuery);