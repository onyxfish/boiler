(function($) {
    var methods = {
        init: function(options) {
            return this.each(function() {
                var $this = $(this);
                var data = $this.data('boiler');
                
                if (!data) {
                    $this.data('boiler', options);
                    
                    $.ajax({
                        url: options["template_url"],
                        jsonpCallback: "boiltemplate",
                        dataType: "jsonp",
                        success: function(template_data) {
                            options["template"] = template_data;
                            $this.data('boiler', options);
                            
                            if ("repeat" in options && options["repeat"] != 0) {
                                 $this.everyTime(options["repeat"], function() {
                                     $.ajax({
                                         url: options["data_url"],
                                         jsonpCallback: "boildata",
                                         dataType: "jsonp",
                                         success: function(source_data) {
                                             console.log("Updating!");
                                             var html = Mustache.to_html(options["template"], source_data);
                                             var content = $(html);

                                             $this.empty();
                                             $this.append(content);
                                         }
                                     });
                                 });
                             } else {                             
                                $.ajax({
                                    url: options["data_url"],
                                    jsonpCallback: "boildata",
                                    dataType: "jsonp",
                                    success: function(source_data) {
                                        var html = Mustache.to_html(options["template"], source_data);
                                        var content = $(html);

                                        $this.empty();
                                        $this.append(content);
                                    }
                                });
                            }
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