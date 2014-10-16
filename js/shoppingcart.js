"use strict"; 
/***** Load CSS and scripts based upon browser capabilities using Modernizr.js *****/
Modernizr.load({
    test: Modernizr.mq('only all'),
    yep: 'css/modern.css'
}); 
$('.buttonQuantity, .remove').css('display', 'block');


(function($) {
    $.basket = function(el, options) {
        var defaults = {
            VATRate: '20',
            EndURL: '',
            CurrencySymbol: '£',
            maxItems: 10 
        };
        var plugin = this;
        plugin.settings = {};
        var init = function() {
                plugin.settings = $.extend({}, defaults, options);
                plugin.el = el;
                var enterKeyCode = 13; 
                
                $(".buttonQuantity, .remove").on("keypress", function(e) {
                    if (e.which == enterKeyCode) {
                        $(this).trigger('click');
                    }
                });
                $(".buttonQuantity").on("click", function() {
                    updateQty($(this));
                }).on("keypress", function(e) {
                    if (e.which == enterKeyCode) {
                        e.preventDefault();
                    }
                });
                $(".left input").on("keypress", function(e) {
                    if (e.which == enterKeyCode) {
                        e.preventDefault();
                    }
                    $(this).allowNumericOnly();
                }).on('blur', function() {
                    var v = parseInt($(this).val(), 10);
                    $(this).val(v);
                    if (!v) $(this).val(0);
                    if ((v) < 0) $(this).val(0);
                    if ((v) > plugin.settings.maxItems) $(this).val(plugin.settings.maxItems);
                    updateTotals();
                });
                $(".remove").on("click", function() {
                    removeRow($(this));
                }).on("keypress", function(e) {
                    if (e.which == enterKeyCode) {
                        e.preventDefault();
                    }
                });
                $("#buyNow").on("click", function(e) {
                    e.preventDefault();
                    submit();
                }); 
            }; 
          
        var fetchJSONData = function() {
                var id, quantity, jsonString = "";
                $(".productItem").each(function() {
                    id = $(this).find('.itemId').find('input').val();
                    quantity = $(this).find('.quantity').val();
                    if (quantity > 0) {
                        jsonString += '{"id":"' + id + '","quantity":"' + quantity + '"},';
                    }
                });
                if (jsonString !== "") {
                    return "{[" + jsonString.substr(0, jsonString.length - 1) + "]}";
                }
            };
        var updateQty = function(obj) {
                var inp = $(obj).closest('.quantityWrap').find('input');
                var currentVal = parseInt($(inp).val(), 10);
                obj.html() == "+" ? $(inp).val(currentVal + 1) : $(inp).val(currentVal - 1);
                var v = parseInt($(inp).val(), 10);
                if ((v) < 0) $(inp).val(0);
                if ((v) > plugin.settings.maxItems) $(inp).val(plugin.settings.maxItems);
                updateTotals();
            };
        var removeRow = function(obj) { 
                var Row = $(obj).closest('.productItem');
                Row.remove();
                if (updateTotals() === false) {
					$("#buyNow").attr("disabled", "disabled");
                    $('#loading').html('Your basket is empty.');
                }
            };
        var updateTotals = function() {
                var sum = 0,
                    rowObjTot, rowQty, rowTotal, unitPrice;
                if ($(".productItem").length === 0) {
                    var emptVal = plugin.settings.CurrencySymbol + "0.00";
                    $('#subTotal,#VATAmount,#grandTotal').html(emptVal);
                    return false;
                }
                $(".productItem").each(function() {
                    rowObjTot = $(this).find('.rowTotal');
                    unitPrice = $(this).find('.unitPrice').html().replace(plugin.settings.CurrencySymbol, '');
                    rowQty = parseInt($(this).find('.quantity').val(), 10);
                    if (!parseInt(rowQty, 10)) rowQty = 0;
                    rowTotal = unitPrice * rowQty;
                    sum += parseFloat(rowTotal);
                    rowObjTot.html(plugin.settings.CurrencySymbol + rowTotal.toFixed(2));
                });
                $('#subTotal').html(plugin.settings.CurrencySymbol + sum.toFixed(2));
                var VAT = (plugin.settings.VATRate / 100) * sum;
                $('#VATAmount').html(plugin.settings.CurrencySymbol + VAT.toFixed(2));
                $('#grandTotal').html(plugin.settings.CurrencySymbol + (sum + VAT).toFixed(2));
                return true;
            };
        var submit = function() { 
				$("#loading").html('<img src="img/ajax-loader.gif" /> loading...');
				 $("#loading").show();
                var jsonData = fetchJSONData();
                try {
                    var req = $.ajax({
                        url: plugin.settings.EndURL,
                        type: "GET",
                        data: jsonData,
                        dataType: "json",
                        contentType: "application/json; charset=utf-8"
                    });
                    req.done(function(msg) {
                        $('#loading').hide();
						alert('Thank you for your order.');
						
                    });
                    req.fail(function(jqXHR, textStatus) {
                       $('#loading').hide();
					   alert('Thank you for your order.');
					   
                    });
                } catch (error) {
					$('#loading').hide();
                    var text = "There was an error on this page.\n\n";
                    text += "Error description: " + error.message + "\n\n";
                    alert(text);
                }
            };
            init();
    };
})(jQuery);
jQuery.fn.allowNumericOnly = function() {
    return this.each(function() {
        $(this).keydown(function(evt) {
            var charCode = (evt.which) ? evt.which : event.keyCode;
            if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
            return true;
        });
    });
};