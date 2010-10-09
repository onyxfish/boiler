(function($) {
    // From: http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
    function parse_csv( data, delimiter ){
        delimiter = (delimiter || ",");

        var regex = new RegExp(
                (
                        // Delimiters.
                        "(\\" + delimiter + "|\\r?\\n|\\r|^)" +

                        // Quoted fields.
                        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                        // Standard fields.
                        "([^\"\\" + delimiter + "\\r\\n]*))"
                ),
                "gi"
                );
                
        var first = true;
        var headers = [];
        var i = 0;

        var results = [{}];
        var matches = null;

        while (matches = regex.exec( data )) {
                var matched_delimiter = matches[ 1 ];

                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If it does not, then we know
                // that this delimiter is a row delimiter.
                if (matched_delimiter.length && (matched_delimiter != delimiter)) {
                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    results.push([]);
                    first = false;
                    i = 0;
                }
                
                if (matches[2]) {
                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    var matched_value = matches[ 2 ].replace(
                            new RegExp( "\"\"", "g" ),
                            "\""
                            );
                } else {
                    // We found a non-quoted value.
                    var matched_value = matches[ 3 ];
                }

                if (first) {
                    headers.push(matched_value);
                } else {
                    results[ results.length - 1 ][headers[i]] = matched_value;
                }
                
                i += 1;
        }

        return( results );
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
                        cache: false,
                        success: function(template_data) {
                            options["template"] = template_data;
                            $this.data('boiler', options);
                                                       
                            $.ajax({
                                url: options["data_url"],
                                dataType: "jsonp",
                                cache: false,
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
                                                 dataType: "jsonp",
                                                 cache: false,
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
